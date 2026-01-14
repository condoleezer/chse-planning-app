FROM python:3.11-slim

WORKDIR /app

# Avoid installing unneeded packages unless necessary
RUN apt-get update && apt-get install -y --no-install-recommends build-essential gcc && rm -rf /var/lib/apt/lists/*

# Install python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . /app

EXPOSE 8000

# Ensure Python can import top-level packages from /app (makes `from database.database import db` work)
ENV PYTHONPATH=/app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
