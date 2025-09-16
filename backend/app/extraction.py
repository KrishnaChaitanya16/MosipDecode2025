import os
import re
from typing import Dict, List
from PIL import Image
import cv2
import numpy as np
from phocr import PHOCR


# ----------------------------
# Load PHOCR model
# ----------------------------
engine = PHOCR()

# ----------------------------
# Label mapping
# ----------------------------
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
# Utility extractors
# ----------------------------
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

# ----------------------------
# OCR extraction
# ----------------------------
def extract_text(file_path: str, debug: bool = False) -> Dict:
    try:
        if file_path.lower().endswith(".pdf"):
            from app.utils import convert_pdf_to_image
            image = convert_pdf_to_image(file_path)
        else:
            image = Image.open(file_path).convert("RGB")

        # Initialize quality report
        quality_report = {
            "suggestions": [],
            "issues": []
        }

        # 🔥 Step 2: Deskew image (if tilted)
        #image, angle_corrected = deskew_image(image)
        #if angle_corrected != 0:
        #    quality_report["suggestions"].append(f"Image was deskewed by {angle_corrected:.2f}°")

        # 🔥 Step 3: Proceed with PHOCR
        result = engine(image)

        output = {
            "texts": list(result.txts),
            "scores": list(result.scores),
            "boxes": result.boxes.tolist() if result.boxes is not None else [],
            "language": str(result.lang_type),
            "elapsed_time": result.elapse,
            "quality": quality_report,
        }

        if debug:
            print("OCR Output:", output)

        return output

    except Exception as e:
        return {"error": str(e)}

# ----------------------------
# Field Mapping
# ----------------------------
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
    if isinstance(result, dict) and isinstance(result.get("texts"), list):
        texts = result["texts"]
        scores = result.get("scores", [])
        full_text = " ".join(texts)
    elif isinstance(result, str):
        full_text = result
        texts = [result]
        scores = [1.0]
    else:
        return {field: {"value": None, "confidence": None} for field in fields.keys()}

    full_text = re.sub(r'\s+', ' ', full_text).strip()
    print("Full Text:", full_text)
    print("Individual texts:", texts)
    print("Scores:", scores)

    # Process each text segment individually first
    for i, text in enumerate(texts):
        confidence = scores[i] if i < len(scores) else 0.0
        text_lower = text.lower().strip()
        
        # Direct pattern matching for common formats
        if re.match(r'name\s*:\s*(.+)', text_lower):
            name_match = re.search(r'name\s*:\s*(.+)', text_lower)
            if name_match:
                fields["name"] = name_match.group(1).strip()
                confidence_scores["name"] = confidence
                
        elif re.match(r'age\s*:\s*(\d+)', text_lower):
            age_match = re.search(r'age\s*:\s*(\d+)', text_lower)
            if age_match:
                fields["age"] = age_match.group(1)
                confidence_scores["age"] = confidence
                
        elif re.match(r'gender\s*:\s*(.+)', text_lower):
            gender_match = re.search(r'gender\s*:\s*(.+)', text_lower)
            if gender_match:
                fields["gender"] = gender_match.group(1).strip()
                confidence_scores["gender"] = confidence
                
        elif re.match(r'country\s*:\s*(.+)', text_lower):
            country_match = re.search(r'country\s*:\s*(.+)', text_lower)
            if country_match:
                fields["country"] = country_match.group(1).strip()
                confidence_scores["country"] = confidence
                
        elif re.match(r'address\s*:\s*(.+)', text_lower):
            address_match = re.search(r'address\s*:\s*(.+)', text_lower)
            if address_match:
                fields["address"] = address_match.group(1).strip()
                confidence_scores["address"] = confidence
                
        elif re.match(r'email\s*:\s*(.+)', text_lower):
            email_match = re.search(r'email\s*:\s*(.+)', text_lower)
            if email_match:
                email_val = _extract_email(email_match.group(1)) or email_match.group(1).strip()
                fields["email"] = email_val
                confidence_scores["email"] = confidence
                
        elif re.match(r'phone\s*', text_lower) or re.match(r'number\s*:', text_lower):
            phone_val = _extract_phone(text)
            if phone_val:
                fields["phone"] = phone_val
                confidence_scores["phone"] = confidence

    # Fallback: Try the original label-based approach
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
            if fields[fld] is None:  # Only fill if not already found
                extracted_value = None
                if fld == "email":
                    extracted_value = _extract_email(val) or val or None
                elif fld == "phone":
                    extracted_value = _extract_phone(val) or val or None
                elif fld == "age":
                    extracted_value = _extract_age(val) or val or None
                elif fld == "name":
                    val = re.sub(r'(?i)\b(age|gender|address|country|phone|email|id|dob|passport)\b.*$', '', val).strip()
                    extracted_value = val or None
                else:
                    extracted_value = val or None

                if extracted_value:
                    fields[fld] = extracted_value
                    confidence_scores[fld] = _calculate_confidence_for_text(texts, scores, extracted_value)

    # Additional fallback patterns
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

    if not fields["id_number"]:
        id_m = re.search(r'\b(ID(?:\s*Number)?|Passport(?:\s*No(?:\.)?)?)[:\s]*([A-Z0-9\-]{5,30})\b', full_text, re.I)
        if id_m:
            id_val = id_m.group(2).strip()
            fields["id_number"] = id_val
            confidence_scores["id_number"] = _calculate_confidence_for_text(texts, scores, id_val)

    # Clean up values and prepare final output
    result_out = {}
    for k, v in fields.items():
        if isinstance(v, str):
            v = v.strip(" \t\n\r,:;")
            fields[k] = v if v else None
        result_out[k] = {"value": fields[k], "confidence": confidence_scores[k]}

    print("Final mapped fields:", result_out)
    return result_out