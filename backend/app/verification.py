from difflib import SequenceMatcher
from app.extraction import map_fields, extract_text, extract_text_with_detection

def similarity(a: str, b: str) -> float:
    """
    Return similarity score between two strings (case-insensitive).
    Uses difflib.SequenceMatcher ratio.
    """
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, str(a).lower().strip(), str(b).lower().strip()).ratio()

def verify_fields(submitted_data: dict, file_path: str, custom_fields: list = None) -> dict:
    """
    FIXED VERSION - Compare submitted form data with extracted fields from the scanned document.
    Returns field-by-field verification with confidence score.

    Args:
        submitted_data (dict): Form data submitted by the user (format: {"Name": "ananya"}).
        file_path (str): Path to the scanned document/image.
        custom_fields (list): List of field names to verify (optional).

    Returns:
        dict: Verification results per field with match status and confidence.
    """
    print("Starting verification process...")
    print(f"Custom fields: {custom_fields}")
    print(f"Submitted data: {submitted_data}")

    try:
        # Run OCR and extract structured fields
        ocr_result = extract_text(file_path)

        # Use custom fields if provided for mapping
        if custom_fields:
            mapped_fields = map_fields(ocr_result, custom_fields=custom_fields)
        else:
            mapped_fields = map_fields(ocr_result)

        print(f"OCR mapped fields: {mapped_fields}")

        # CRITICAL FIX: Extract values correctly from the nested structure
        extracted_fields = {}
        for field_name, field_data in mapped_fields.items():
            if isinstance(field_data, dict) and 'value' in field_data:
                # Extract the actual value from the nested structure
                field_value = field_data.get('value')
                if field_value is not None and str(field_value).strip():
                    extracted_fields[field_name.lower()] = str(field_value).strip()
            elif field_data is not None and str(field_data).strip():
                # Handle direct value (fallback case)
                extracted_fields[field_name.lower()] = str(field_data).strip()

        print(f"Extracted fields for verification: {extracted_fields}")

        # Normalize submitted data keys to lowercase for comparison
        normalized_submitted = {k.lower(): v for k, v in submitted_data.items()}
        print(f"Normalized submitted data: {normalized_submitted}")

        verification_results = {}

        # Verify each submitted field
        for submitted_key, submitted_value in normalized_submitted.items():
            if not submitted_value or not str(submitted_value).strip():
                continue

            submitted_clean = str(submitted_value).strip()
            best_match = None
            best_similarity = 0.0

            # Find the best matching extracted field
            for extracted_key, extracted_value in extracted_fields.items():
                # Direct key match or similar key match
                key_similarity = similarity(submitted_key, extracted_key)
                if key_similarity > 0.6:  # Keys are similar enough
                    value_similarity = similarity(submitted_clean, extracted_value)
                    if value_similarity > best_similarity:
                        best_similarity = value_similarity
                        best_match = extracted_value

            # Also check for partial matches in all extracted values
            if best_similarity < 0.5:
                for extracted_value in extracted_fields.values():
                    value_similarity = similarity(submitted_clean, extracted_value)
                    if value_similarity > best_similarity:
                        best_similarity = value_similarity
                        best_match = extracted_value

            # Determine verification status
            if best_similarity >= 0.8:
                status = "match"
            elif best_similarity >= 0.5:
                status = "partial_match"
            else:
                status = "no_match"

            verification_results[submitted_key] = {
                "submitted_value": submitted_clean,
                "extracted_value": best_match or "Not found",
                "similarity_score": round(best_similarity, 3),
                "status": status,
                "confidence": round(best_similarity * 100, 1)
            }

        # Overall verification score
        if verification_results:
            avg_similarity = sum(r["similarity_score"] for r in verification_results.values()) / len(verification_results)
            overall_status = "verified" if avg_similarity >= 0.7 else "partial" if avg_similarity >= 0.4 else "failed"
        else:
            avg_similarity = 0.0
            overall_status = "no_data"

        final_result = {
            "overall_status": overall_status,
            "overall_confidence": round(avg_similarity * 100, 1),
            "field_results": verification_results,
            "total_fields_checked": len(verification_results),
            "extracted_text_available": len(extracted_fields) > 0
        }

        print(f"Final verification result: {final_result}")
        return final_result

    except Exception as e:
        print(f"Error in verification: {e}")
        return {
            "overall_status": "error",
            "overall_confidence": 0.0,
            "field_results": {},
            "error": str(e),
            "total_fields_checked": 0,
            "extracted_text_available": False
        }
