from difflib import SequenceMatcher
from app.extraction import map_fields, extract_text


def similarity(a: str, b: str) -> float:
    """
    Return similarity score between two strings (case-insensitive).
    Uses difflib.SequenceMatcher ratio.
    """
    return SequenceMatcher(None, str(a).lower(), str(b).lower()).ratio()


def verify_fields(submitted_data: dict, file_path: str) -> dict:
    """
    Compare submitted form data with extracted fields from the scanned document.
    Returns field-by-field verification with confidence score.

    Args:
        submitted_data (dict): Form data submitted by the user.
        file_path (str): Path to the scanned document/image.

    Returns:
        dict: Verification results per field with match status and confidence.
    """
    # Run OCR and extract structured fields
    text = extract_text(file_path)
    mapped_fields = map_fields(text)
    # Extract values from the new format (each field is now {"value": str, "confidence": float})
    extracted_fields = {}
    for k, v in mapped_fields.items():
        if isinstance(v, dict) and "value" in v and v["value"]:
            extracted_fields[k.lower()] = str(v["value"]).lower()

    result = {}
    for field, submitted_value in submitted_data.items():
        if not submitted_value:
            continue  # skip empty form values

        field_lower = str(field).lower()
        submitted_lower = str(submitted_value).lower()
        extracted_value = extracted_fields.get(field_lower)

        if extracted_value:
            score = similarity(submitted_lower, extracted_value)
            result[field_lower] = {
                "submitted": submitted_lower,
                "extracted": extracted_value,
                "status": "MATCH" if score > 0.8 else "MISMATCH",
                "confidence": round(score, 2),
            }
        else:
            result[field_lower] = {
                "submitted": submitted_lower,
                "extracted": None,
                "status": "NOT_FOUND",
                "confidence": 0.0,
            }

    return result
