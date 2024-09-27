from fastapi import APIRouter, Depends, HTTPException,Response, Request
from schemas import UserCreate,UserLogin
from sqlalchemy.orm import Session
from database import get_db
from crud import create_user,get_user_by_email
from utils import create_access_token,create_refresh_token,verify_password,verify_token
from datetime import timedelta
from config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, SECRET_KEY, ALGORITHM
from jose import jwt, JWTError

router = APIRouter()

@router.post("/signup")
def student_signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        if user.password != user.confirmPassword:
            raise HTTPException(status_code=500, detail="Passwords do not match")
        
        db_user = get_user_by_email(db, email=user.email)  
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        create_user(db=db, user=user) # can raise error
        return {"message": "User Signup Succesful"}
    
    except HTTPException as http_exception:
        raise http_exception # Reraise HTTPExceptions without modifying them
    
    #Other errors
    except Exception as e:
        print("Signup Error: ", e)
        raise HTTPException(status_code=500, detail=e)
    
@router.post("/login")
def user_login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Generate tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": db_user.email}, expires_delta=refresh_token_expires
    )
    
    print("Access token: ",access_token)
    print("Refresh token",refresh_token)
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,  # cant be accessed by other cookies
        secure=False,    
        samesite="lax"  
    )
    
    # Set the access token in an HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  
        secure=False,    # wont be sent over http while dev
        samesite="lax"   
    )

    return {"message": "Login successful"}

@router.get("/verify")
def verify_access_token(request: Request):
    access_token = request.cookies.get("access_token")
    
    if not access_token or not verify_token(access_token):
        raise HTTPException(status_code=401, detail="Invalid access token")

    return {"message": "Access token is valid"}

@router.post("/refresh")
def refresh_token(request: Request, response : Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token not found")
    
    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    # Generate a new access token
    access_token = create_access_token(data={"sub": payload["sub"]})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False, 
        samesite="lax"
    )

    return {"message": "Access token refreshed successfully"}
