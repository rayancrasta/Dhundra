# schemas.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    confirmPassword : str

class UserLogin(BaseModel):
    email: str
    password: str