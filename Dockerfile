# ----------------------------
# Base Image
# ----------------------------
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# ----------------------------
# System Dependencies
# ----------------------------
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    curl \
    gzip \
    tar \
    libgl1 \
    libglib2.0-0 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ----------------------------
# Python Dependencies
# ----------------------------
COPY backend/requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install jupyter nest-asyncio python-dotenv

# ----------------------------
# Application Code
# ----------------------------
COPY backend/ .



# ----------------------------
# Entry Point
# ----------------------------
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Copy .env file
COPY backend/.env /app/.env

# ----------------------------
# Expose FastAPI Port
# ----------------------------
EXPOSE 8000

# ----------------------------
# Entrypoint
# ----------------------------
ENTRYPOINT ["./entrypoint.sh"]
