# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql import func  # Importing func for default timestamp
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, index=True, autoincrement=True)
    firstName = Column(String) 
    lastName = Column(String)    
    email = Column(String, primary_key=True, index=True)
    password = Column(String)
    openaitoken = Column(String, unique=True, nullable=True)  

    #user prompts
    resumeprompt = Column(String,nullable=True)
    coverletterprompt = Column(String,nullable=True)
    
    
    # Establish relationship with Shortcut
    shortcuts = relationship("Shortcuts", back_populates="user")  # Corrected back_populates reference
    pdf_records = relationship("PDFrecord", back_populates="user")  # Changed to snake_case

class Shortcuts(Base):
    __tablename__ = "shortcuts"
    id = Column(Integer, index=True, autoincrement=True)
    email = Column(String, ForeignKey('users.email', ondelete='CASCADE'), primary_key=True, index=True)
    github = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    website = Column(String, nullable=True)
    blog = Column(String, nullable=True)

    user = relationship("User", back_populates="shortcuts")

class PDFrecord(Base):
    __tablename__ = "pdfrecords"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, ForeignKey('users.email', ondelete='CASCADE'), index=True)
    pdfname = Column(String, index=True)  # Changed to snake_case
    timestamp = Column(DateTime, default=datetime.now())  # Use func.now() for timestamp
    company_name = Column(String, nullable=True)
    job_url = Column(String, nullable=True)
    role = Column(String, nullable=True)
    posting_type = Column(String, nullable=True)
    jobDescription = Column(String, nullable=True)  # Changed to snake_case
    additionalData = Column(String,nullable=True)
    
    relevancy = Column(String,nullable=True) # new addition for resume relevancy to JD
    
    user = relationship("User", back_populates="pdf_records")
