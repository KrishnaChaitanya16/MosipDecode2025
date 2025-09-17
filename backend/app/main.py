from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.extraction import extract_text, map_fields
from app.verification import verify_fields
from fastapi.responses import JSONResponse
import json
from app.chinese_extraction import extract_chinese_text
import shutil
import uuid
import os
from app.quality import check_image_quality

app = FastAPI(title="OCR Extraction & Verification API")

# ✅ Explicit CORS config
origins = [
    "http://127.0.0.1:5500",   # VSCode Live Server
    "http://localhost:5500",   # fallback
    "http://127.0.0.1:3000",   # React dev
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/extract")
async def extract(document: UploadFile = File(...)):
    """Extract text & structured fields from a scanned document"""
    temp_path = os.path.join(UPLOAD_DIR, document.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    quality_report = check_image_quality(temp_path)  # this returns {"score": int, "suggestions": [...]}
    if quality_report["score"] < 55:
        return {
            "error": "Image quality too poor for reliable OCR.",
            "quality": quality_report
        }

    text = extract_text(temp_path)
    fields = map_fields(text)
    return {"mapped_fields": fields}


@app.post("/verify")
async def verify(file: UploadFile = File(...), submitted_data: str = Form(...)):
    """
    Verify submitted form data against OCR extracted fields.
    """
    # Parse JSON string into dict
    try:
        submitted_data = json.loads(submitted_data)
    except json.JSONDecodeError:
        return JSONResponse(
            status_code=400,
            content={"error": "submitted_data must be valid JSON string"}
        )

    # Create a temp file safely (works on Windows/Linux/Mac)
    tmp_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = verify_fields(submitted_data, tmp_path)
        return JSONResponse(content={"verification_result": result})
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/chinese_extract")
async def chinese_extract(document: UploadFile = File(...)):
    """Extract Chinese text using PHOCR"""
    temp_path = os.path.join(UPLOAD_DIR, document.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)

    chinese_text = extract_chinese_text(temp_path)
    return {"chinese_text": chinese_text["texts"]}
