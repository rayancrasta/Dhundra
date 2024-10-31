from fastapi import APIRouter,UploadFile, Form, HTTPException, Depends, File, Query, status
from fastapi.responses import FileResponse
from openai import OpenAI
from sqlalchemy.orm import Session
from database import get_db
from user import get_access_token,get_email_from_cookie
import logging
from fastapi.responses import JSONResponse
import openai
from schemas import GeneratePDFReq, RegenRequest, CoverLetterRequest,QnARequest
from datetime import datetime
import markdown2
import pdfkit
from styles import css_styles1, css_styles2
import random, os , string
from models import PDFrecord
from pypdf import PdfReader , PdfWriter 
from openaiops import check_relevancy,update_markdown_from_prompt,update_markdown_with_openai,generate_cover_letterai,generate_answer
from typing import List
from sqlalchemy import or_, and_
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, ValidationError
from schemas import PDFRecordResponse, PDFHistoryResponse ,PDFrecordUpdate, RelevancyRequest,CoverLetterPDF
from datetime import datetime
from config import coverletter_defaultprompt,resumegeneration_defaultprompt
import json
from fastapi.responses import StreamingResponse
from io import BytesIO
from fpdf import FPDF


router = APIRouter()

models = ['gpt-4o','gpt-4o-mini','gpt-4','gpt-3.5-turbo']

@router.post("/update_resume")
async def update_resume(file: UploadFile, 
                        job_description: str = Form(...),
                        model: str = Form(...),
                        access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    
    # file and job_description are set as form data in the frontend while calling the api endpoint
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

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

        if model not in models:
            raise HTTPException(status_code=400, detail="Invalid Model")
        # Validate job description
        if not job_description:
            raise HTTPException(status_code=400, detail="Job description cannot be empty.")

        if not user.openaitoken:
            raise HTTPException(status_code=400, detail="OpenAI token not set")
        
        if not user.resumeprompt:
            resumeprompt = resumegeneration_defaultprompt
        else:
            resumeprompt = user.resumeprompt 
            
        # Update resume using OpenAI
        updated_markdown = await update_markdown_with_openai(user.openaitoken, resume_markdown, job_description,model,resumeprompt)

        # Log success
        logging.info(f"Resume successfully updated for user {user.email}")

        # Return the updated markdown for frontend review
        return {"message": "Resume updated", "updated_markdown": updated_markdown}

    except HTTPException as e:
        logging.error(f"HTTP Exception: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    except Exception as e:
        logging.error(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating resume")

def convert_markdown_to_pdf(markdown_content, output_pdf,style):
    html_content = markdown2.markdown(markdown_content)
    # Define inline CSS styles
    
    theme = {
        'style1': css_styles1,
        'style2': css_styles2
    }.get(style, css_styles1)  # default blue theme

        
    full_html_content = theme + html_content
    options = {
        'encoding': 'UTF-8',
        'margin-top': '0.7in',
        'margin-right': '0.7in',
        'margin-bottom': '0.7in',
        'margin-left': '0.7in',
    }
    pdfkit.from_string(full_html_content, output_pdf, options=options)

def generate_random_number_string(length=10):
    return ''.join(random.choices(string.digits, k=length))   
                
@router.post("/generate-pdf")
async def generate_pdf(pdfreq: GeneratePDFReq, access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        if pdfreq.style not in ['style1','style2']:
            raise HTTPException(status_code=404, detail="Style not found")
        
        email = user.email
        
        # Generate a unique ID for the PDF name
        pdf_name  = generate_random_number_string()
        output_dir = 'output'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        pdf_output_path = f'{output_dir}/{pdf_name}.pdf'
        
        convert_markdown_to_pdf(pdfreq.markdown_content, pdf_output_path, pdfreq.style)
    
    except Exception as e:
        print("Error generating pdf: ",e)
    
    try:
        # Save the record in DB
        pdfrecord = pdfreq.dict()
        pdfrecord.pop('style')
        pdfrecord.pop('markdown_content')
        pdfrecord['email'] = email
        pdfrecord['timestamp'] = datetime.now()
        pdfrecord['pdfname'] = pdf_name
        
        pdfdbrecord = PDFrecord(**pdfrecord)
        db.add(pdfdbrecord)
        db.commit()
        db.refresh(pdfdbrecord)
        
        return {"pdf_name": pdf_name}
    except Exception as e:
        print("Error saving pdf record in DB: ",e)
        raise HTTPException(status_code=500, detail="Error Generating PDF")
    
@router.get("/download-resume/{pdf_name}")
async def download_resume(pdf_name: str,access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        email = user.email
        
        pdfrecord = db.query(PDFrecord).filter(PDFrecord.pdfname == pdf_name,PDFrecord.email == email).first()
        
        if not pdfrecord:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        output_dir = 'output'
        pdf_output_path = f'{output_dir}/{pdfrecord.pdfname}.pdf'
        
        if not os.path.exists(pdf_output_path):
            raise HTTPException(status_code=404, detail="PDF file not found")
        
        file_size = os.path.getsize(pdf_output_path)
        print(f"Serving PDF file: {pdf_output_path}, Size: {file_size} bytes")

        return FileResponse(pdf_output_path, media_type='application/pdf', filename=f'Resume.pdf')
    
    except HTTPException as e:
        print("Error downloading pdf HTTPexception: ",e)
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
    except Exception as e:
        print("Error downloading pdf: ",e)
        raise HTTPException(status_code=500, detail="Error Downloading PDF")

@router.post("/regen-resume")
async def regen_resume_from_prompt(regenRequest:RegenRequest,access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        
        if regenRequest.aimodel not in models:
            raise HTTPException(status_code=400, detail="Invalid Model")
        
        if not user.openaitoken:
            raise HTTPException(status_code=400, detail="OpenAI token not set")
        
        updated_markdown = await update_markdown_from_prompt(user.openaitoken, regenRequest.updated_markdown, regenRequest.jobDescription, regenRequest.user_prompt,regenRequest.aimodel)

        # Log success
        logging.info(f"Resume successfully updated for user {user.email}")

        # Return the updated markdown for frontend review
        return {"message": "Resume updated", "updated_markdown": updated_markdown}
    
    except HTTPException as e:
        logging.error(f"HTTP Exception: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    except Exception as e:
        logging.error(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating resume from prompt")

@router.post("/generate_cover_letter")
async def generate_cover_letter(cvreq: CoverLetterRequest,access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        if cvreq.aimodel not in models:
            raise HTTPException(status_code=400, detail="Invalid Model")
        
        if not user.openaitoken:
            raise HTTPException(status_code=400, detail="OpenAI token not set")
        
        coverletterprompt = user.coverletterprompt
        if not user.coverletterprompt:
            coverletterprompt = coverletter_defaultprompt
        else: 
            coverletterprompt = user.coverletterprompt
                
        cover_letter = await generate_cover_letterai(user.openaitoken, cvreq.resume_markdown, cvreq.job_description,cvreq.aimodel,coverletterprompt)
    
        return {"cover_letter": cover_letter}  

    except HTTPException as e:
        logging.error(f"HTTP Exception: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    except Exception as e:
        logging.error(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating Cover Letter")

@router.post("/qna")
async def generate_qna_answer(qna: QnARequest,access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        if qna.aimodel not in models:
            raise HTTPException(status_code=400, detail="Invalid Model")
        
        if not user.openaitoken:
            raise HTTPException(status_code=400, detail="OpenAI token not set")
        
        answer = await generate_answer(user.openaitoken, qna.resume_markdown, qna.job_description,qna.aimodel,qna.question)
    
        return {"answer": answer}  

    except HTTPException as e:
        logging.error(f"HTTP Exception: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    except Exception as e:
        logging.error(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating answer")


def use_openai_for_markdown(api_key,text,ai_model):
    try:
        openai_client = OpenAI(api_key=api_key)
            
        # Function to generate cover letter
        messages = [
            {
                "role": "system",
                "content": "You are a professional markdown writer. Generate the text which is a resume into the most accurate markdown format.Ensure that headings, paragraphs, bullet points, numbered lists etc are properly formatted to make it look like a proffesional resume. Keep the section as headings and the titles within it using bold. Just return the markdown content not even ```markdown"
            },
            {
                "role": "user",
                "content": f"Text:\n{text}\n\nMarkdown:"
            }
        ]
        
        response = openai_client.chat.completions.create(
            model=ai_model,
            messages=messages,
            max_tokens=3000,
            temperature=0.7
        )
        markdown_text = response.choices[0].message.content.strip()
        return markdown_text
    
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
        raise HTTPException(status_code=500, detail="Unexpected Error occured")

@router.post("/get_markdown")
async def upload_pdf(file: UploadFile = File(...),
                    model: str = Form(...),
                    access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        # Get user info
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")
        
        if not user.openaitoken:
            raise HTTPException(status_code=400, detail="OpenAI token not set")
        
        # Save the uploaded file temporarily
        file_location = f"temp/{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())

        # Extract text from the PDF using pypdf
        reader = PdfReader(file_location)
        pdf_text = ""
        for page in reader.pages:
            pdf_text += page.extract_text()

        # Use OpenAI to convert the extracted text into structured markdown
        markdown_text = use_openai_for_markdown(user.openaitoken,pdf_text,model)

        # Save the markdown content to a file
        markdown_file_location = f"temp/{file.filename.split('.')[0]}.md"
        with open(markdown_file_location, "w") as md_file:
            md_file.write(markdown_text)

        # Remove the temporary PDF file
        os.remove(file_location)

        # Send the markdown file as a download response
        return FileResponse(markdown_file_location, media_type="text/markdown", filename="converted_markdown.md")
    
    except HTTPException as e:
        logging.error(f"HTTP Exception: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    except Exception as e:
        logging.error(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="Error generating markdown")
    
@router.get("/history", response_model=PDFHistoryResponse)
def get_history(
    page: int = Query(0), 
    size: int = Query(20), 
    query: str = Query(None),  # Search query
    fromDate: str = Query(None),  # Start date filter
    toDate: str = Query(None),  # End date filter
    access_token: str = Depends(get_access_token),
    db: Session = Depends(get_db)
):
    try:
        user = get_email_from_cookie(access_token, db)
        
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")
        
        # Calculate the offset for pagination
        offset = page * size

        # Start building the base query with filters
        filters = []

        # user
        filters.append(PDFrecord.email == user.email)
        
        # Apply search query filter (if provided)
        if query:
            search = f"%{query}%"
            filters.append(
                or_(
                    PDFrecord.company_name.ilike(search),
                    PDFrecord.job_url.ilike(search),
                    PDFrecord.role.ilike(search),
                    PDFrecord.additionalData.ilike(search)
                )
            )

        # Apply date range filters (if provided)
        if fromDate:
            try:
                from_date_obj = datetime.strptime(fromDate, '%Y-%m-%d')
                filters.append(PDFrecord.timestamp >= from_date_obj)
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid fromDate format")

        if toDate:
            try:
                to_date_obj = datetime.strptime(toDate, '%Y-%m-%d')
                filters.append(PDFrecord.timestamp <= to_date_obj)
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid toDate format")

        # Combine all filters using the 'and_' operator
        history_query = db.query(PDFrecord).filter(and_(*filters))

        # Get total records count after applying filters
        total_records = history_query.count()

        # Fetch the filtered records with pagination
        history_records = history_query.order_by(PDFrecord.timestamp.desc()).offset(offset).limit(size).all()

        # Convert the database records to response models
        response = [PDFRecordResponse.from_orm(record) for record in history_records]

        # Return the structured response
        return PDFHistoryResponse(history=response, total=total_records)

    except HTTPException as e:
        logging.error(f"HTTP Exception: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
    except Exception as e:
        logging.error("Error getting history: %s", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error getting history")

# Endpoint to update a specific PDFrecord
@router.put("/history/{record_id}")
async def update_pdf_record(record_id: int, updated_record: PDFrecordUpdate, access_token: str = Depends(get_access_token),db: Session = Depends(get_db)):
    try:
        user = get_email_from_cookie(access_token, db)
        
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")
        # Fetch the record by its ID
        pdf_record = db.query(PDFrecord).filter(PDFrecord.id == record_id,PDFrecord.email == user.email ).first()

        # If the record is not found, raise an error
        if not pdf_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

        # Update the fields that are provided in the request
        if updated_record.company_name is not None:
            pdf_record.company_name = updated_record.company_name
        if updated_record.job_url is not None:
            pdf_record.job_url = updated_record.job_url
        if updated_record.role is not None:
            pdf_record.role = updated_record.role
        if updated_record.jobDescription is not None:
            pdf_record.jobDescription = updated_record.jobDescription
        if updated_record.additionalData is not None:
            pdf_record.additionalData = updated_record.additionalData

        # Commit the changes to the database
        db.commit()
        db.refresh(pdf_record)

        return {"message": "Record updated successfully"}

    except HTTPException as e:
        logging.error(f"HTTP Exception: {e.detail}")
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
    except Exception as e:
        logging.error("Error saving record while update: ",e)
        raise HTTPException(status_code=500, detail=f"Error saving the record")
    
@router.delete("/delete_resume/{pdf_name}")
async def delete_resume(pdf_name: str, access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    try:
        user = get_email_from_cookie(access_token, db)

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized user.")

        # Check if the PDF exists in the database
        pdf_record = db.query(PDFrecord).filter(PDFrecord.pdfname == pdf_name, PDFrecord.email == user.email).first()

        if not pdf_record:
            raise HTTPException(status_code=404, detail="PDF record not found.")

        # Delete the PDF file from the file system
        pdf_output_path = f'output/{pdf_name}.pdf'
        if os.path.exists(pdf_output_path):
            os.remove(pdf_output_path)
        else:
            raise HTTPException(status_code=404, detail="PDF file not found.")

        # Remove the record from the database
        db.delete(pdf_record)
        db.commit()

        return {"detail": "PDF and record deleted successfully."}

    except Exception as e:
        print(f"Error deleting PDF: {e}")
        raise HTTPException(status_code=500, detail="Error deleting PDF and record.")

@router.post("/check_relevancy")
async def check_relevancy_endpoint(relreq: RelevancyRequest,access_token: str = Depends(get_access_token), db: Session = Depends(get_db)):
    user = get_email_from_cookie(access_token, db)
        
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized user.")
    
    if not user.openaitoken:
        raise HTTPException(status_code=400, detail="OpenAI token not set")
        
    api_key = user.openaitoken  
    ai_model = relreq.aimodel  

    if ai_model not in models:
            raise HTTPException(status_code=400, detail="Invalid Model")
        
    try:
        relevancy_response = await check_relevancy(api_key, relreq.jobDescription, relreq.updatedMarkdown, ai_model)
        response_data = json.loads(relevancy_response)
        print(response_data)
        return response_data

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse the response from OpenAI.")
    except Exception as e:
        print(f"Error checking relevancy: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while checking relevancy.")

@router.post("/download_cover_letter_pdf")
def download_cover_letter_pdf(request: CoverLetterPDF):
    cover_letter = request.cover_letter
    if not cover_letter:
        raise HTTPException(status_code=400, detail="Cover letter content is empty")

    # Create a PDF in memory
    pdf = FPDF()
    pdf.add_page()

    # Set font and size
    pdf.set_font("Arial", size=12)

    # Define margin values
    left_margin = 20   # Left margin
    right_margin = 20  # Right margin
    top_margin = 10    # Top margin
    bottom_margin = 10  # Bottom margin

    # Set the left margin
    pdf.set_left_margin(left_margin)
    # Set the right margin
    pdf.set_right_margin(right_margin)

    # Move the cursor down for top margin
    pdf.ln(top_margin)

    # Add the cover letter text with padding and justified alignment
    pdf.multi_cell(0, 10, cover_letter, border=0, align='J')  # 'J' for justified text

    # Move the cursor down for bottom margin
    pdf.ln(bottom_margin)

    # Save the PDF to a BytesIO stream
    pdf_stream = BytesIO()
    pdf_output = pdf.output(dest='S').encode('latin1')  # Get PDF output as bytes
    pdf_stream.write(pdf_output)  # Write to BytesIO stream
    pdf_stream.seek(0)  # Reset stream position to the beginning

    # Return the PDF file as a downloadable response
    response = StreamingResponse(pdf_stream, media_type="application/pdf")
    response.headers["Content-Disposition"] = "attachment; filename=cover_letter.pdf"
    return response