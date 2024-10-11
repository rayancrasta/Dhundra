import os
import random
import string
import shutil
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLAlchemy setup
DATABASE_URL = "postgresql://rayanc:raayanc@localhost:5432/dhundradb"  # Change this to your database URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, index=True, autoincrement=True)
    firstName = Column(String, index=True)  # Changed to snake_case
    lastName = Column(String, index=True)    # Changed to snake_case
    email = Column(String, primary_key=True, index=True)
    password = Column(String)
    openaitoken = Column(String, unique=True, nullable=True)  # Changed to snake_case
    
# PDFrecord model definition
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

# Create the database tables
Base.metadata.create_all(bind=engine)

def generate_random_number_string(length=10):
    """Generate a random number string of given length."""
    return ''.join(random.choices(string.digits, k=length))

def rename_pdf(pdfrecord: PDFrecord, session, new_folder: str):
    """Rename PDF file to a unique number and update the pdfname in the database."""
    
    # Get the old PDF path from the pdfrecord
    old_pdf_path = pdfrecord.pdfname

    # Check if the old PDF file exists
    if not os.path.exists(old_pdf_path):
        print(f"Error: The file {old_pdf_path} does not exist.")
        return

    # Create the new output folder if it doesn't exist
    os.makedirs(new_folder, exist_ok=True)

    # Generate a unique 10-digit number
    unique_number = generate_random_number_string()

    # Create the new PDF file path
    new_pdf_path = os.path.join(new_folder, f"{unique_number}.pdf")

    # Move and rename the file
    shutil.move(old_pdf_path, new_pdf_path)

    # Update the pdfname in the PDFrecord
    pdfrecord.pdfname = unique_number
    session.commit()  # Commit the changes to the database

    # Print confirmation and return the new file name
    print(f"File renamed to {new_pdf_path}")
    return unique_number

if __name__ == "__main__":
    # Create a new session
    session = SessionLocal()

    # Specify the new output folder where renamed PDFs will be saved
    new_folder = 'newoutput'  # Specify your output folder here

    # Fetch all PDF records from the database
    pdf_records = session.query(PDFrecord).all()

    # Iterate over each PDF record and rename the associated PDF
    for pdfrecord in pdf_records:
        print(f"Processing record ID: {pdfrecord.id}, PDF: {pdfrecord.pdfname}")
        rename_pdf(pdfrecord, session, new_folder)

    # Close the session
    session.close()
