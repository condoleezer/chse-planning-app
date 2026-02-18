FROM python:3.11-slim

# Forcer pip à ne pas utiliser setuptools par défaut
ENV PIP_NO_BUILD_ISOLATION=0

WORKDIR /app

# Installation des dépendances système incluant setuptools
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc && \
    pip install --upgrade pip setuptools wheel && \
    rm -rf /var/lib/apt/lists/*

# Install python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . /app

EXPOSE 8000

ENV PYTHONPATH=/app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]