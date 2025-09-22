# ocr_chinese.py
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

# Assuming 'utils' is a local module in your project structure
# from .utils import (
#     convert_pdf_to_image,
#     convert_pdf_to_images,
#     is_pdf_file,
#     get_pdf_page_count,
#     save_image_temporarily
# )

logger = logging.getLogger(__name__)

# ----------------------------
# Load PHOCR model
# IMPORTANT: Ensure your PHOCR model is configured for Chinese, e.g., PHOCR(lang='ch')
# ----------------------------
engine = PHOCR()

# ----------------------------
# CHINESE KEY VARIANTS
# ----------------------------
_KEY_VARIANTS = {
    "name": ["姓名", "名字"],
    "age": ["年龄", "岁"],
    "gender": ["性别"],
    "dob": ["出生日期", "生日"],
    "address": ["地址", "住址"],
    "country": ["国家", "国籍"],
    "phone": ["电话", "手机号码", "联系电话"],
    "email": ["电子邮件", "邮箱"],
    "id_number": ["身份证号码", "护照号码", "证件号码", "ID"],
}

_LABEL_TO_FIELD = {}
for fld, variants in _KEY_VARIANTS.items():
    for v in variants:
        _LABEL_TO_FIELD[v.lower()] = fld

# build alternation for regex; put longer phrases first
_all_variants_sorted = sorted(set(_LABEL_TO_FIELD.keys()), key=lambda s: -len(s))
_LABEL_PATTERN = r'(' + '|'.join(re.escape(v) for v in _all_variants_sorted) + r')\s*:?\s*'
_LABEL_RE = re.compile(_LABEL_PATTERN, flags=re.IGNORECASE | re.DOTALL)

# ----------------------------
# Utility functions
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
        # # Load image - handle both regular images and PDFs
        # if is_pdf_file(image_path):
        #     logger.info("Converting PDF to image for overlay")
        #     image = convert_pdf_to_image(image_path, page_number=1, dpi=200)
        # else:
        image = Image.open(image_path).convert("RGB")

        # Create a copy for drawing
        overlay = image.copy()
        draw = ImageDraw.Draw(overlay)

        # Define colors for different confidence levels (RGB)
        colors = {
            "high": (34, 197, 94),      # Green
            "medium": (251, 191, 36),   # Yellow
            "low": (239, 68, 68),       # Red
            "very_low": (107, 114, 128)  # Gray
        }

        # IMPORTANT: You must use a font that supports Chinese characters.
        # e.g., "SimSun.ttf" on Windows, "STHeiti Medium.ttc" on macOS, or a custom Noto CJK font.
        try:
            font = ImageFont.truetype("SimSun.ttf", 14)
        except IOError:
            logger.warning("Chinese font 'SimSun.ttf' not found. Text in overlay may not render correctly. Falling back to default.")
            try:
                 font = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", 14) # macOS fallback
            except IOError:
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

def extract_text_with_detection(file_path: str, debug: bool = False, page_number: int = 1) -> Dict:
    logger.info(f"Starting text extraction with detection for: {file_path}")
    try:
        # # Handle PDF files
        # if is_pdf_file(file_path):
        #     logger.info(f"Converting PDF page {page_number} to image")
        #     image = convert_pdf_to_image(file_path, page_number=page_number, dpi=200)
        #     is_pdf = True
        # else:
        logger.info("Loading image file")
        image = Image.open(file_path).convert("RGB")
        # is_pdf = False
        is_pdf = file_path.lower().endswith('.pdf')


        quality_report = {"suggestions": [], "issues": [], "is_pdf": is_pdf}

        logger.info("Running PHOCR engine...")
        result = engine(image)
        logger.info(f"PHOCR result type: {type(result)}")

        detections = []
        full_text = ""
        texts, scores, boxes = [], [], []

        try:
            if hasattr(result, 'txts') and result.txts is not None:
                texts = list(result.txts)
            if hasattr(result, 'scores') and result.scores is not None:
                scores = list(result.scores)
            if hasattr(result, 'boxes') and result.boxes is not None:
                boxes = result.boxes.tolist() if isinstance(result.boxes, np.ndarray) else list(result.boxes)
        except Exception as e:
            logger.error(f"Error extracting PHOCR data: {e}")

        logger.info(f"Extracted: {len(texts)} texts, {len(scores)} scores, {len(boxes)} boxes")

        min_length = min(len(texts), len(scores), len(boxes))
        logger.info(f"Processing {min_length} detections")

        for i in range(min_length):
            try:
                text = texts[i] if i < len(texts) else ""
                score = scores[i] if i < len(scores) else 0.0
                box = boxes[i] if i < len(boxes) else []

                if debug:
                    logger.info(f"Detection {i}: text='{text}', score={score}, box={box}")

                confidence = safe_float_conversion(score)
                bbox = process_bounding_box(box)

                detection = {
                    "text": str(text),
                    "confidence": confidence,
                    "bbox": bbox,
                    "polygon": box,
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
            "language": str(result.lang_type) if hasattr(result, 'lang_type') else "ch",
            "elapsed_time": result.elapse if hasattr(result, 'elapse') else 0,
            "quality": quality_report,
            "page_number": page_number,
            "is_pdf": is_pdf
        }
        logger.info(f"Extraction completed: {len(detections)} detections found")
        return output

    except Exception as e:
        logger.error(f"Error in extract_text_with_detection: {e}", exc_info=True)
        return {"error": str(e)}

def map_fields(result: Dict) -> Dict:
    fields = {
        "name": None, "age": None, "gender": None, "dob": None, "address": None,
        "country": None, "phone": None, "email": None, "id_number": None,
    }
    confidence_scores = {k: None for k in fields.keys()}
    texts = []
    scores = []

    if "detections" in result:
        for detection in result["detections"]:
            texts.append(detection["text"])
            scores.append(detection["confidence"])
        full_text = " ".join(texts)
    elif isinstance(result.get("texts"), list):
        texts = result["texts"]
        scores = result.get("scores", [])
        full_text = " ".join(texts)
    else:
        return {field: {"value": None, "confidence": None} for field in fields.keys()}

    full_text = re.sub(r'\s+', ' ', full_text).strip()
    logger.info(f"Full Text for mapping: {full_text}")

    # Process each text segment individually first
    for i, text in enumerate(texts):
        confidence = scores[i] if i < len(scores) else 0.0
        text_lower = text.lower().strip()

        if re.match(r'姓名\s*:\s*(.+)', text_lower):
            match = re.search(r'姓名\s*:\s*(.+)', text_lower)
            if match and fields['name'] is None:
                fields['name'] = match.group(1).strip()
                confidence_scores['name'] = confidence
    
    # Find labeled values using regex on the full text
    matches = sorted(_LABEL_RE.finditer(full_text), key=lambda m: m.start())

    for i, m in enumerate(matches):
        label_text = m.group(1).lower()
        field = _LABEL_TO_FIELD.get(label_text)
        if not field or fields[field] is not None:
            continue

        start_val = m.end()
        end_val = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        raw_val = full_text[start_val:end_val]
        val = raw_val.strip(" \t\n\r:;,-")
        
        extracted_value = None
        if field == "email": extracted_value = _extract_email(val) or val
        elif field == "phone": extracted_value = _extract_phone(val) or val
        elif field == "age": extracted_value = _extract_age(val) or val
        else: extracted_value = val
        
        if extracted_value:
            fields[field] = extracted_value
            confidence_scores[field] = _calculate_confidence_for_text(texts, scores, extracted_value)
    
    # Fallback patterns
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

    # Clean up and prepare final output
    result_out = {}
    for k, v in fields.items():
        if isinstance(v, str):
            v = v.strip(" \t\n\r,:;")
            fields[k] = v if v else None
        result_out[k] = {"value": fields[k], "confidence": confidence_scores[k]}

    logger.info(f"Final mapped fields: {result_out}")
    return result_out

def _extract_email(s: str) -> str:
    m = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', s)
    return m.group(0).strip() if m else None

def _extract_phone(s: str) -> str:
    m = re.search(r'(\+?\d[\d\-\s().]{6,}\d)', s)
    return m.group(1).strip() if m else None

def _extract_age(s: str) -> str:
    m = re.search(r'\b(\d{1,3})\b', s)
    return m.group(1) if m else None

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
    return sum(scores) / len(scores) if scores else 0.0