# ocr_korean.py
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
# IMPORTANT: Ensure your PHOCR model is configured for Korean, e.g., PHOCR(lang='ko')
# ----------------------------
engine = PHOCR()

# ----------------------------
# KOREAN KEY VARIANTS
# ----------------------------
_KEY_VARIANTS = {
    "name": ["이름", "성명"],
    "age": ["나이", "연세"],
    "gender": ["성별"],
    "dob": ["생년월일"],
    "address": ["주소"],
    "country": ["국가", "국적"],
    "phone": ["전화번호", "연락처", "핸드폰"],
    "email": ["이메일", "이메일 주소"],
    "id_number": ["주민등록번호", "여권번호", "ID"],
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
        if conf >= 0.9: return "high"
        elif conf >= 0.7: return "medium"
        elif conf >= 0.5: return "low"
        else: return "very_low"
    except (ValueError, TypeError):
        return "very_low"

def safe_float_conversion(value):
    """Safely convert value to float, handling various input types"""
    try:
        if isinstance(value, (list, tuple, np.ndarray)):
            for item in value:
                try: return float(item)
                except (ValueError, TypeError): continue
            return 0.0
        return float(value)
    except (ValueError, TypeError):
        return 0.0

def process_bounding_box(box):
    """Process bounding box coordinates to ensure consistent format"""
    try:
        if isinstance(box, (list, tuple, np.ndarray)):
            flat_box = []
            for item in list(box):
                if isinstance(item, (list, tuple, np.ndarray)): flat_box.extend(item)
                else: flat_box.append(item)
            coords = [safe_float_conversion(c) for c in flat_box]
            if len(coords) >= 8:
                x = [coords[i] for i in range(0, 8, 2)]; y = [coords[i] for i in range(1, 8, 2)]
                return {"x1": min(x), "y1": min(y), "x2": max(x), "y2": max(y)}
            elif len(coords) >= 4:
                return {"x1": min(coords[0], coords[2]), "y1": min(coords[1], coords[3]), "x2": max(coords[0], coords[2]), "y2": max(coords[1], coords[3])}
        return {"x1": 0, "y1": 0, "x2": 100, "y2": 20}
    except Exception as e:
        logger.error(f"Error processing bounding box {box}: {e}")
        return {"x1": 0, "y1": 0, "x2": 100, "y2": 20}

def create_confidence_overlay(image_path: str, detections: List[Dict]) -> str:
    """Create an image overlay with confidence zones using bounding boxes"""
    logger.info(f"Creating confidence overlay for {len(detections)} detections")
    try:
        image = Image.open(image_path).convert("RGB")
        overlay = image.copy()
        draw = ImageDraw.Draw(overlay)
        colors = {"high": (34,197,94), "medium": (251,191,36), "low": (239,68,68), "very_low": (107,114,128)}
        
        # IMPORTANT: You must use a font that supports Korean characters.
        # e.g., "Malgun Gothic" on Windows, "Apple SD Gothic Neo" on macOS, or a custom Noto CJK font.
        try:
            font = ImageFont.truetype("malgun.ttf", 14)
        except IOError:
            logger.warning("Korean font 'malgun.ttf' not found. Text in overlay may not render correctly. Falling back to default.")
            try:
                font = ImageFont.truetype("/System/Library/Fonts/AppleSDGothicNeo.ttc", 14) # macOS fallback
            except IOError:
                font = ImageFont.load_default()
        
        for i, detection in enumerate(detections):
            try:
                bbox, level, color = detection["bbox"], detection["confidence_level"], colors.get(detection["confidence_level"], colors["low"])
                draw.rectangle([bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]], outline=color, width=3)
                temp = Image.new('RGBA', overlay.size, (0,0,0,0)); ImageDraw.Draw(temp).rectangle([bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"]], fill=(*color, 50))
                overlay = Image.alpha_composite(overlay.convert('RGBA'), temp).convert('RGB'); draw = ImageDraw.Draw(overlay)
                text = f"{detection['confidence']:.2f}"; x, y = max(0, bbox["x1"]), max(0, bbox["y1"] - 20)
                try:
                    text_bbox = draw.textbbox((x,y), text, font=font); draw.rectangle(text_bbox, fill=(255,255,255,200))
                except:
                    draw.rectangle([x, y, x+40, y+15], fill=(255,255,255,200))
                draw.text((x+2, y+2), text, fill=color, font=font)
            except Exception as e:
                logger.error(f"Error drawing detection {i}: {e}")
        
        buf = io.BytesIO(); overlay.save(buf, format='PNG'); return base64.b64encode(buf.getvalue()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error creating confidence overlay: {e}"); return None

def extract_text_with_detection(file_path: str, debug: bool = False, page_number: int = 1) -> Dict:
    logger.info(f"Starting text extraction with detection for: {file_path}")
    try:
        image = Image.open(file_path).convert("RGB")
        is_pdf = file_path.lower().endswith('.pdf')
        result = engine(image)
        detections, full_text = [], ""
        
        texts = list(result.txts) if hasattr(result, 'txts') and result.txts is not None else []
        scores = list(result.scores) if hasattr(result, 'scores') and result.scores is not None else []
        boxes = result.boxes.tolist() if hasattr(result, 'boxes') and isinstance(result.boxes, np.ndarray) else []

        for i in range(min(len(texts), len(scores), len(boxes))):
            confidence = safe_float_conversion(scores[i])
            detections.append({
                "text": str(texts[i]), "confidence": confidence, "bbox": process_bounding_box(boxes[i]),
                "polygon": boxes[i], "confidence_level": get_confidence_level(confidence)
            })
            full_text += str(texts[i]) + " "
        
        return {
            "text": full_text.strip(), "detections": detections, "total_detections": len(detections),
            "texts": texts, "scores": scores, "boxes": boxes,
            "language": str(result.lang_type) if hasattr(result, 'lang_type') else "ko",
            "elapsed_time": result.elapse if hasattr(result, 'elapse') else 0,
            "quality": {"suggestions": [], "issues": [], "is_pdf": is_pdf},
            "page_number": page_number, "is_pdf": is_pdf
        }
    except Exception as e:
        logger.error(f"Error in extract_text_with_detection: {e}", exc_info=True)
        return {"error": str(e)}

def map_fields(result: Dict) -> Dict:
    fields = {k: None for k in ["name", "age", "gender", "dob", "address", "country", "phone", "email", "id_number"]}
    confidence_scores = {k: None for k in fields.keys()}
    texts, scores = [], []

    if "detections" in result:
        for d in result["detections"]: texts.append(d["text"]); scores.append(d["confidence"])
        full_text = " ".join(texts)
    else: return {f: {"value": None, "confidence": None} for f in fields.keys()}

    full_text = re.sub(r'\s+', ' ', full_text).strip()
    logger.info(f"Full Text for mapping: {full_text}")

    matches = sorted(_LABEL_RE.finditer(full_text), key=lambda m: m.start())
    for i, m in enumerate(matches):
        field = _LABEL_TO_FIELD.get(m.group(1).lower())
        if not field or fields[field] is not None: continue
        
        start_val = m.end()
        end_val = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        val = full_text[start_val:end_val].strip(" \t\n\r:;,-")
        
        if field == "email": extracted_value = _extract_email(val) or val
        elif field == "phone": extracted_value = _extract_phone(val) or val
        elif field == "age": extracted_value = _extract_age(val) or val
        else: extracted_value = val
        
        if extracted_value:
            fields[field] = extracted_value
            confidence_scores[field] = _calculate_confidence_for_text(texts, scores, extracted_value)

    if not fields["email"]:
        email_val = _extract_email(full_text)
        if email_val: fields["email"] = email_val; confidence_scores["email"] = _calculate_confidence_for_text(texts, scores, email_val)
    if not fields["phone"]:
        phone_val = _extract_phone(full_text)
        if phone_val: fields["phone"] = phone_val; confidence_scores["phone"] = _calculate_confidence_for_text(texts, scores, phone_val)

    result_out = {k: {"value": v.strip(" \t\n\r,:;") if isinstance(v, str) else v, "confidence": confidence_scores[k]} for k, v in fields.items()}
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
    if not extracted_text or not scores: return 0.0
    matching_scores = [scores[i] for i, seg in enumerate(texts) if i < len(scores) and seg.lower().strip() in extracted_text.lower().strip()]
    return sum(matching_scores) / len(matching_scores) if matching_scores else 0.0