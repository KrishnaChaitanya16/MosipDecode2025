from difflib import SequenceMatcher
from app.extraction import map_fields, extract_text


def similarity(a: str, b: str) -> float:
    """
    Return similarity score between two strings (case-insensitive).
    Uses difflib.SequenceMatcher ratio.
    """
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, str(a).lower().strip(), str(b).lower().strip()).ratio()


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
    ocr_result = extract_text(file_path)
    mapped_fields = map_fields(ocr_result)
    
    # Extract values from the new format: {"field": {"value": str, "confidence": float}}
    extracted_fields = {}
    extraction_confidences = {}
    
    for field_name, field_data in mapped_fields.items():
        if isinstance(field_data, dict):
            value = field_data.get("value")
            confidence = field_data.get("confidence", 0.0)
            
            if value is not None and str(value).strip():
                extracted_fields[field_name.lower()] = str(value).strip()
                extraction_confidences[field_name.lower()] = confidence

    print(f"Extracted fields for verification: {extracted_fields}")
    print(f"Extraction confidences: {extraction_confidences}")

    result = {
        "verification_summary": {
            "total_fields": len(submitted_data),
            "matched_fields": 0,
            "mismatched_fields": 0,
            "not_found_fields": 0
        },
        "field_results": {},
        "ocr_debug": {
            "extracted_fields": extracted_fields,
            "extraction_confidences": extraction_confidences
        }
    }

    for field, submitted_value in submitted_data.items():
        # Skip empty or None submitted values
        if not submitted_value or str(submitted_value).strip() == "":
            continue

        field_lower = str(field).lower()
        submitted_clean = str(submitted_value).strip()
        extracted_value = extracted_fields.get(field_lower)
        extraction_confidence = extraction_confidences.get(field_lower, 0.0)

        if extracted_value:
            # Calculate similarity score
            similarity_score = similarity(submitted_clean, extracted_value)
            
            # Determine match status based on similarity threshold
            if similarity_score >= 0.9:
                status = "MATCH"
                result["verification_summary"]["matched_fields"] += 1
            elif similarity_score >= 0.7:
                status = "PARTIAL_MATCH"
                result["verification_summary"]["mismatched_fields"] += 1
            else:
                status = "MISMATCH"
                result["verification_summary"]["mismatched_fields"] += 1
            
            result["field_results"][field_lower] = {
                "submitted": submitted_clean,
                "extracted": extracted_value,
                "status": status,
                "similarity_score": round(similarity_score, 3),
                "extraction_confidence": round(extraction_confidence, 3) if extraction_confidence else None,
                "overall_confidence": round((similarity_score + (extraction_confidence or 0)) / 2, 3)
            }
        else:
            result["verification_summary"]["not_found_fields"] += 1
            result["field_results"][field_lower] = {
                "submitted": submitted_clean,
                "extracted": None,
                "status": "NOT_FOUND",
                "similarity_score": 0.0,
                "extraction_confidence": None,
                "overall_confidence": 0.0
            }

    # Calculate overall verification score
    total_processed = (result["verification_summary"]["matched_fields"] + 
                      result["verification_summary"]["mismatched_fields"] + 
                      result["verification_summary"]["not_found_fields"])
    
    if total_processed > 0:
        match_rate = result["verification_summary"]["matched_fields"] / total_processed
        result["verification_summary"]["overall_match_rate"] = round(match_rate, 3)
    else:
        result["verification_summary"]["overall_match_rate"] = 0.0

    return result


def quick_verify(submitted_data: dict, file_path: str) -> bool:
    """
    Quick verification that returns just True/False for overall document validity.
    
    Args:
        submitted_data (dict): Form data submitted by the user.
        file_path (str): Path to the scanned document/image.
        
    Returns:
        bool: True if document passes verification, False otherwise.
    """
    verification_result = verify_fields(submitted_data, file_path)
    
    # Consider document valid if:
    # 1. At least 70% of fields match
    # 2. No critical mismatches (similarity < 0.5)
    
    overall_match_rate = verification_result["verification_summary"]["overall_match_rate"]
    
    # Check for critical mismatches
    has_critical_mismatch = False
    for field_result in verification_result["field_results"].values():
        if (field_result["status"] == "MISMATCH" and 
            field_result["similarity_score"] < 0.5):
            has_critical_mismatch = True
            break
    
    return overall_match_rate >= 0.7 and not has_critical_mismatch