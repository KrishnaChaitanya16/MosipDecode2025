from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
from app.utils import convert_pdf_to_image

# Load TrOCR model (printed text)
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")

def extract_text(file_path: str) -> str:
    """Run OCR on image/PDF and return extracted text"""
    if file_path.lower().endswith(".pdf"):
        image = convert_pdf_to_image(file_path)
    else:
        image = Image.open(file_path).convert("RGB")

    pixel_values = processor(images=image, return_tensors="pt").pixel_values
    generated_ids = model.generate(pixel_values)
    text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return text

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
