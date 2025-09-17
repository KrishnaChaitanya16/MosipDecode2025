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
from app.multipage_extraction import extract_multipage_text, map_multipage_fields  # New import


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
    
    # Clean up temp file
    if os.path.exists(temp_path):
        os.remove(temp_path)
    
    return {"mapped_fields": fields}


@app.post("/extract/multipage")
async def extract_multipage(document: UploadFile = File(...), multipage: str = Form(default="true")):
    """Extract text & structured fields from a multipage document"""
    # Create unique temp file to avoid conflicts
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        # Check if it's a PDF or multipage image
        file_extension = document.filename.lower().split('.')[-1] if '.' in document.filename else ''
        
        if file_extension not in ['pdf', 'tiff', 'tif']:
            # For single image files, treat as single page
            quality_report = check_image_quality(temp_path)
            if quality_report["score"] < 55:
                return {
                    "error": "Image quality too poor for reliable OCR.",
                    "quality": quality_report
                }
            
            text = extract_text(temp_path)
            fields = map_fields(text)
            
            return {
                "total_pages": 1,
                "pages": {
                    "1": {
                        "mapped_fields": fields
                    }
                }
            }
        
        # Extract from multipage document
        multipage_results = extract_multipage_text(temp_path)
        
        if not multipage_results or "pages" not in multipage_results:
            return {
                "error": "Failed to process multipage document.",
                "quality": {"score": 0, "suggestions": ["Document format not supported or corrupted"]}
            }
        
        # Process each page
        processed_pages = {}
        total_pages = multipage_results.get("total_pages", 0)
        
        for page_num, page_data in multipage_results["pages"].items():
            # Check quality for each page if available
            page_quality = page_data.get("quality", {"score": 100})
            
            if page_quality["score"] < 40:  # Lower threshold for multipage
                # Still process but with warning
                processed_pages[str(page_num)] = {
                    "mapped_fields": {},
                    "quality_warning": f"Page {page_num} has poor quality (score: {page_quality['score']})",
                    "quality": page_quality
                }
                continue
            
            # Extract and map fields for this page
            page_text = page_data.get("text", "")
            page_fields = map_multipage_fields(page_text, page_num)
            
            processed_pages[str(page_num)] = {
                "mapped_fields": page_fields,
                "quality": page_quality
            }
        
        return {
            "total_pages": total_pages,
            "pages": processed_pages
        }
        
    except Exception as e:
        return {
            "error": f"Multipage extraction failed: {str(e)}",
            "quality": {"score": 0, "suggestions": ["Please check document format and try again"]}
        }
    
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


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
    file_id = str(uuid.uuid4())
    tmp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = verify_fields(submitted_data, tmp_path)
        return JSONResponse(content={"verification_result": result})
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.post("/verify/multipage")
async def verify_multipage(file: UploadFile = File(...), submitted_data: str = Form(...), page_number: int = Form(default=1)):
    """
    Verify submitted form data against OCR extracted fields from a specific page of a multipage document.
    """
    # Parse JSON string into dict
    try:
        submitted_data = json.loads(submitted_data)
    except json.JSONDecodeError:
        return JSONResponse(
            status_code=400,
            content={"error": "submitted_data must be valid JSON string"}
        )

    # Create a temp file safely
    file_id = str(uuid.uuid4())
    tmp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # First extract multipage data
        multipage_results = extract_multipage_text(tmp_path)
        
        if not multipage_results or "pages" not in multipage_results:
            return JSONResponse(
                status_code=400,
                content={"error": "Failed to process multipage document"}
            )
        
        # Get the specific page data
        page_data = multipage_results["pages"].get(str(page_number))
        if not page_data:
            return JSONResponse(
                status_code=400,
                content={"error": f"Page {page_number} not found in document"}
            )
        
        # Extract fields from the specific page
        page_text = page_data.get("text", "")
        page_fields = map_multipage_fields(page_text, page_number)
        
        # Convert to the format expected by verify_fields
        extracted_data = {}
        for field_name, field_data in page_fields.items():
            if isinstance(field_data, dict) and "value" in field_data:
                extracted_data[field_name] = field_data["value"]
            else:
                extracted_data[field_name] = field_data
        
        # Perform verification using existing verify_fields function
        # We'll need to modify verify_fields to accept extracted data directly
        result = verify_fields_with_extracted_data(submitted_data, extracted_data)
        
        return JSONResponse(content={
            "verification_result": result,
            "page_number": page_number,
            "total_pages": multipage_results.get("total_pages", 1)
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Multipage verification failed: {str(e)}"}
        )
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.post("/chinese_extract")
async def chinese_extract(document: UploadFile = File(...)):
    """Extract Chinese text using PHOCR"""
    temp_path = os.path.join(UPLOAD_DIR, document.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)

    try:
        chinese_text = extract_chinese_text(temp_path)
        return {"chinese_text": chinese_text["texts"]}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "features": [
            "single_page_extraction",
            "multipage_extraction", 
            "data_verification",
            "chinese_text_extraction",
            "quality_assessment"
        ]
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "OCR Extraction & Verification API",
        "version": "2.0.0",
        "endpoints": {
            "/extract": "Single page OCR extraction",
            "/extract/multipage": "Multipage document OCR extraction",
            "/verify": "Single page data verification",
            "/verify/multipage": "Multipage data verification",
            "/chinese_extract": "Chinese text extraction",
            "/health": "Health check"
        }
    }
