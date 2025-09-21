import os
import re
from typing import Dict, List
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
from phocr import PHOCR
import base64
import io
import json
import logging

# Import PDF utilities
from .utils import (
    convert_pdf_to_image, 
    convert_pdf_to_images, 
    is_pdf_file, 
    get_pdf_page_count,
    save_image_temporarily
)

logger = logging.getLogger(__name__)

# ----------------------------
# Load PHOCR model
# ----------------------------
engine = PHOCR()

# Your existing code for _KEY_VARIANTS, _LABEL_TO_FIELD, etc. remains the same...
_KEY_VARIANTS = {
    "name": ["full name", "name"],
    "age": ["age", "years", "y/o"],
    "gender": ["gender", "sex"],
    "dob": ["dob", "date of birth", "birthdate", "birth date"],
    "address": ["address", "addr"],
    "country": ["country", "nation", "nationality"],
    "phone": ["phone number", "phone", "mobile", "tel", "telephone", "contact", "number"],
    "email": ["email", "e-mail", "email address"],
    "id_number": ["id number", "id", "passport no", "passport number", "passport"],
}

_LABEL_TO_FIELD = {}
for fld, variants in _KEY_VARIANTS.items():
    for v in variants:
        _LABEL_TO_FIELD[v.lower()] = fld

# build alternation for regex; put longer phrases first
_all_variants_sorted = sorted(set(_LABEL_TO_FIELD.keys()), key=lambda s: -len(s))
_LABEL_PATTERN = r'\b(' + '|'.join(re.escape(v) for v in _all_variants_sorted) + r')\b\s*:?\s*'
_LABEL_RE = re.compile(_LABEL_PATTERN, flags=re.IGNORECASE | re.DOTALL)

# ----------------------------
# Utility functions (keep your existing ones)
# ----------------------------
def get_confidence_level(confidence):
    """Categorize confidence into levels"""
    try:
        conf = float(confidence) if not isinstance(confidence, (int, float)) else confidence
        if conf >= 0.9:
            return "high"
        elif conf >= 0.7:
            return "medium"
        elif conf >= 0.5:
            return "low"
        else:
            return "very_low"
    except (ValueError, TypeError):
        return "very_low"

def safe_float_conversion(value):
    """Safely convert value to float, handling various input types"""
    try:
        if isinstance(value, (list, tuple, np.ndarray)):
            # If it's a list/array, try to get the first numeric value
            for item in value:
                try:
                    return float(item)
                except (ValueError, TypeError):
                    continue
            return 0.0
        return float(value)
    except (ValueError, TypeError):
        return 0.0

def process_bounding_box(box):
    """Process bounding box coordinates to ensure consistent format"""
    try:
        # Handle different possible formats of bounding boxes
        if isinstance(box, (list, tuple, np.ndarray)):
            box = list(box)  # Convert to list for consistency
            
            # Flatten nested structures if needed
            flat_box = []
            for item in box:
                if isinstance(item, (list, tuple, np.ndarray)):
                    flat_box.extend(item)
                else:
                    flat_box.append(item)
            
            # Convert all values to float safely
            coords = [safe_float_conversion(coord) for coord in flat_box]
            
            if len(coords) >= 8:  # 4 points with x,y coordinates [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
                x_coords = [coords[i] for i in range(0, 8, 2)]
                y_coords = [coords[i] for i in range(1, 8, 2)]
                return {
                    "x1": min(x_coords),
                    "y1": min(y_coords),
                    "x2": max(x_coords),
                    "y2": max(y_coords)
                }
            elif len(coords) >= 4:  # Already in x1,y1,x2,y2 format or similar
                return {
                    "x1": min(coords[0], coords[2] if len(coords) > 2 else coords[0]),
                    "y1": min(coords[1], coords[3] if len(coords) > 3 else coords[1]),
                    "x2": max(coords[0], coords[2] if len(coords) > 2 else coords[0]),
                    "y2": max(coords[1], coords[3] if len(coords) > 3 else coords[1])
                }
            else:
                # Not enough coordinates, return default
                return {"x1": 0, "y1": 0, "x2": 100, "y2": 20}
        else:
            # Single value or unexpected format
            return {"x1": 0, "y1": 0, "x2": 100, "y2": 20}
            
    except Exception as e:
        logger.error(f"Error processing bounding box {box}: {e}")
        return {"x1": 0, "y1": 0, "x2": 100, "y2": 20}

def create_confidence_overlay(image_path: str, detections: List[Dict]) -> str:
    """
    Create an image overlay with confidence zones using bounding boxes
    Returns base64 encoded image
    """
    logger.info(f"Creating confidence overlay for {len(detections)} detections")
    
    try:
        # Load image - handle both regular images and PDFs
        if is_pdf_file(image_path):
            logger.info("Converting PDF to image for overlay")
            image = convert_pdf_to_image(image_path, page_number=1, dpi=200)
        else:
            image = Image.open(image_path).convert("RGB")
        
        # Create a copy for drawing
        overlay = image.copy()
        draw = ImageDraw.Draw(overlay)
        
        # Define colors for different confidence levels (RGB)
        colors = {
            "high": (34, 197, 94),       # Green
            "medium": (251, 191, 36),    # Yellow  
            "low": (239, 68, 68),        # Red
            "very_low": (107, 114, 128)  # Gray
        }
        
        # Load a font (try to use a better font if available)
        try:
            font = ImageFont.truetype("arial.ttf", 14)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 14)  # macOS
            except:
                try:
                    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)  # Linux
                except:
                    font = ImageFont.load_default()
        
        logger.info(f"Processing {len(detections)} detections for overlay")
        
        for i, detection in enumerate(detections):
            try:
                bbox = detection["bbox"]
                confidence_level = detection["confidence_level"]
                color = colors.get(confidence_level, colors["low"])
                
                # Draw rectangle
                draw.rectangle(
                    [bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]],
                    outline=color,
                    width=3
                )
                
                # Add semi-transparent fill
                overlay_temp = Image.new('RGBA', overlay.size, (0, 0, 0, 0))
                draw_temp = ImageDraw.Draw(overlay_temp)
                draw_temp.rectangle(
                    [bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]],
                    fill=(*color, 50)  # Add transparency
                )
                overlay = Image.alpha_composite(overlay.convert('RGBA'), overlay_temp).convert('RGB')
                draw = ImageDraw.Draw(overlay)
                
                # Add confidence text
                confidence_text = f"{detection['confidence']:.2f}"
                
                # Calculate text position
                text_x = max(0, bbox["x1"])
                text_y = max(0, bbox["y1"] - 20)
                
                # Draw text background
                try:
                    text_bbox = draw.textbbox((text_x, text_y), confidence_text, font=font)
                    draw.rectangle(text_bbox, fill=(255, 255, 255, 200))
                except:
                    # Fallback if textbbox is not available
                    draw.rectangle([text_x, text_y, text_x + 40, text_y + 15], fill=(255, 255, 255, 200))
                
                # Draw text
                draw.text((text_x + 2, text_y + 2), confidence_text, fill=color, font=font)
                
            except Exception as e:
                logger.error(f"Error drawing detection {i}: {e}")
                continue
        
        # Convert to base64
        buffer = io.BytesIO()
        overlay.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        logger.info(f"Successfully created overlay image (base64 length: {len(img_base64)})")
        return img_base64
        
    except Exception as e:
        logger.error(f"Error creating confidence overlay: {e}")
        return None

# ----------------------------
# Enhanced OCR extraction with PDF support
# ----------------------------
def extract_text_with_detection(file_path: str, debug: bool = False, page_number: int = 1) -> Dict:
    """
    Extract text with bounding boxes and confidence scores for confidence zones
    Now supports PDFs by converting to image first
    
    Args:
        file_path: Path to image or PDF file
        debug: Enable debug output
        page_number: Page number for PDFs (1-indexed)
        
    Returns:
        Dict with text, detections, and metadata
    """
    logger.info(f"Starting text extraction with detection for: {file_path}")
    
    try:
        # Handle PDF files
        if is_pdf_file(file_path):
            logger.info(f"Converting PDF page {page_number} to image")
            image = convert_pdf_to_image(file_path, page_number=page_number, dpi=200)
            is_pdf = True
        else:
            logger.info("Loading image file")
            image = Image.open(file_path).convert("RGB")
            is_pdf = False

        # Initialize quality report
        quality_report = {
            "suggestions": [],
            "issues": [],
            "is_pdf": is_pdf
        }

        logger.info("Running PHOCR engine...")
        # Run PHOCR
        result = engine(image)
        
        logger.info(f"PHOCR result type: {type(result)}")
        
        # Process results to extract bounding boxes, text, and confidence
        detections = []
        full_text = ""
        
        # Safely extract data from PHOCR result
        texts = []
        scores = []
        boxes = []
        
        try:
            if hasattr(result, 'txts') and result.txts is not None:
                texts = list(result.txts)
            if hasattr(result, 'scores') and result.scores is not None:
                scores = list(result.scores)
            if hasattr(result, 'boxes') and result.boxes is not None:
                if isinstance(result.boxes, np.ndarray):
                    boxes = result.boxes.tolist()
                else:
                    boxes = list(result.boxes)
        except Exception as e:
            logger.error(f"Error extracting PHOCR data: {e}")
        
        logger.info(f"Extracted: {len(texts)} texts, {len(scores)} scores, {len(boxes)} boxes")
        
        # Process each detection
        min_length = min(len(texts), len(scores), len(boxes))
        logger.info(f"Processing {min_length} detections")
        
        for i in range(min_length):
            try:
                text = texts[i] if i < len(texts) else ""
                score = scores[i] if i < len(scores) else 0.0
                box = boxes[i] if i < len(boxes) else []
                
                if debug:
                    logger.info(f"Detection {i}: text='{text}', score={score}, box={box}")
                
                # Convert score to float safely
                confidence = safe_float_conversion(score)
                
                # Process bounding box
                bbox = process_bounding_box(box)
                
                detection = {
                    "text": str(text),
                    "confidence": confidence,
                    "bbox": bbox,
                    "polygon": box,  # Original coordinates
                    "confidence_level": get_confidence_level(confidence)
                }
                
                detections.append(detection)
                full_text += str(text) + " "
                
            except Exception as e:
                logger.error(f"Error processing detection {i}: {e}")
                continue
        
        output = {
            "text": full_text.strip(),
            "detections": detections,
            "total_detections": len(detections),
            "texts": texts,
            "scores": scores,
            "boxes": boxes,
            "language": str(result.lang_type) if hasattr(result, 'lang_type') else "en",
            "elapsed_time": result.elapse if hasattr(result, 'elapse') else 0,
            "quality": quality_report,
            "page_number": page_number,
            "is_pdf": is_pdf
        }

        logger.info(f"Extraction completed: {len(detections)} detections found")
        if debug:
            logger.info(f"OCR Output with Detection: {output}")
        
        return output

    except Exception as e:
        logger.error(f"Error in extract_text_with_detection: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

def extract_text(file_path: str, debug: bool = False, page_number: int = 1) -> Dict:
    """
    Extract text from image or PDF
    
    Args:
        file_path: Path to image or PDF file
        debug: Enable debug output
        page_number: Page number for PDFs (1-indexed)
        
    Returns:
        Dict with extraction results
    """
    try:
        # Handle PDF files
        if is_pdf_file(file_path):
            logger.info(f"Converting PDF page {page_number} to image")
            image = convert_pdf_to_image(file_path, page_number=page_number, dpi=200)
        else:
            image = Image.open(file_path).convert("RGB")

        # Initialize quality report
        quality_report = {
            "suggestions": [],
            "issues": [],
            "is_pdf": is_pdf_file(file_path)
        }

        # Run PHOCR
        result = engine(image)
        output = {
            "texts": list(result.txts),
            "scores": list(result.scores),
            "boxes": result.boxes.tolist() if result.boxes is not None else [],
            "language": str(result.lang_type),
            "elapsed_time": result.elapse,
            "quality": quality_report,
            "page_number": page_number,
            "is_pdf": is_pdf_file(file_path)
        }

        if debug:
            logger.info(f"OCR Output: {output}")
        return output

    except Exception as e:
        logger.error(f"Error in extract_text: {e}")
        return {"error": str(e)}

# ----------------------------
# PDF-specific extraction functions
# ----------------------------
def extract_multipage_pdf(file_path: str, debug: bool = False) -> Dict:
    """
    Extract text from all pages of a PDF
    
    Args:
        file_path: Path to PDF file
        debug: Enable debug output
        
    Returns:
        Dict with results for all pages
    """
    if not is_pdf_file(file_path):
        raise ValueError("File is not a PDF")
        
    try:
        # Get page count
        total_pages = get_pdf_page_count(file_path)
        logger.info(f"Processing PDF with {total_pages} pages")
        
        # Convert all pages to images
        images = convert_pdf_to_images(file_path, dpi=200)
        
        pages_data = {}
        
        for page_num, image in enumerate(images, 1):
            logger.info(f"Processing page {page_num}/{total_pages}")
            
            try:
                # Save image temporarily for processing
                temp_image_path = save_image_temporarily(image, suffix='.jpg')
                
                try:
                    # Extract text from this page
                    page_result = extract_text_with_detection(temp_image_path, debug=debug, page_number=page_num)
                    
                    if "error" not in page_result:
                        pages_data[str(page_num)] = {
                            "text": page_result.get("text", ""),
                            "detections": page_result.get("detections", []),
                            "total_detections": page_result.get("total_detections", 0),
                            "language": page_result.get("language", "en"),
                            "elapsed_time": page_result.get("elapsed_time", 0),
                            "quality": page_result.get("quality", {}),
                            "page_number": page_num
                        }
                    else:
                        pages_data[str(page_num)] = {
                            "error": page_result["error"],
                            "page_number": page_num
                        }
                        
                finally:
                    # Clean up temporary file
                    if os.path.exists(temp_image_path):
                        os.remove(temp_image_path)
                        
            except Exception as e:
                logger.error(f"Error processing page {page_num}: {e}")
                pages_data[str(page_num)] = {
                    "error": f"Page processing failed: {str(e)}",
                    "page_number": page_num
                }
        
        return {
            "total_pages": total_pages,
            "pages": pages_data,
            "is_pdf": True
        }
        
    except Exception as e:
        logger.error(f"Error in extract_multipage_pdf: {e}")
        return {"error": str(e)}

# Keep all your existing utility functions unchanged
# (deskew_image, _extract_email, _extract_phone, etc.)

def deskew_image(image: Image.Image, max_angle=5):
    """
    Deskew the image if tilt is detected.
    Returns a corrected PIL Image.
    """
    img_gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    # Threshold (binary image)
    _, bw = cv2.threshold(img_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # Invert if needed (text should be black)
    if np.mean(bw) > 127:
        bw = 255 - bw
    # Detect coordinates of non-zero pixels
    coords = np.column_stack(np.where(bw > 0))
    angle = cv2.minAreaRect(coords)[-1]
    # Adjust OpenCV angle output
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    # Only correct small angles (to avoid false positives)
    if abs(angle) > max_angle:
        # Rotate
        (h, w) = img_gray.shape
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(np.array(image), M, (w, h),
                                flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return Image.fromarray(rotated), angle
    else:
        return image, 0.0

def _extract_email(s: str) -> str:
    m = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', s)
    return m.group(0).strip() if m else None

def _extract_phone(s: str) -> str:
    m = re.search(r'(\+?\d[\d\-\s().]{6,}\d)', s)
    return m.group(1).strip() if m else None

def _extract_age(s: str) -> str:
    m = re.search(r'\b(\d{1,3})\b', s)
    return m.group(1) if m else None

def _normalize_value_between_labels(val: str) -> str:
    return val.strip(" \t\n\r:;,-")

def _calculate_confidence_for_text(texts: List[str], scores: List[float], extracted_text: str) -> float:
    if not extracted_text or not texts or not scores:
        return 0.0
    matching_scores = []
    extracted_lower = extracted_text.lower().strip()
    for i, text_segment in enumerate(texts):
        if i < len(scores) and text_segment.lower().strip() in extracted_lower:
            matching_scores.append(scores[i])
    if matching_scores:
        return sum(matching_scores) / len(matching_scores)
    else:
        return sum(scores) / len(scores) if scores else 0.0

def map_fields(result: Dict) -> Dict:
    """
    Robust mapping of OCR result -> structured fields.
    Output: dict with keys: name, age, gender, dob, address, country, phone, email, id_number
    Each field contains: {"value": str, "confidence": float}
    """
    fields = {
        "name": None,
        "age": None,
        "gender": None,
        "dob": None,
        "address": None,
        "country": None,
        "phone": None,
        "email": None,
        "id_number": None,
    }

    confidence_scores = {k: None for k in fields.keys()}
    texts = []
    scores = []

    # UPDATED: Handle detection data format properly
    if isinstance(result, dict):
        if "detections" in result:
            # This is from extract_text_with_detection - use detection data
            logger.info("Processing detection-based result")
            for detection in result["detections"]:
                texts.append(detection["text"])
                scores.append(detection["confidence"])
            full_text = " ".join(texts)
        elif isinstance(result.get("texts"), list):
            # This is from regular extract_text
            texts = result["texts"]
            scores = result.get("scores", [])
            full_text = " ".join(texts)
        else:
            return {field: {"value": None, "confidence": None} for field in fields.keys()}
    elif isinstance(result, str):
        full_text = result
        texts = [result]
        scores = [1.0]
    else:
        return {field: {"value": None, "confidence": None} for field in fields.keys()}

    full_text = re.sub(r'\s+', ' ', full_text).strip()
    logger.info(f"Full Text for mapping: {full_text}")
    logger.info(f"Individual texts: {texts}")

    # EXISTING LOGIC: Your original pattern matching logic (unchanged)
    
    # Process each text segment individually first
    for i, text in enumerate(texts):
        confidence = scores[i] if i < len(scores) else 0.0
        text_lower = text.lower().strip()
        logger.info(f"Processing text segment: '{text}' with confidence: {confidence}")

        # Direct pattern matching for common formats
        if re.match(r'name\s*:\s*(.+)', text_lower):
            name_match = re.search(r'name\s*:\s*(.+)', text_lower)
            if name_match:
                name_value = name_match.group(1).strip()
                # Remove extra text after the name
                name_value = re.sub(r'\b(age|gender|years|male|female)\b.*$', '', name_value, flags=re.IGNORECASE).strip()
                if name_value:
                    fields["name"] = name_value
                    confidence_scores["name"] = confidence
                    logger.info(f"Found name: {name_value}")
        elif re.match(r'age\s*:\s*(\d+)', text_lower):
            age_match = re.search(r'age\s*:\s*(\d+)', text_lower)
            if age_match:
                fields["age"] = age_match.group(1)
                confidence_scores["age"] = confidence
                logger.info(f"Found age: {age_match.group(1)}")
        elif re.match(r'gender\s*:\s*(.+)', text_lower):
            gender_match = re.search(r'gender\s*:\s*(.+)', text_lower)
            if gender_match:
                gender_value = gender_match.group(1).strip()
                # Clean gender value
                gender_value = re.sub(r'\b(age|years|name)\b.*$', '', gender_value, flags=re.IGNORECASE).strip()
                if gender_value:
                    fields["gender"] = gender_value
                    confidence_scores["gender"] = confidence
                    logger.info(f"Found gender: {gender_value}")
        elif re.match(r'(country|nationality)\s*:\s*(.+)', text_lower):
            country_match = re.search(r'(country|nationality)\s*:\s*(.+)', text_lower)
            if country_match:
                country_value = country_match.group(2).strip()
                if country_value:
                    fields["country"] = country_value
                    confidence_scores["country"] = confidence
                    logger.info(f"Found country: {country_value}")

    # EXISTING LOGIC: Your original regex-based extraction (unchanged)
    
    # Find labeled values using your existing regex patterns
    matches = []
    for m in _LABEL_RE.finditer(full_text):
        label_text = m.group(1).lower()
        field = _LABEL_TO_FIELD.get(label_text)
        if field:
            matches.append({
                "field": field,
                "label": label_text,
                "start": m.start(),
                "end": m.end()
            })

    if matches:
        matches = sorted(matches, key=lambda x: x["start"])
        for i, mm in enumerate(matches):
            start_val = mm["end"]
            end_val = matches[i + 1]["start"] if i + 1 < len(matches) else len(full_text)
            raw_val = full_text[start_val:end_val]
            val = _normalize_value_between_labels(raw_val)
            fld = mm["field"]

            if fields[fld] is None:  # Only fill if not already found by detection parsing
                extracted_value = None
                if fld == "email":
                    extracted_value = _extract_email(val) or val or None
                elif fld == "phone":
                    extracted_value = _extract_phone(val) or val or None
                elif fld == "age":
                    extracted_value = _extract_age(val) or val or None
                elif fld == "name":
                    # Remove common interfering words from name
                    val = re.sub(r'(?i)\b(age|gender|address|country|phone|email|id|dob|passport)\b.*$', '', val).strip()
                    extracted_value = val or None
                else:
                    extracted_value = val or None

                if extracted_value:
                    fields[fld] = extracted_value
                    confidence_scores[fld] = _calculate_confidence_for_text(texts, scores, extracted_value)

    # EXISTING LOGIC: Your fallback patterns (unchanged)
    
    # Additional fallback patterns for common formats
    if not fields["email"]:
        email_val = _extract_email(full_text)
        if email_val:
            fields["email"] = email_val
            confidence_scores["email"] = _calculate_confidence_for_text(texts, scores, email_val)

    if not fields["phone"]:
        phone_val = _extract_phone(full_text)
        if phone_val:
            fields["phone"] = phone_val
            confidence_scores["phone"] = _calculate_confidence_for_text(texts, scores, phone_val)

    # Extract standalone age if not found
    if not fields["age"]:
        age_val = _extract_age(full_text)
        if age_val:
            fields["age"] = age_val
            confidence_scores["age"] = _calculate_confidence_for_text(texts, scores, age_val)

    # EXISTING LOGIC: Your cleanup and output (unchanged)
    
    # Clean up values and prepare final output
    result_out = {}
    for k, v in fields.items():
        if isinstance(v, str):
            v = v.strip(" \t\n\r,:;")
            fields[k] = v if v else None
        result_out[k] = {"value": fields[k], "confidence": confidence_scores[k]}

    logger.info(f"Final mapped fields: {result_out}")
    return result_out
