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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class AuthService:
    def __init__(self):
        pass

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

    async def request_password_reset(self, email: str) -> dict:
        try:
            user = await users_collection.find_one({"email": email.strip().lower()})
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database unavailable: {str(e)}",
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address.",
            )

        reset_payload = {
            "sub": user["id"],
            "email": user["email"],
            "purpose": "password_reset",
        }
        reset_token = self._create_access_token(
            data=reset_payload,
            expires_delta=timedelta(minutes=15)
        )

        return {
            "message": "Password reset token generated successfully. Valid for 15 minutes.",
            "reset_token": reset_token,
            "expires_in_minutes": 15,
        }

    async def reset_password(self, token: str, new_password: str) -> dict:
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

        hashed_password = pwd_context.hash(new_password)
        try:
            await users_collection.update_one(
                {"id": user_id},
                {"$set": {"hashed_password": hashed_password, "updated_at": datetime.utcnow()}}
            )
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to update password: {str(e)}",
            )

        return {"message": "Password has been successfully reset. You can now sign in."}


