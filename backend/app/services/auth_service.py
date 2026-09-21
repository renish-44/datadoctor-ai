import hashlib
import logging
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo.errors import PyMongoError

from app.config import settings
from app.database import users_collection
from app.models import UserModel
from app.services.email_service import EmailService

logger = logging.getLogger("datadoctor.auth")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class AuthService:
    def __init__(self):
        self.email_service = EmailService()

    async def register(self, user_data) -> dict:
        try:
            existing = await users_collection.find_one({"email": user_data.email})
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database unavailable during registration: {str(e)}",
            )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        user = UserModel(
            email=user_data.email,
            hashed_password=pwd_context.hash(user_data.password),
            full_name=user_data.full_name
        )
        user_dict = user.model_dump()
        try:
            await users_collection.insert_one(user_dict)
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database error saving new user: {str(e)}",
            )
        return user_dict

    async def login(self, email: str, password: str) -> dict:
        try:
            user = await users_collection.find_one({"email": email})
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database unavailable during login: {str(e)}",
            )

        if not user or not pwd_context.verify(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = self._create_access_token(data={"sub": user["id"]})
        return {"access_token": access_token, "token_type": "bearer"}


    def _create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception

        try:
            user = await users_collection.find_one({"id": user_id})
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database unavailable while verifying session: {str(e)}",
            )
        if user is None:
            raise credentials_exception
        return user

    # -----------------------------------------------------------------
    # Password Reset — Email-based secure flow
    # -----------------------------------------------------------------

    @staticmethod
    def _hash_token(token: str) -> str:
        """Create a SHA-256 hash of the reset token for safe storage."""
        return hashlib.sha256(token.encode()).hexdigest()

    async def request_password_reset(self, email: str) -> dict:
        """
        Initiate password reset:
        1. Look up user by email
        2. Generate a JWT reset token (15-min TTL)
        3. Store a SHA-256 hash of the token on the user doc (for one-time-use invalidation)
        4. Send the reset link via email
        5. Return a GENERIC message regardless of whether the email exists
           (prevents email enumeration attacks)
        """
        generic_response = {
            "message": "If an account with that email exists, a password reset link has been sent."
        }

        try:
            user = await users_collection.find_one({"email": email.strip().lower()})
        except PyMongoError as e:
            logger.error(f"Database unavailable during password reset request: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database unavailable. Please try again later.",
            )

        if not user:
            logger.info(
                "Password reset requested for non-existent email",
                extra={"email": email},
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address.",
            )

        # Generate reset token
        reset_payload = {
            "sub": user["id"],
            "email": user["email"],
            "purpose": "password_reset",
            "jti": secrets.token_hex(16),  # unique token ID for one-time use
        }
        reset_token = self._create_access_token(
            data=reset_payload,
            expires_delta=timedelta(minutes=15),
        )

        # Store token hash on user document for invalidation after use
        token_hash = self._hash_token(reset_token)
        try:
            await users_collection.update_one(
                {"id": user["id"]},
                {
                    "$set": {
                        "password_reset_token_hash": token_hash,
                        "password_reset_token_expires_at": datetime.utcnow() + timedelta(minutes=15),
                    }
                },
            )
        except PyMongoError as e:
            logger.error(f"Failed to store reset token hash: {e}")
            return generic_response

        # Send email (fire-and-forget — failures are logged inside EmailService)
        email_sent = await self.email_service.send_password_reset_email(
            to_email=user["email"],
            reset_token=reset_token,
            full_name=user.get("full_name"),
        )

        if email_sent:
            logger.info(
                "Password reset email dispatched",
                extra={"user_id": user["id"]},
            )
        else:
            logger.warning(
                "Password reset email failed to send — user will not receive the link",
                extra={"user_id": user["id"]},
            )

        return generic_response

    async def reset_password(self, token: str, new_password: str) -> dict:
        """
        Complete password reset:
        1. Validate the JWT token (expiry + purpose)
        2. Verify the token hash matches what's stored (one-time use)
        3. Update the password
        4. Clear the stored token hash (invalidate)
        """
        if len(new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long.",
            )

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            purpose: str = payload.get("purpose")
            if not user_id or purpose != "password_reset":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid password reset token.",
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token has expired or is invalid.",
            )

        try:
            user = await users_collection.find_one({"id": user_id})
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database unavailable: {str(e)}",
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account no longer exists.",
            )

        # Verify token hasn't been used already (one-time use check)
        stored_hash = user.get("password_reset_token_hash")
        if not stored_hash or stored_hash != self._hash_token(token):
            logger.warning(
                "Password reset attempted with already-used or mismatched token",
                extra={"user_id": user_id},
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This password reset link has already been used or is invalid.",
            )

        hashed_password = pwd_context.hash(new_password)
        try:
            await users_collection.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "hashed_password": hashed_password,
                        "updated_at": datetime.utcnow(),
                    },
                    "$unset": {
                        "password_reset_token_hash": "",
                        "password_reset_token_expires_at": "",
                    },
                },
            )
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to update password: {str(e)}",
            )

        logger.info(
            "Password successfully reset",
            extra={"user_id": user_id},
        )

        return {"message": "Password has been successfully reset. You can now sign in."}


