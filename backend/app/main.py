import os
import shutil
import uuid
import json
import logging
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# --- Language-Specific Imports ---
# Default English processors
from app.extraction import (
    extract_text_with_detection as extract_text_with_detection_en,
    map_fields as map_fields_en,
    create_confidence_overlay as create_confidence_overlay_en,
)
# Chinese processors
from app.chinese_extraction import (
    extract_text_with_detection as extract_text_with_detection_ch,
    map_fields as map_fields_ch,
    create_confidence_overlay as create_confidence_overlay_ch
)
# Japanese processors
from app.japanese_extraction import (
    extract_text_with_detection as extract_text_with_detection_ja,
    map_fields as map_fields_ja,
    create_confidence_overlay as create_confidence_overlay_ja
)
# Korean processors
from app.korean_extraction import (
    extract_text_with_detection as extract_text_with_detection_ko,
    map_fields as map_fields_ko,
    create_confidence_overlay as create_confidence_overlay_ko
)

# --- Common Utility Imports ---
from app.verification import verify_fields
from app.quality import check_image_quality
from app.utils import (
    is_pdf_file, 
    get_pdf_page_count, 
    convert_pdf_to_images, 
    save_image_temporarily
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- FastAPI App Initialization ---
app = FastAPI(title="Multilingual OCR Extraction & Verification API")

origins = [
    "http://127.0.0.1:5500", "http://localhost:5500",
    "http://127.0.0.1:3000", "http://localhost:3000"
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

# --- Language Processor Dispatcher ---
def get_language_processors(lang: str):
    """Returns the correct functions based on the language code."""
    if lang == 'ch':
        return {
            "extract_with_detection": extract_text_with_detection_ch,
            "map_fields": map_fields_ch,
            "create_overlay": create_confidence_overlay_ch,
        }
    elif lang == 'ja':
        return {
            "extract_with_detection": extract_text_with_detection_ja,
            "map_fields": map_fields_ja,
            "create_overlay": create_confidence_overlay_ja,
        }
    elif lang == 'ko':
        return {
            "extract_with_detection": extract_text_with_detection_ko,
            "map_fields": map_fields_ko,
            "create_overlay": create_confidence_overlay_ko,
        }
    else:  # Default to English
        return {
            "extract_with_detection": extract_text_with_detection_en,
            "map_fields": map_fields_en,
            "create_overlay": create_confidence_overlay_en,
        }

# --- API Endpoints ---

@app.post("/extract")
async def extract(
    document: UploadFile = File(...),
    include_detection: str = Form(default="false"),
    page_number: int = Form(default=1),
    language: str = Form(default="en")
):
    """
    Extract text & structured fields from a document (image or single PDF page).
    Supports multiple languages: en, ch, ja, ko.
    """
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        processors = get_language_processors(language.lower())
        is_pdf = is_pdf_file(temp_path)
        
        if not is_pdf:
            quality_report = check_image_quality(temp_path)
            if quality_report["score"] < 40:
                return JSONResponse(
                    status_code=400,
                    content={
                        "error": "Image quality too poor for reliable OCR.",
                        "quality": quality_report
                    }
                )
        
        # Consistent extraction using the detailed function
        detection_result = processors["extract_with_detection"](temp_path, page_number=page_number)
        if "error" in detection_result:
            return JSONResponse(status_code=500, content={"error": detection_result["error"]})
        
        fields = processors["map_fields"](detection_result)
        
        # Return detection data only if requested
        if include_detection.lower() == "true":
            overlay_image = processors["create_overlay"](temp_path, detection_result["detections"])
            return {
                "mapped_fields": fields,
                "detections": detection_result["detections"],
                "total_detections": detection_result["total_detections"],
                "confidence_overlay": overlay_image,
                "has_detection_data": True,
                "processing_info": {
                    "language": detection_result.get("language", language),
                    "elapsed_time": detection_result.get("elapsed_time", 0),
                    "page_number": page_number,
                    "is_pdf": is_pdf
                }
            }
        else:
            return {
                "mapped_fields": fields,
                "has_detection_data": False,
                "processing_info": {
                    "language": detection_result.get("language", language),
                    "elapsed_time": detection_result.get("elapsed_time", 0),
                    "page_number": page_number,
                    "is_pdf": is_pdf
                }
            }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/extract/pdf/all")
async def extract_pdf_all_pages(
    document: UploadFile = File(...),
    language: str = Form(default="en")
):
    """Extract structured data from all pages of a PDF document in the specified language."""
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
        
    try:
        if not is_pdf_file(temp_path):
            return JSONResponse(status_code=400, content={"error": "File is not a PDF document"})

        processors = get_language_processors(language.lower())
        extract_page_func = processors["extract_with_detection"]
        map_fields_func = processors["map_fields"]
        
        total_pages = get_pdf_page_count(temp_path)
        images = convert_pdf_to_images(temp_path, dpi=200)
        
        processed_pages = {}
        for page_num, image in enumerate(images, 1):
            page_temp_path = save_image_temporarily(image, suffix='.png')
            try:
                page_data = extract_page_func(page_temp_path, page_number=page_num)
                if "error" in page_data:
                    processed_pages[str(page_num)] = {"error": page_data["error"], "page_number": page_num}
                    continue

                page_fields = map_fields_func(page_data)
                processed_pages[str(page_num)] = {
                    "mapped_fields": page_fields,
                    "detections": page_data.get("detections", []),
                    "processing_info": {
                        "language": page_data.get("language", language),
                        "page_number": int(page_num)
                    }
                }
            finally:
                if os.path.exists(page_temp_path):
                    os.remove(page_temp_path)
        
        return {
            "total_pages": total_pages,
            "pages": processed_pages,
            "is_pdf": True
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/detect")
async def detect_text_regions(
    document: UploadFile = File(...),
    page_number: int = Form(default=1),
    language: str = Form(default="en")
):
    """Get text detection regions and confidence zones only for a specific language."""
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        processors = get_language_processors(language.lower())
        detection_result = processors["extract_with_detection"](temp_path, page_number=page_number)
        
        if "error" in detection_result:
            return JSONResponse(status_code=500, content={"error": detection_result["error"]})
        
        overlay_image = processors["create_overlay"](temp_path, detection_result["detections"])
        
        return {
            "detections": detection_result["detections"],
            "total_detections": detection_result["total_detections"],
            "confidence_overlay": overlay_image,
            "processing_info": {
                "language": detection_result.get("language", language),
                "page_number": page_number,
                "is_pdf": detection_result.get("is_pdf", False)
            }
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/verify")
async def verify_file(
    document: UploadFile = File(...), 
    verification_data: str = Form(...)
):
    """Verify submitted form data against OCR extracted fields (language-agnostic verification)."""
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        try:
            submitted_data = json.loads(verification_data)
        except json.JSONDecodeError as e:
            return JSONResponse(status_code=400, content={"error": f"Invalid JSON in verification_data: {e}"})
        
        # Verification logic is assumed to be language-agnostic for now.
        # It uses the default English extractor internally.
        verification_result = verify_fields(submitted_data, temp_path)
        
        return JSONResponse(content={"success": True, "verification_result": verification_result})
    except Exception as e:
        logger.error(f"Verification failed: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": f"Verification failed: {e}", "success": False})
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "features": [
            "single_page_extraction", "multipage_pdf_extraction",
            "data_verification", "quality_assessment",
            "confidence_zones", "bounding_box_detection"
        ],
        "language_support": ["en", "ch", "ja", "ko"]
    }

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Multilingual OCR Extraction & Verification API",
        "version": "4.0.0",
        "endpoints": {
            "/extract": "Single page OCR (images/PDFs). Use 'language' form field ('en', 'ch', 'ja', 'ko').",
            "/extract/pdf/all": "Extract all pages from a PDF. Use 'language' form field.",
            "/detect": "Text detection and confidence zones. Use 'language' form field.",
            "/verify": "Single page data verification.",
            "/health": "Health check"
        },
        "supported_formats": ["PDF", "JPG", "JPEG", "PNG", "TIFF", "TIF"]
    }

