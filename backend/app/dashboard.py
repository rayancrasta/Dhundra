from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from models import PDFrecord
from database import get_db
import logging
from user import get_access_token,get_email_from_cookie

router = APIRouter()

@router.get("/jobs-count")
def get_job_count(access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        email = user.email
        
        count = db.query(PDFrecord).filter(PDFrecord.email == email).count()
        return {"total_jobs_applied": count}

    except HTTPException as e:
        print("Error downloading pdf HTTPexception: ",e)
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
    except Exception as e:
        print("Error getting job count: ",e)
        raise HTTPException(status_code=500, detail="Error getting job count")

@router.get("/jobs-heatmap")
def get_job_heatmap_data(access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        email = user.email
        
        result = db.query(func.date(PDFrecord.timestamp).label("date"),
                        func.count(PDFrecord.id).label("count"),
                        func.max(PDFrecord.timestamp).label("max_timestamp"))\
                .filter(PDFrecord.email == email)\
                .group_by(func.date(PDFrecord.timestamp)).order_by(func.max(PDFrecord.timestamp)).all()
                   
        # SELECT DATE(timestamp) AS date, COUNT(id) AS count
        # FROM pdfrecords
        # WHERE email = 'user@example.com'
        # GROUP BY DATE(timestamp);

        if not result:
            raise HTTPException(status_code=404, detail="No job applications found.")

        return [{"date": str(row.date), "count": row.count} for row in result]

    except HTTPException as e:
        print("Error downloading pdf HTTPexception: ",e)
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs-top-roles")
def get_top_roles(access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        email = user.email
        
        result = db.query(PDFrecord.role, func.count(PDFrecord.role).label("count"))\
                   .filter(PDFrecord.email == email)\
                   .group_by(PDFrecord.role)\
                   .order_by(func.count(PDFrecord.role).desc())\
                   .limit(5)\
                   .all()
                   
#         SELECT role, COUNT(role) AS count
        # FROM pdfrecords
        # WHERE email = :email
        # GROUP BY role
        # ORDER BY count DESC
        # LIMIT 10;
        if not result:
            raise HTTPException(status_code=404, detail="No roles found for this user.")

        return [{"role": row.role, "count": row.count} for row in result]

    except HTTPException as e:
        print("Error downloading pdf HTTPexception: ",e)
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
    except Exception as e:
        logging.error("Error finding top roles",e)
        raise HTTPException(status_code=500, detail="Error finding top roles")

