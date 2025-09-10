from phocr import PHOCR

engine = PHOCR()

def extract_chinese_text(image_path: str) -> dict:
    """
    Extract Chinese text and metadata using PHOCR.
    :param image_path: path to input image
    :return: dict with extracted data
    """
    try:
        result = engine(image_path)

        # Convert tuples to lists (JSON serializable)
        return {
            "texts": list(result.txts),
            "scores": list(result.scores),
            "boxes": result.boxes.tolist() if result.boxes is not None else [],
            "language": str(result.lang_type),
            "elapsed_time": result.elapse
        }
    except Exception as e:
        return {"error": str(e)}
