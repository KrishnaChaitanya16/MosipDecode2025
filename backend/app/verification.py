from difflib import SequenceMatcher
from app.extraction import map_fields, extract_text

def similarity(a: str, b: str) -> float:
    """Return similarity score between two strings"""
    return SequenceMatcher(None, str(a).lower(), str(b).lower()).ratio()

def verify_fields(submitted_data: dict, file_path: str) -> dict:
    """
    Compare submitted form data with extracted fields from the scanned document.
    Returns field-by-field verification with confidence score.
    """
    # Run OCR and extract structured fields
    text = extract_text(file_path)
    extracted_fields = map_fields(text)

    result = {}
    for field, submitted_value in submitted_data.items():
        if not submitted_value:
            continue  # skip empty form values

        extracted_value = extracted_fields.get(field)
        if extracted_value:
            score = similarity(submitted_value, extracted_value)
            result[field] = {
                "submitted": submitted_value,
                "extracted": extracted_value,
                "status": "MATCH" if score > 0.8 else "MISMATCH",
                "confidence": round(score, 2),
            }
        else:
            result[field] = {
                "submitted": submitted_value,
                "extracted": None,
                "status": "NOT_FOUND",
                "confidence": 0.0,
            }

    return result
