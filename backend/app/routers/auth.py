from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.user import UserCreate, UserResponse, Token
from app.services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    return await auth_service.register(user)


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    return await auth_service.login(form_data.username, form_data.password)


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user=Depends(AuthService.get_current_user)):
    return current_user
