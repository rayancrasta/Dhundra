# models.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firstName = Column(String, index=True)
    lastName = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    openaitoken = Column(String,unique=True,nullable=True)

    # Establish relationship with Shortcuts
    shortcuts = relationship("Shortcuts", back_populates="user")
    
class Shortcuts(Base):
    __tablename__ = "shortcuts"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, ForeignKey('users.email', ondelete='CASCADE'), index=True)
    github = Column(String,nullable=True)
    linkedin = Column(String,nullable=True)
    website = Column(String,nullable=True)
    blog = Column(String,nullable=True)
    
    user = relationship("User", back_populates="shortcuts")
    