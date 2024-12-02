# backend/Dockerfile

# Use official Python image as base
FROM python

# Set working directory
WORKDIR /app

# Install wkhtmltopdf and its dependencies
RUN apt-get update && \
    apt-get install -y wkhtmltopdf && \
    rm -rf /var/lib/apt/lists/*

# Copy dependencies file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI application code
COPY app /app

# Expose FastAPI default port
EXPOSE 8000

# Run the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
