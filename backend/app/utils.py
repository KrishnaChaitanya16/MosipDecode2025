import os
import io
from pdf2image import convert_from_path, convert_from_bytes
from PIL import Image
import tempfile
import logging

logger = logging.getLogger(__name__)


def convert_pdf_to_images(pdf_path, dpi=200, first_page=None, last_page=None):
    """
    Convert PDF to list of PIL Images
    
    Args:
        pdf_path: Path to PDF file
        dpi: Resolution for conversion (default 200 for good OCR quality)
        first_page: First page to convert (1-indexed)
        last_page: Last page to convert (1-indexed)
        
    Returns:
        List of PIL Images
    """
    try:
        logger.info(f"Converting PDF to images: {pdf_path}")
        
        # Convert PDF to images
        images = convert_from_path(
            pdf_path,
            dpi=dpi,
            first_page=first_page,
            last_page=last_page,
            fmt='RGB'
        )
        
        logger.info(f"Successfully converted {len(images)} pages from PDF")
        return images
        
    except Exception as e:
        logger.error(f"Error converting PDF to images: {e}")
        raise Exception(f"PDF conversion failed: {str(e)}")


def convert_pdf_to_image(pdf_path, page_number=1, dpi=200):
    """
    Convert specific page of PDF to single PIL Image
    
    Args:
        pdf_path: Path to PDF file
        page_number: Page number to convert (1-indexed)
        dpi: Resolution for conversion
        
    Returns:
        PIL Image
    """
    try:
        logger.info(f"Converting PDF page {page_number} to image: {pdf_path}")
        
        images = convert_from_path(
            pdf_path,
            dpi=dpi,
            first_page=page_number,
            last_page=page_number,
            fmt='RGB'
        )
        
        if not images:
            raise Exception(f"No image found for page {page_number}")
            
        logger.info(f"Successfully converted page {page_number} from PDF")
        return images[0]
        
    except Exception as e:
        logger.error(f"Error converting PDF page {page_number}: {e}")
        raise Exception(f"PDF page conversion failed: {str(e)}")


def convert_pdf_bytes_to_images(pdf_bytes, dpi=200, first_page=None, last_page=None):
    """
    Convert PDF from bytes to list of PIL Images
    
    Args:
        pdf_bytes: PDF file as bytes
        dpi: Resolution for conversion
        first_page: First page to convert (1-indexed)
        last_page: Last page to convert (1-indexed)
        
    Returns:
        List of PIL Images
    """
    try:
        logger.info("Converting PDF bytes to images")
        
        images = convert_from_bytes(
            pdf_bytes,
            dpi=dpi,
            first_page=first_page,
            last_page=last_page,
            fmt='RGB'
        )
        
        logger.info(f"Successfully converted {len(images)} pages from PDF bytes")
        return images
        
    except Exception as e:
        logger.error(f"Error converting PDF bytes to images: {e}")
        raise Exception(f"PDF bytes conversion failed: {str(e)}")


def get_pdf_page_count(pdf_path):
    """
    Get total number of pages in PDF
    
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        int: Number of pages
    """
    try:
        # Quick way to get page count without converting all pages
        from PyPDF2 import PdfReader
        
        with open(pdf_path, 'rb') as file:
            reader = PdfReader(file)
            return len(reader.pages)
            
    except ImportError:
        # Fallback: convert first page to get info
        try:
            images = convert_from_path(pdf_path, dpi=72, last_page=1)  # Low DPI for speed
            # This approach requires converting all pages to count, not efficient
            # Better to install PyPDF2 for page counting
            logger.warning("PyPDF2 not available, using pdf2image for page counting (slower)")
            all_images = convert_from_path(pdf_path, dpi=72)  # Low DPI for speed
            return len(all_images)
        except:
            return 1  # Fallback
            
    except Exception as e:
        logger.error(f"Error getting PDF page count: {e}")
        return 1  # Fallback to assuming 1 page


def is_pdf_file(file_path):
    """
    Check if file is a PDF
    
    Args:
        file_path: Path to file
        
    Returns:
        bool: True if PDF file
    """
    return file_path.lower().endswith('.pdf')


def save_image_temporarily(image, suffix='.jpg', quality=95):
    """
    Save PIL Image to temporary file
    
    Args:
        image: PIL Image
        suffix: File extension
        quality: JPEG quality (1-100)
        
    Returns:
        str: Path to temporary file
    """
    try:
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        temp_path = temp_file.name
        temp_file.close()
        
        # Save image
        if suffix.lower() in ['.jpg', '.jpeg']:
            image.save(temp_path, 'JPEG', quality=quality, optimize=True)
        else:
            image.save(temp_path)
            
        return temp_path
        
    except Exception as e:
        logger.error(f"Error saving image temporarily: {e}")
        raise Exception(f"Temporary image save failed: {str(e)}")
