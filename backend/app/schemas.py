# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    confirmPassword : str

class UserLogin(BaseModel):
    email: str
    password: str
    
class UserProfile(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    openApiToken: Optional[str]
    