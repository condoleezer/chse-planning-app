FROM python:3.11-slim

WORKDIR /app

# Installation des dépendances système et build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc && \
    pip install --upgrade pip setuptools wheel poetry && \
    rm -rf /var/lib/apt/lists/*

# Install python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . /app

EXPOSE 8000

ENV PYTHONPATH=/app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]