# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    firstName = Column(String, index=True)
    lastName = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    openaitoken = Column(String,unique=True,nullable=True)

    # Establish relationship with Shortcuts
    shortcuts = relationship("Shortcuts", back_populates="user")
    pdfrecords = relationship("PDFrecord", back_populates="user")
    
class Shortcuts(Base):
    __tablename__ = "shortcuts"
    id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    email = Column(String, ForeignKey('users.email', ondelete='CASCADE'), index=True)
    github = Column(String,nullable=True)
    linkedin = Column(String,nullable=True)
    website = Column(String,nullable=True)
    blog = Column(String,nullable=True)
    
    user = relationship("User", back_populates="shortcuts")

class PDFrecord(Base):
    __tablename__ = "pdfrecords"
    id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    email = Column(String, ForeignKey('users.email', ondelete='CASCADE'), index=True)
    pdfname = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now)
    company_name = Column(String,nullable=True)
    job_url = Column(String,nullable=True)
    role = Column(String,nullable=True)
    posting_type = Column(String,nullable=True)
    jobDescription = Column(String,nullable=True)

    user = relationship("User", back_populates="pdfrecords")
    
    