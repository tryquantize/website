# AI Service Dockerfile
# This image runs the Python-based AI service for search functionality

FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the AI service port
EXPOSE 5002

# Run the Flask application
CMD ["python", "app.py"]
