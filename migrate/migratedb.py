import pymongo
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# MongoDB configuration
MONGODB_URI = "mongodb://localhost:27017/"
MONGODB_DB = "resume_generator"
MONGODB_COLLECTION = "generated_resumes"

# PostgreSQL configuration
POSTGRESQL_URI = "postgresql://rayanc:raayanc@localhost:5432/dhundradb"  # Replace username and password
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, index=True, autoincrement=True)
    firstName = Column(String, index=True)  # Changed to snake_case
    lastName = Column(String, index=True)    # Changed to snake_case
    email = Column(String, primary_key=True, index=True)
    password = Column(String)
    openaitoken = Column(String, unique=True, nullable=True)  # Changed to snake_case
    
# PostgreSQL table schema
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
def migrate_data():
    # Connect to MongoDB
    mongo_client = pymongo.MongoClient(MONGODB_URI)
    mongo_db = mongo_client[MONGODB_DB]
    mongo_collection = mongo_db[MONGODB_COLLECTION]

    # Connect to PostgreSQL
    postgres_engine = create_engine(POSTGRESQL_URI)
    Session = sessionmaker(bind=postgres_engine)
    session = Session()

    # Fetch data from MongoDB
    mongo_records = mongo_collection.find()

    for record in mongo_records:
        # Prepare data for PostgreSQL
        pdf_name = f"resume_{record['timestamp']}.pdf"
        pdf_record = PDFrecord(
            email="rayancrasta95@gmail.com",  # Fixed email as per your request
            pdfname=record['pdf_path'],
            timestamp=record['date'],  # Directly using the datetime object
            company_name=record.get('company_name'),
            job_url=record.get('job_url', ''),
            role=record.get('role'),
            posting_type=record.get('type'),
            jobDescription=record.get('jobDescription')
        )

        # Add record to the session
        session.add(pdf_record)

    # Commit the session
    session.commit()
    print("Data migration completed.")

    # Close the session
    session.close()
    mongo_client.close()

if __name__ == "__main__":
    migrate_data()
