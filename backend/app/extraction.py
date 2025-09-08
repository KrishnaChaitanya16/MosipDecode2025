import os
import re
import cv2
import numpy as np
from PIL import Image, ImageDraw
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from app.utils import convert_pdf_to_image
import re

# ----------------------------
# Load TrOCR model (printed text)
# ----------------------------
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")


# ----------------------------
# Detect text line bounding boxes
# ----------------------------
def detect_text_lines(pil_img: Image.Image, debug: bool = False):
    """Detect text line bounding boxes from an image using OpenCV"""
    # Convert PIL -> OpenCV
    img = np.array(pil_img.convert("RGB"))
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # Binarize image
    _, thresh = cv2.threshold(
        gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    # Dilate to merge text regions
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (img.shape[1] // 30, 5))
    dilated = cv2.dilate(thresh, kernel, iterations=1)

    # Find contours
    contours, _ = cv2.findContours(
        dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    boxes = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if h > 15 and w > 30:  # filter out noise
            boxes.append((x, y, x + w, y + h))

    # Sort boxes top-to-bottom
    boxes = sorted(boxes, key=lambda b: b[1])

    if debug:
        debug_img = pil_img.copy()
        draw = ImageDraw.Draw(debug_img)
        for (x1, y1, x2, y2) in boxes:
            draw.rectangle([x1, y1, x2, y2], outline="red", width=2)
        debug_img.show()  # OR save: debug_img.save("debug_boxes.png")

    return boxes


# ----------------------------
# OCR extraction
# ----------------------------
def extract_text(file_path: str, debug: bool = False) -> str:
    """Run OCR on automatically detected text lines and return full extracted text"""
    if file_path.lower().endswith(".pdf"):
        image = convert_pdf_to_image(file_path)
    else:
        image = Image.open(file_path).convert("RGB")

    boxes = detect_text_lines(image, debug=debug)

    lines = []
    for (x1, y1, x2, y2) in boxes:
        cropped = image.crop((x1, y1, x2, y2))
        pixel_values = processor(images=cropped, return_tensors="pt").pixel_values
        generated_ids = model.generate(pixel_values)
        text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        lines.append(text)

    return "\n".join(lines)


# ----------------------------
# Field mapping
# ----------------------------
# ----------------------------
# Field mapping
# ----------------------------
def map_fields(text: str) -> dict:
    """Extract structured fields from OCR text"""
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

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    i = 0
    while i < len(lines):
        line = lines[i]

        # NAME
        if re.search(r"\bNAME\b", line, re.I):
            if i + 1 < len(lines):
                fields["name"] = lines[i + 1].strip()
                i += 1

        # AGE
        elif re.search(r"\bAGE\b", line, re.I):
            if i + 1 < len(lines) and lines[i + 1].isdigit():
                fields["age"] = lines[i + 1].strip()
                i += 1

        # GENDER
        elif re.search(r"\bGENDER\b", line, re.I):
            if i + 1 < len(lines):
                fields["gender"] = lines[i + 1].strip()
                i += 1

        # DOB
        elif re.search(r"(DOB|Date of Birth)", line, re.I):
            if i + 1 < len(lines):
                fields["dob"] = lines[i + 1].strip()
                i += 1

        # ADDRESS (multi-line until next keyword)
        elif re.search(r"\bADDRESS\b", line, re.I):
            addr_lines = []
            j = i + 1
            while j < len(lines) and not re.search(
                r"(COUNTRY|PHONE|EMAIL|ID)", lines[j], re.I
            ):
                addr_lines.append(lines[j])
                j += 1
            fields["address"] = " ".join(addr_lines).strip()
            i = j - 1

        # COUNTRY
        elif re.search(r"\bCOUNTRY\b", line, re.I):
            if i + 1 < len(lines):
                fields["country"] = lines[i + 1].strip()
                i += 1

        i += 1

    # ----------------------------
    # Additional fields via regex
    # ----------------------------
    # EMAIL
    email_match = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text, re.I)
    if email_match:
        fields["email"] = email_match.group(0).strip()

    # PHONE
    phone_match = re.search(r"\+?\d[\d\s().-]{7,}\d", text)
    if phone_match:
        fields["phone"] = phone_match.group(0).strip()

    # ID Number (alphanumeric, 5-20 chars)
    id_match = re.search(r"\bID[:\s]*([A-Z0-9-]{5,20})\b", text, re.I)
    if id_match:
        fields["id_number"] = id_match.group(1).strip()

    return fields
