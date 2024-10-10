from fastapi import APIRouter, Depends, HTTPException,Response, Request, Cookie
from schemas import UserCreate,UserLogin,UserProfile, ShortcutDetails
from sqlalchemy.orm import Session
from database import get_db
from crud import create_user,get_user_by_email
from utils import create_access_token,create_refresh_token,verify_password,verify_token
from datetime import timedelta
from config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, SECRET_KEY, ALGORITHM
from jose import jwt, JWTError
from models import User,Shortcuts
import openai

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

def get_access_token(access_token: str = Cookie(None)):
    if access_token is None:
        raise HTTPException(status_code=401,detail="User tokens not found")
    return access_token
    
@router.get("/profile")
def get_profile(access_token: str = Depends(get_access_token),db: Session = Depends(get_db)):
    try:
        # Decode the access token from jwt
        payload = jwt.decode(access_token,SECRET_KEY,algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401,detail="Invalid access token")
    except JWTError:
        raise HTTPException(status_code=401,detail="Couldn't validate credentials")
    
    #Fetch user details from the database
    user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise HTTPException(status_code=404,detail="User not found")
    
    # Return user details
    return UserProfile(firstName = user.firstName, lastName = user.lastName,
                       email = user.email, openaitoken = user.openaitoken)
    
@router.put("/profile")
def update_profile(user_data: UserProfile, access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Decode the access token from jwt
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid access token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Couldn't validate credentials")

    # Update user details in the database
    user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.firstName = user_data.firstName
    user.lastName = user_data.lastName
    user.email = user_data.email
    user.openaitoken = user_data.openaitoken
    db.commit()
    
    return {"message": "Profile updated successfully"}

def get_email_from_cookie(access_token,db):
    try:
        # Decode the access token from jwt
        payload = jwt.decode(access_token,SECRET_KEY,algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401,detail="Invalid access token")
    except JWTError:
        raise HTTPException(status_code=401,detail="Couldn't validate credentials")
    
    try:
        # print(email)
        #Fetch user details from the database
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404,detail="User not found")
        return user
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail="Error finding User Details")
    
@router.get("/openai-token-check")
def is_api_key_valid(access_token: str = Depends(get_access_token),db: Session = Depends(get_db)):
    try:
        user = get_email_from_cookie(access_token,db)
    except Exception as e:
        print("Openai token check error: ",e)
        raise HTTPException(status_code=500,detail="Token check failed")
        
    client = openai.OpenAI(api_key=user.openaitoken)
    try:
        client.models.list()
    except openai.AuthenticationError:
        raise HTTPException(status_code=401,detail="Invalid OpenAI token")        
    return True
    
@router.get("/personal-details")
def get_shortcuts(access_token: str = Depends(get_access_token),db: Session = Depends(get_db)):
    try:
        user = get_email_from_cookie(access_token,db)
        email = user.email
        
        user_shortcut = db.query(Shortcuts).filter(Shortcuts.email == email).first()
    except Exception as e:
        print("Error getting shortcuts ",e)
        raise HTTPException(status_code=500,detail="Error getting shortcuts ")
    
    return ShortcutDetails(github=user_shortcut.github,linkedin=user_shortcut.linkedin,website=user_shortcut.website,blog=user_shortcut.blog)

@router.post("/personal-details")
def get_shortcuts(shortcutdetails:ShortcutDetails,access_token: str = Depends(get_access_token),db: Session = Depends(get_db)):
    try:
        user = get_email_from_cookie(access_token,db)
        email = user.email
        
        
        user_shortcut = db.query(Shortcuts).filter(Shortcuts.email == email).first()
        
        if not user_shortcut:
            print("Error finding Shorcuts: ")
            raise HTTPException(status_code=404, detail="No shortcuts found for the user")
        
        
        user_shortcut.github = shortcutdetails.github
        user_shortcut.linkedin = shortcutdetails.linkedin
        user_shortcut.website = shortcutdetails.website
        user_shortcut.blog = shortcutdetails.blog

        db.commit()
        db.refresh(user_shortcut)
        
    except Exception as e:
        print("Error saving Shorcuts: ",e)
        raise HTTPException(status_code=500, detail="Error saving shortcuts")