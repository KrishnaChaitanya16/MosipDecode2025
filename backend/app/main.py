from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.extraction import (
    extract_text, 
    map_fields, 
    extract_text_with_detection, 
    create_confidence_overlay,
    extract_multipage_pdf
)
from app.verification import verify_fields
from fastapi.responses import JSONResponse
import json
from app.chinese_extraction import extract_chinese_text
import shutil
import uuid
import os
from app.quality import check_image_quality
from app.multipage_extraction import extract_multipage_text, map_multipage_fields
from app.utils import is_pdf_file, get_pdf_page_count
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="OCR Extraction & Verification API with PDF Support")

# CORS configuration
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
async def extract(document: UploadFile = File(...), include_detection: str = Form(default="false"), page_number: int = Form(default=1)):
    """Extract text & structured fields from a scanned document or PDF with optional detection overlay"""
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        # Check file type
        is_pdf = is_pdf_file(temp_path)
        
        if is_pdf:
            logger.info(f"Processing PDF file, page {page_number}")
            # For PDFs, we don't check image quality in the same way
            quality_report = {"score": 100, "suggestions": ["PDF file processed"]}
        else:
            # Regular image quality check
            quality_report = check_image_quality(temp_path)
            logger.info(f"Quality Report: {quality_report['score']}")
            
            if quality_report["score"] < 40:
                return {
                    "error": "Image quality too poor for reliable OCR.",
                    "quality": quality_report
                }

        # Check if detection is requested
        include_detection_bool = include_detection.lower() == "true"
        
        if include_detection_bool:
            # Get detection data along with text
            detection_result = extract_text_with_detection(temp_path, page_number=page_number)
            
            if "error" in detection_result:
                return {"error": detection_result["error"]}
            
            fields = map_fields(detection_result)
            
            # Create confidence overlay
            overlay_image = create_confidence_overlay(temp_path, detection_result["detections"])
            
            return {
                "mapped_fields": fields,
                "detections": detection_result["detections"],
                "total_detections": detection_result["total_detections"],
                "confidence_overlay": overlay_image,
                "has_detection_data": True,
                "processing_info": {
                    "language": detection_result.get("language", "unknown"),
                    "elapsed_time": detection_result.get("elapsed_time", 0),
                    "page_number": page_number,
                    "is_pdf": is_pdf
                }
            }
        else:
            # Regular extraction without detection
            text = extract_text(temp_path, page_number=page_number)
            if "error" in text:
                return {"error": text["error"]}
            
            fields = map_fields(text)
            return {
                "mapped_fields": fields,
                "processing_info": {
                    "page_number": page_number,
                    "is_pdf": is_pdf
                }
            }
            
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/extract/pdf/all")
async def extract_pdf_all_pages(document: UploadFile = File(...)):
    """Extract text from all pages of a PDF document"""
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        # Check if it's actually a PDF
        if not is_pdf_file(temp_path):
            return {"error": "File is not a PDF document"}
        
        # Extract from all pages
        pdf_results = extract_multipage_pdf(temp_path)
        
        if "error" in pdf_results:
            return {"error": pdf_results["error"]}
        
        # Process each page to get structured fields
        processed_pages = {}
        
        for page_num, page_data in pdf_results["pages"].items():
            if "error" not in page_data:
                # Extract and map fields for this page
                page_fields = map_fields(page_data)
                
                processed_pages[page_num] = {
                    "mapped_fields": page_fields,
                    "detections": page_data.get("detections", []),
                    "total_detections": page_data.get("total_detections", 0),
                    "processing_info": {
                        "language": page_data.get("language", "unknown"),
                        "elapsed_time": page_data.get("elapsed_time", 0),
                        "page_number": int(page_num)
                    }
                }
            else:
                processed_pages[page_num] = {
                    "error": page_data["error"],
                    "page_number": int(page_num)
                }
        
        return {
            "total_pages": pdf_results["total_pages"],
            "pages": processed_pages,
            "is_pdf": True
        }
        
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/detect")
async def detect_text_regions(document: UploadFile = File(...), page_number: int = Form(default=1)):
    """Get text detection regions and confidence zones only"""
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        detection_result = extract_text_with_detection(temp_path, page_number=page_number)
        
        if "error" in detection_result:
            return {"error": detection_result["error"]}
        
        overlay_image = create_confidence_overlay(temp_path, detection_result["detections"])
        
        return {
            "detections": detection_result["detections"],
            "total_detections": detection_result["total_detections"],
            "confidence_overlay": overlay_image,
            "processing_info": {
                "language": detection_result.get("language", "unknown"),
                "elapsed_time": detection_result.get("elapsed_time", 0),
                "page_number": page_number,
                "is_pdf": detection_result.get("is_pdf", False)
            }
        }
        
    except Exception as e:
        return {"error": f"Detection failed: {str(e)}"}
        
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/pdf/info")
async def get_pdf_info(file_path: str):
    """Get PDF information like page count"""
    try:
        if not is_pdf_file(file_path):
            return {"error": "File is not a PDF"}
        
        page_count = get_pdf_page_count(file_path)
        
        return {
            "is_pdf": True,
            "total_pages": page_count,
            "supported_formats": [".pdf"]
        }
        
    except Exception as e:
        return {"error": f"Failed to get PDF info: {str(e)}"}

# Keep all your existing endpoints unchanged
# (extract/multipage, verify, verify/multipage, chinese_extract, health, root)

@app.post("/extract/multipage")
async def extract_multipage(document: UploadFile = File(...), multipage: str = Form(default="true")):
    """Extract text & structured fields from a multipage document (improved with PDF support)"""
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        # Check file type
        is_pdf = is_pdf_file(temp_path)
        file_extension = document.filename.lower().split('.')[-1] if '.' in document.filename else ''
        
        if is_pdf:
            # Use the new PDF extraction method
            logger.info("Processing PDF with dedicated PDF extraction")
            return await extract_pdf_all_pages(document)
        elif file_extension not in ['tiff', 'tif']:
            # For single image files, treat as single page
            quality_report = check_image_quality(temp_path)
            if quality_report["score"] < 40:
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
        
        # Extract from multipage TIFF/TIF (your existing logic)
        multipage_results = extract_multipage_text(temp_path)
        
        if not multipage_results or "pages" not in multipage_results:
            return {
                "error": "Failed to process multipage document.",
                "quality": {"score": 0, "suggestions": ["Document format not supported or corrupted"]}
            }
        
        # Process each page (your existing logic continues...)
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

# Keep your existing verify, verify/multipage, chinese_extract endpoints unchanged...

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "features": [
            "single_page_extraction",
            "multipage_extraction", 
            "pdf_extraction",
            "pdf_multipage_extraction",
            "data_verification",
            "chinese_text_extraction",
            "quality_assessment",
            "confidence_zones",
            "bounding_box_detection"
        ]
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "OCR Extraction & Verification API with PDF Support",
        "version": "3.0.0",
        "endpoints": {
            "/extract": "Single page OCR extraction (images + PDFs with page number)",
            "/extract/pdf/all": "Extract all pages from PDF document",
            "/extract/multipage": "Multipage document OCR extraction (TIFF/PDF)",
            "/detect": "Text detection regions and confidence zones (images + PDFs)",
            "/pdf/info": "Get PDF information (page count, etc.)",
            "/verify": "Single page data verification",
            "/verify/multipage": "Multipage data verification",
            "/chinese_extract": "Chinese text extraction",
            "/health": "Health check"
        },
        "supported_formats": ["PDF", "JPG", "JPEG", "PNG", "TIFF", "TIF"]
    }

# Helper function for multipage verification (you may need to implement this)
def verify_fields_with_extracted_data(submitted_data, extracted_data):
    """
    Verify submitted data against already extracted data
    This is a placeholder - you'll need to implement this based on your verification logic
    """
    # Import your verification logic here
    from app.verification import compare_fields
    
    verification_result = {
        "verification_summary": {
            "total_fields": len(submitted_data),
            "matched_fields": 0,
            "mismatched_fields": 0,
            "not_found_fields": 0,
            "overall_match_rate": 0.0
        },
        "field_results": {},
        "ocr_debug": {
            "extracted_fields": extracted_data,
            "extraction_confidences": {}
        }
    }
    
    for field_name, submitted_value in submitted_data.items():
        extracted_value = extracted_data.get(field_name, None)
        
        if extracted_value is None:
            verification_result["field_results"][field_name] = {
                "submitted": submitted_value,
                "extracted": None,
                "status": "NOT_FOUND",
                "similarity_score": 0.0,
                "extraction_confidence": 0.0,
                "overall_confidence": 0.0
            }
            verification_result["verification_summary"]["not_found_fields"] += 1
        else:
            # Use your existing comparison logic if available
            try:
                comparison = compare_fields(submitted_value, extracted_value)
                verification_result["field_results"][field_name] = comparison
                
                if comparison["status"] == "MATCH":
                    verification_result["verification_summary"]["matched_fields"] += 1
                else:
                    verification_result["verification_summary"]["mismatched_fields"] += 1
            except:
                # Fallback simple comparison
                status = "MATCH" if str(submitted_value).lower() == str(extracted_value).lower() else "MISMATCH"
                verification_result["field_results"][field_name] = {
                    "submitted": submitted_value,
                    "extracted": extracted_value,
                    "status": status,
                    "similarity_score": 1.0 if status == "MATCH" else 0.0,
                    "extraction_confidence": 1.0,
                    "overall_confidence": 1.0 if status == "MATCH" else 0.0
                }
                
                if status == "MATCH":
                    verification_result["verification_summary"]["matched_fields"] += 1
                else:
                    verification_result["verification_summary"]["mismatched_fields"] += 1
    
    # Calculate overall match rate
    total = verification_result["verification_summary"]["total_fields"]
    matched = verification_result["verification_summary"]["matched_fields"]
    verification_result["verification_summary"]["overall_match_rate"] = matched / total if total > 0 else 0.0
    
    return verification_result

@app.post("/verify")
async def verify_file(
    document: UploadFile = File(...), 
    verification_data: str = Form(...)
):
    """
    Verify submitted form data against OCR extracted fields.
    """
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        # Parse the verification data JSON string
        try:
            submitted_data = json.loads(verification_data)
            logger.info(f"📝 Submitted data for verification: {submitted_data}")
        except json.JSONDecodeError as e:
            return JSONResponse(
                status_code=400,
                content={"error": f"Invalid JSON in verification_data: {str(e)}"}
            )
        
        # Check if file exists and is readable
        if not os.path.exists(temp_path):
            return JSONResponse(
                status_code=400,
                content={"error": "Failed to save uploaded file"}
            )
        
        logger.info(f"🔍 Starting verification for file: {temp_path}")
        
        # Call your verification function
        verification_result = verify_fields(submitted_data, temp_path)
        
        logger.info(f"✅ Verification completed: {verification_result.get('verification_summary', {})}")
        
        return JSONResponse(content={
            "success": True,
            "verification_result": verification_result
        })
        
    except Exception as e:
        logger.error(f"❌ Verification failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Verification failed: {str(e)}",
                "success": False
            }
        )
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info(f"🧹 Cleaned up temp file: {temp_path}")

@app.post("/verify/multipage")
async def verify_multipage_file(
    document: UploadFile = File(...),
    verification_data: str = Form(...)
):
    """
    Verify submitted form data against multipage OCR extracted fields.
    """
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        # Parse the verification data JSON string
        try:
            submitted_data = json.loads(verification_data)
            logger.info(f"📝 Multipage submitted data: {submitted_data}")
        except json.JSONDecodeError as e:
            return JSONResponse(
                status_code=400,
                content={"error": f"Invalid JSON in verification_data: {str(e)}"}
            )
        
        # Extract text from all pages first
        multipage_results = extract_multipage_text(temp_path)
        
        if not multipage_results or "pages" not in multipage_results:
            return JSONResponse(
                status_code=400,
                content={"error": "Failed to extract text from multipage document"}
            )
        
        # Verify against each page
        page_verifications = {}
        overall_verification = {
            "verification_summary": {
                "total_fields": len(submitted_data),
                "matched_fields": 0,
                "mismatched_fields": 0,
                "not_found_fields": 0,
                "overall_match_rate": 0.0
            },
            "field_results": {},
            "pages": {}
        }
        
        for page_num, page_data in multipage_results["pages"].items():
            page_text = page_data.get("text", "")
            page_fields = map_multipage_fields(page_text, int(page_num))
            
            # Create a temporary verification for this page
            page_verification = verify_fields_with_extracted_data(submitted_data, page_fields)
            page_verifications[page_num] = page_verification
        
        # Aggregate results from all pages (simple approach - take best match)
        # You might want to implement more sophisticated logic here
        best_matches = {}
        for field in submitted_data.keys():
            best_score = 0
            best_result = None
            
            for page_num, page_verification in page_verifications.items():
                if field in page_verification["field_results"]:
                    field_result = page_verification["field_results"][field]
                    if field_result["similarity_score"] > best_score:
                        best_score = field_result["similarity_score"]
                        best_result = field_result
                        best_result["found_on_page"] = page_num
            
            if best_result:
                overall_verification["field_results"][field] = best_result
                if best_result["status"] == "MATCH":
                    overall_verification["verification_summary"]["matched_fields"] += 1
                else:
                    overall_verification["verification_summary"]["mismatched_fields"] += 1
            else:
                overall_verification["verification_summary"]["not_found_fields"] += 1
                overall_verification["field_results"][field] = {
                    "submitted": submitted_data[field],
                    "extracted": None,
                    "status": "NOT_FOUND",
                    "similarity_score": 0.0,
                    "extraction_confidence": 0.0,
                    "overall_confidence": 0.0,
                    "found_on_page": None
                }
        
        # Calculate overall match rate
        total = overall_verification["verification_summary"]["total_fields"]
        matched = overall_verification["verification_summary"]["matched_fields"]
        overall_verification["verification_summary"]["overall_match_rate"] = matched / total if total > 0 else 0.0
        
        overall_verification["pages"] = page_verifications
        
        return JSONResponse(content={
            "success": True,
            "verification_result": overall_verification,
            "total_pages": multipage_results.get("total_pages", 0)
        })
        
    except Exception as e:
        logger.error(f"❌ Multipage verification failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Multipage verification failed: {str(e)}",
                "success": False
            }
        )
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/chinese_extract")
async def chinese_extract(document: UploadFile = File(...)):
    """Extract Chinese text from document"""
    file_id = str(uuid.uuid4())
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(document.file, buffer)
    
    try:
        # Check quality first
        quality_report = check_image_quality(temp_path)
        logger.info(f"Chinese extraction - Quality Report: {quality_report['score']}")
        
        if quality_report["score"] < 40:
            return {
                "error": "Image quality too poor for reliable Chinese OCR.",
                "quality": quality_report
            }
        
        # Extract Chinese text
        chinese_result = extract_chinese_text(temp_path)
        
        if "error" in chinese_result:
            return {"error": chinese_result["error"]}
        
        # Map Chinese fields
        chinese_fields = map_fields(chinese_result)
        
        return {
            "mapped_fields": chinese_fields,
            "quality": quality_report,
            "language": "chinese",
            "processing_info": {
                "language": "chinese",
                "elapsed_time": chinese_result.get("elapsed_time", 0)
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Chinese extraction failed: {str(e)}")
        return {"error": f"Chinese extraction failed: {str(e)}"}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
