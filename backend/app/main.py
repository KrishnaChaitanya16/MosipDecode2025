from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.extraction import extract_text, map_fields
from app.verification import verify_fields
import shutil
import os

app = FastAPI(title="OCR Extraction & Verification API")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

    text = extract_text(temp_path)
    fields = map_fields(text)

    return {"raw_text": text, "mapped_fields": fields}


@app.post("/verify")
async def verify(
    document: UploadFile = File(...),
    name: str = Form(None),
    dob: str = Form(None),
    id_number: str = Form(None),
):
    """Verify submitted form data against scanned document"""
    temp_path = os.path.join(UPLOAD_DIR, document.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)

    submitted_data = {"name": name, "dob": dob, "id_number": id_number}
    result = verify_fields(submitted_data, extract_text(temp_path))

    return {"verification": result}
