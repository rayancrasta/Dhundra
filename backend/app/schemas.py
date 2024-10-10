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
    openaitoken: Optional[str]
    
class ShortcutDetails(BaseModel):
    github: Optional[str]
    linkedin: Optional[str]
    website: Optional[str]
    blog: Optional[str]

class GeneratePDFReq(BaseModel):
    markdown_content: str
    company_name: Optional[str]
    job_url: Optional[str]
    role: Optional[str]
    posting_type: Optional[str]
    jobDescription: Optional[str]
    
class RegenRequest(BaseModel):
    aimodel : str
    jobDescription: str
    updated_markdown: str
    user_prompt: str
    
class CoverLetterRequest(BaseModel):
    resume_markdown: str
    job_description: str
    aimodel : str