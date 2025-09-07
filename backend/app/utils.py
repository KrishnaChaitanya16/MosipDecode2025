from pdf2image import convert_from_path
from PIL import Image

def convert_pdf_to_image(pdf_path: str) -> Image.Image:
    """Convert first page of PDF to image"""
    pages = convert_from_path(pdf_path, dpi=300)
    return pages[0]  # Use first page only for now
