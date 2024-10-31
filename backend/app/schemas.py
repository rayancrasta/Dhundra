# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional,List
from datetime import datetime

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
    resumeprompt : Optional[str]
    coverletterprompt : Optional[str]
    
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
    additionalData: Optional[str]
    style : Optional[str]
    
class RegenRequest(BaseModel):
    aimodel : str
    jobDescription: str
    updated_markdown: str
    user_prompt: str
    
class CoverLetterRequest(BaseModel):
    resume_markdown: str
    job_description: str
    aimodel : str
    
class QnARequest(BaseModel):
    resume_markdown: str
    job_description: str
    aimodel : str
    question: str

class PDFRecordResponse(BaseModel):
    id: int
    pdfname: str
    timestamp: datetime
    company_name: str
    job_url: str
    role: str
    posting_type: str
    jobDescription: str
    additionalData: Optional[str]

    class Config:
        orm_mode = True
        from_attributes = True  # Allow from_orm usage
    
class PDFHistoryResponse(BaseModel):
    history: List[PDFRecordResponse]  # This will hold the list of records
    total: int  # This will hold the total count of records

    class Config:
        orm_mode = True
    
class PDFrecordUpdate(BaseModel):
    company_name: str = None
    job_url: str = None
    role: str = None
    jobDescription: str = None
    additionalData: str = None
    
class RelevancyRequest(BaseModel):
    jobDescription: str
    updatedMarkdown: str
    aimodel: str
    
class CoverLetterPDF(BaseModel):
    cover_letter: str
    