import cv2
import numpy as np
from PIL import Image
import fitz  # PyMuPDF for PDF handling
import os
from app.extraction import extract_text, map_fields
from app.quality import check_image_quality
import tempfile


def extract_multipage_text(file_path):
    """
    Extract text from multipage documents (PDF, TIFF, etc.)
    Returns: {
        "total_pages": int,
        "pages": {
            "1": {"text": "...", "quality": {...}},
            "2": {"text": "...", "quality": {...}},
            ...
        }
    }
    """
    file_extension = file_path.lower().split('.')[-1]
    
    if file_extension == 'pdf':
        return extract_from_pdf(file_path)
    elif file_extension in ['tiff', 'tif']:
        return extract_from_tiff(file_path)
    else:
        # Single image file - treat as single page
        text = extract_text(file_path)
        quality = check_image_quality(file_path)
        
        return {
            "total_pages": 1,
            "pages": {
                "1": {
                    "text": text,
                    "quality": quality
                }
            }
        }


def extract_from_pdf(pdf_path):
    """Extract text from PDF pages using PyMuPDF"""
    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        pages = {}
        
        for page_num in range(total_pages):
            page = doc.load_page(page_num)
            
            # Convert PDF page to image
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Save temporary image for OCR processing
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                tmp_file.write(img_data)
                tmp_path = tmp_file.name
            
            try:
                # Extract text using your existing OCR function
                text = extract_text(tmp_path)
                quality = check_image_quality(tmp_path)
                
                pages[str(page_num + 1)] = {
                    "text": text,
                    "quality": quality
                }
                
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
        
        doc.close()
        
        return {
            "total_pages": total_pages,
            "pages": pages
        }
        
    except Exception as e:
        raise Exception(f"Failed to process PDF: {str(e)}")


def extract_from_tiff(tiff_path):
    """Extract text from multi-page TIFF"""
    try:
        # Open TIFF with PIL
        with Image.open(tiff_path) as img:
            total_pages = img.n_frames if hasattr(img, 'n_frames') else 1
            pages = {}
            
            for page_num in range(total_pages):
                img.seek(page_num)
                
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    page_img = img.convert('RGB')
                else:
                    page_img = img.copy()
                
                # Save temporary image for OCR processing
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                    page_img.save(tmp_file.name, 'PNG')
                    tmp_path = tmp_file.name
                
                try:
                    # Extract text using your existing OCR function
                    text = extract_text(tmp_path)
                    quality = check_image_quality(tmp_path)
                    
                    pages[str(page_num + 1)] = {
                        "text": text,
                        "quality": quality
                    }
                    
                finally:
                    # Clean up temporary file
                    if os.path.exists(tmp_path):
                        os.remove(tmp_path)
            
            return {
                "total_pages": total_pages,
                "pages": pages
            }
            
    except Exception as e:
        raise Exception(f"Failed to process TIFF: {str(e)}")


def map_multipage_fields(text, page_number):
    """
    Map extracted text to structured fields for a specific page
    You can customize this to have different field mappings per page if needed
    """
    # Use your existing map_fields function
    # You could enhance this to have page-specific field mapping logic
    fields = map_fields(text)
    
    # Add page context to field metadata
    for field_name, field_data in fields.items():
        if isinstance(field_data, dict):
            field_data['page_number'] = page_number
        else:
            # Convert simple value to dict with page info
            fields[field_name] = {
                'value': field_data,
                'confidence': 0.9,  # Default confidence
                'page_number': page_number
            }
    
    return fields


def verify_fields_with_extracted_data(submitted_data, extracted_data):
    """
    Verify submitted data against already extracted data
    This is a helper function for multipage verification
    """
    from app.verification import compare_fields
    
    # Create the structure expected by your verification function
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
            # Use your existing comparison logic
            comparison = compare_fields(submitted_value, extracted_value)
            verification_result["field_results"][field_name] = comparison
            
            if comparison["status"] == "MATCH":
                verification_result["verification_summary"]["matched_fields"] += 1
            else:
                verification_result["verification_summary"]["mismatched_fields"] += 1
    
    # Calculate overall match rate
    total = verification_result["verification_summary"]["total_fields"]
    matched = verification_result["verification_summary"]["matched_fields"]
    verification_result["verification_summary"]["overall_match_rate"] = matched / total if total > 0 else 0.0
    
    return verification_result
