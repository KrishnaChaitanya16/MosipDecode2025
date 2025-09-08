import cv2
import numpy as np
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image, ImageDraw
from app.utils import convert_pdf_to_image

# Load TrOCR model (printed text)
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")

def detect_text_lines(pil_img: Image.Image, debug: bool = False):
    """Detect text line bounding boxes from an image using OpenCV"""
    # Convert PIL -> OpenCV
    img = np.array(pil_img.convert("RGB"))
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # Binarize image
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Dilate to merge text regions
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (img.shape[1] // 30, 5))
    dilated = cv2.dilate(thresh, kernel, iterations=1)

    # Find contours
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

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
        debug_img.show()  # pops up the image with red boxes
        # OR save instead of show: debug_img.save("debug_boxes.png")

    return boxes

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

def map_fields(text: str) -> dict:
    """Simple regex/pattern mapping for common fields"""
    fields = {"name": None, "dob": None, "id_number": None}
    lines = text.split("\n")

    for line in lines:
        if "Name" in line:
            fields["name"] = line.split(":")[-1].strip()
        if "DOB" in line or "Date of Birth" in line:
            fields["dob"] = line.split(":")[-1].strip()
        if "ID" in line:
            fields["id_number"] = line.split(":")[-1].strip()

    return fields
