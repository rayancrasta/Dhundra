from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from user import router as user_router
from resume import router as resume_router
from dashboard import router as dashboard_router
import models

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Router for each path
app.include_router(user_router, prefix="/user")
app.include_router(resume_router, prefix="/resume")
app.include_router(dashboard_router,prefix="/dashboard")




