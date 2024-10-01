from fastapi import APIRouter,UploadFile, Form, HTTPException, Depends
from openai import OpenAI
from sqlalchemy.orm import Session
from database import get_db
from user import get_access_token,get_email_from_cookie
import logging
from fastapi.responses import JSONResponse
import openai

router = APIRouter()


def update_markdown_with_openai(api_key, resume_markdown, job_description):
    try:
        # Initialize the OpenAI client
        openai_client = OpenAI(api_key=api_key)

        # Define the system and user message for the API
        messages = [
            {"role": "system", "content": "You are an expert resume writer. Update the following resume to better fit the given job description. Maintain the structure and content of the original resume as much as possible. Don't reduce the size of content much. Don't fake any experience or skills that the original resume doesn't have. If anything seems obvious, then only add it; don't add any new data that would make it look fake. As the resume is of a less experienced professional, change the title according to the job description. If it's a senior role, mention it as a normal role, not a senior title. Add soft skills based on the job description. Making it ATS friendly according to the job description is our goal. Just give me resume content; don't add any info text from your side."},
            {"role": "user", "content": f"Resume:\n{resume_markdown}\n\nJob Description:\n{job_description}\n\nUpdated Resume:"}
        ]

        # Make the API call to OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=1500,
            temperature=0.7
        )

        # Extract and return the updated resume content
        updated_markdown = response.choices[0].message.content.strip()
        return updated_markdown

    except openai.UnprocessableEntityError as e:
        # Handle invalid requests, like a malformed request or invalid input format
        print(f"Invalid request error: {str(e)}")
        raise HTTPException(status_code=500, detail="The request to OpenAI was invalid. Please check the input format and content.")
    
    except openai.APIConnectionError as e:
        # Handle connection errors (e.g., network issues, timeout)
        print(f"API connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="There was an issue connecting to the OpenAI API. Please try again later.")
    
    except openai.RateLimitError as e:
        # Handle rate-limiting issues (too many requests)
        print(f"Rate limit exceeded: {str(e)}")
        raise HTTPException(status_code=400, detail="Rate limit exceeded. Please wait and try again after some time.")

    except openai.AuthenticationError as e:
        # Generic catch-all for any other OpenAI errors
        print(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=401, detail="OpenAI key is not valid")
    
    except Exception as e:
        # Catch-all for any unexpected errors
        print(f"Unexpected error: {str(e)}")
        raise RuntimeError("An unexpected error occurred while updating the resume. Please try again.")


@router.post("/update_resume")
async def update_resume(file: UploadFile, job_description: str = Form(...), access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    
    # file and job_description are set as form data in the frontend while calling the api endpoint
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)
        print(access_token)
        print(user.email)
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        # Read resume content
        resume_content = await file.read()
        if not resume_content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        try:
            resume_markdown = resume_content.decode('utf-8')
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid file.")

        # Validate job description
        if not job_description:
            raise HTTPException(status_code=400, detail="Job description cannot be empty.")

        # Update resume using OpenAI
        updated_markdown = update_markdown_with_openai(user.openapitoken, resume_markdown, job_description)

        # Log success
        logging.info(f"Resume successfully updated for user {user.email}")

        # Return the updated markdown for frontend review
        return {"message": "Resume updated", "updated_markdown": updated_markdown}

    except HTTPException as e:
        logging.error(f"HTTP Exception: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    except Exception as e:
        logging.error(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail=e.detail)