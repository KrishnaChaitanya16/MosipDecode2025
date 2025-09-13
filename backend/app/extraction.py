# extraction.py

import os
import re
from typing import Dict, List
from PIL import Image
from phocr import PHOCR

# ----------------------------
# Load PHOCR model
# ----------------------------
engine = PHOCR()


# canonical label variants grouped by target field
_KEY_VARIANTS = {
    "name": ["full name", "name"],
    "age": ["age", "years", "y/o"],
    "gender": ["gender", "sex"],
    "dob": ["dob", "date of birth", "birthdate", "birth date"],
    "address": ["address", "addr"],
    "country": ["country", "nation", "nationality"],
    "phone": ["phone number", "phone", "mobile", "tel", "telephone", "contact"],
    "email": ["email", "e-mail", "email address"],
    "id_number": ["id number", "id", "passport no", "passport number", "passport"],
}

_LABEL_TO_FIELD = {}
for fld, variants in _KEY_VARIANTS.items():
    for v in variants:
        _LABEL_TO_FIELD[v.lower()] = fld

# build alternation for regex; put longer phrases first to prefer "phone number" over "phone"
_all_variants_sorted = sorted(set(_LABEL_TO_FIELD.keys()), key=lambda s: -len(s))
_LABEL_PATTERN = r'\b(' + '|'.join(re.escape(v) for v in _all_variants_sorted) + r')\b\s*:?\s*'
_LABEL_RE = re.compile(_LABEL_PATTERN, flags=re.IGNORECASE | re.DOTALL)

def _extract_email(s: str) -> str:
    m = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', s)
    return m.group(0).strip() if m else None


def _extract_phone(s: str) -> str:
    # common phone pattern (loose)
    m = re.search(r'(\+?\d[\d\-\s().]{6,}\d)', s)
    return m.group(1).strip() if m else None


def _extract_age(s: str) -> str:
    m = re.search(r'\b(\d{1,3})\b', s)
    return m.group(1) if m else None


def _normalize_value_between_labels(val: str) -> str:
    # trim and remove stray separators
    return val.strip(" \t\n\r:;,-")


def _calculate_confidence_for_text(texts: List[str], scores: List[float], extracted_text: str) -> float:
    """
    Calculate confidence score for extracted text by finding matching text segments
    and averaging their confidence scores.
    """
    if not extracted_text or not texts or not scores:
        return 0.0
    
    # Find text segments that contribute to the extracted text
    matching_scores = []
    extracted_lower = extracted_text.lower().strip()
    
    for i, text_segment in enumerate(texts):
        if i < len(scores) and text_segment.lower().strip() in extracted_lower:
            matching_scores.append(scores[i])
    
    if matching_scores:
        return sum(matching_scores) / len(matching_scores)
    else:
        # If no exact matches, return average of all scores as fallback
        return sum(scores) / len(scores) if scores else 0.0

# ----------------------------
# OCR extraction
# ----------------------------
def extract_text(file_path: str, debug: bool = False) -> Dict:
    """
    Run PHOCR on an image or PDF and return structured extraction result.
    :param file_path: path to input image or PDF
    :param debug: print debug info
    :return: dict with texts, scores, boxes, language, elapsed_time
    """
    try:
        # If PDF, convert to image (your util handles it)
        if file_path.lower().endswith(".pdf"):
            from app.utils import convert_pdf_to_image
            image = convert_pdf_to_image(file_path)
        else:
            image = Image.open(file_path).convert("RGB")

        # Run PHOCR
        result = engine(image)

        output = {
            "texts": list(result.txts),
            "scores": list(result.scores),
            "boxes": result.boxes.tolist() if result.boxes is not None else [],
            "language": str(result.lang_type),
            "elapsed_time": result.elapse,
        }

        if debug:
            print(output)

        return output

    except Exception as e:
        return {"error": str(e)}




def map_fields(result: Dict) -> Dict:
    """
    Robust mapping of OCR result -> structured fields.
    Input: result dict with key "texts" (list of strings) and "scores" (list of floats) OR a plain string.
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
    
    # Initialize confidence scores
    confidence_scores = {
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

    # get a single normalized text blob and scores
    texts = []
    scores = []
    if isinstance(result, dict) and isinstance(result.get("texts"), list):
        texts = result["texts"]
        scores = result.get("scores", [])
        full_text = " ".join(texts)
    elif isinstance(result, str):
        full_text = result
        texts = [result]
        scores = [1.0]  # Default confidence for plain string input
    else:
        # nothing to map
        return {field: {"value": None, "confidence": None} for field in fields.keys()}

    # normalize whitespace
    full_text = re.sub(r'\s+', ' ', full_text).strip()

    # find all label matches (left to right)
    matches = []
    for m in _LABEL_RE.finditer(full_text):
        label_text = m.group(1).lower()
        field = _LABEL_TO_FIELD.get(label_text)
        if field:
            matches.append({
                "field": field,
                "label": label_text,
                "start": m.start(),
                "end": m.end()  # end includes optional colon/space (value starts here)
            })

    # if we found labeled keys, extract between-label values
    if matches:
        # sort by start (should already be left-to-right)
        matches = sorted(matches, key=lambda x: x["start"])
        for i, mm in enumerate(matches):
            start_val = mm["end"]
            end_val = matches[i + 1]["start"] if i + 1 < len(matches) else len(full_text)
            raw_val = full_text[start_val:end_val]
            val = _normalize_value_between_labels(raw_val)

            # post-process common fields
            fld = mm["field"]
            extracted_value = None
            if fld == "email":
                extracted_value = _extract_email(val) or val or None
            elif fld == "phone":
                extracted_value = _extract_phone(val) or val or None
            elif fld == "age":
                extracted_value = _extract_age(val) or val or None
            elif fld == "name":
                # remove trailing accidental label words (safety)
                val = re.sub(r'(?i)\b(age|gender|address|country|phone|email|id|dob|passport)\b.*$', '', val).strip()
                extracted_value = val or None
            else:
                extracted_value = val or None
            
            if extracted_value:
                fields[fld] = extracted_value
                confidence_scores[fld] = _calculate_confidence_for_text(texts, scores, extracted_value)

    # fallback regex scans for values missed above (useful if no explicit labels present)
    # EMAIL
    if not fields["email"]:
        email_val = _extract_email(full_text)
        if email_val:
            fields["email"] = email_val
            confidence_scores["email"] = _calculate_confidence_for_text(texts, scores, email_val)

    # PHONE
    if not fields["phone"]:
        phone_val = _extract_phone(full_text)
        if phone_val:
            fields["phone"] = phone_val
            confidence_scores["phone"] = _calculate_confidence_for_text(texts, scores, phone_val)

    # AGE (if still missing)
    if not fields["age"]:
        am = re.search(r'\bAge[:\s]*([0-9]{1,3})\b', full_text, re.IGNORECASE)
        if am:
            age_val = am.group(1)
            fields["age"] = age_val
            confidence_scores["age"] = _calculate_confidence_for_text(texts, scores, age_val)

    # ID_NUMBER: try common patterns
    if not fields["id_number"]:
        id_m = re.search(r'\b(ID(?:\s*Number)?|Passport(?:\s*No(?:\.)?)?)[:\s]*([A-Z0-9\-]{5,30})\b', full_text, re.I)
        if id_m:
            id_val = id_m.group(2).strip()
            fields["id_number"] = id_val
            confidence_scores["id_number"] = _calculate_confidence_for_text(texts, scores, id_val)

    # final cleanups: trim again and format output
    result = {}
    for k, v in list(fields.items()):
        if isinstance(v, str):
            v = v.strip(" \t\n\r,:;")
            fields[k] = v if v else None
        
        # Format each field with value and confidence
        result[k] = {
            "value": fields[k],
            "confidence": confidence_scores[k]
        }

    return result