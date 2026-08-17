from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.database import users_collection
from app.models import UserModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class AuthService:
    def __init__(self):
        pass

    async def register(self, user_data) -> dict:
        existing = await users_collection.find_one({"email": user_data.email})
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
        await users_collection.insert_one(user_dict)
        return user_dict

    async def login(self, email: str, password: str) -> dict:
        user = await users_collection.find_one({"email": email})
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

        user = await users_collection.find_one({"id": user_id})
        if user is None:
            raise credentials_exception
        return user
