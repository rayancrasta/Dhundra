# crud.py
import bcrypt
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.future import select
from models import User
from schemas import UserCreate
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models import User,Shortcuts
import bcrypt
from utils import get_password_hash

def create_user(db: Session, user: UserCreate):
    try:
        hashed_password = get_password_hash(user.password)
        
        db_user = User(firstName=user.firstName, 
                    lastName=user.lastName,
                    email=user.email,
                    password=hashed_password)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        shortcuts = Shortcuts(email=user.email)
        db.add(shortcuts)
        db.commit()
        db.refresh(shortcuts)
        
        return db_user
    except Exception as e:
        print("Signup Error: ",e)
        raise HTTPException(status_code=500, detail="Error Signing Up User")

def get_user_by_email(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    return user
