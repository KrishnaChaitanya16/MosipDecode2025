import json
import re
import requests
import os
import socket
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import nest_asyncio
from dotenv import set_key, load_dotenv

class QwenFieldMapper:
    def __init__(self, model_name="qwen2.5:1.5b"):
        """
        Uses an Ollama model that is already pulled locally.
        Example: ollama pull qwen2.5:1.5b
        """
        self.model_name = model_name
        self.api_url = "http://localhost:11434/api/generate"
        print(f"Using Ollama model (offline): {self.model_name}")

    def extract_fields(self, ocr_text: str, required_fields: list[str]) -> dict:
        """
        Extract the given required_fields from ocr_text and return only JSON 
        with those exact keys.
        """
        # Build JSON skeleton
        skeleton = "{\n"
        skeleton += ",\n".join([f'  "{field}": ""' for field in required_fields])
        skeleton += "\n}"

        prompt = f"""Extract information from the following text and return ONLY a JSON object
with these exact field names (no other text or keys).:

Text: {ocr_text}

Return only this JSON format:
{skeleton}
"""

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0,
                "repeat_penalty": 1.1,
                "top_p" : 1
            }
        }

        try:
            response = requests.post(self.api_url, json=payload, timeout=120)
            response.raise_for_status()
            generated = response.json().get("response", "")
        except Exception as e:
            print("Error communicating with Ollama:", e)
            return {field: "" for field in required_fields}

        return self._extract_strict_json(generated, required_fields)

    def _extract_strict_json(self, text: str, required_fields: list[str]) -> dict:
        """
        Extracts the first valid JSON object from text and ensures all required fields exist.
        """
        default_result = {field: "" for field in required_fields}

        try:
            clean_text = text.replace("```json", "").replace("```", "").strip()
            match = re.search(r'\{.*?\}', clean_text, re.DOTALL)
            if match:
                parsed_json = json.loads(match.group(0))
                # Guarantee all requested fields exist
                for key in default_result.keys():
                    if key not in parsed_json:
                        parsed_json[key] = ""
                return parsed_json
        except json.JSONDecodeError:
            pass
        return default_result
mapper = QwenFieldMapper("qwen2.5:1.5b")
print("Model initialized.")



# ----------------- FastAPI Setup -----------------
app = FastAPI(title="OCR Field Extractor API")

# ----------------- Request Body Model -----------------
class OCRRequest(BaseModel):
    text: str
    fields: list[str]

# ----------------- Initialize the Qwen Model -----------------
print("Loading model, this may take a few minutes...")
mapper = QwenFieldMapper()  # Ollama offline model
print("Model ready!")

# ----------------- API Endpoint -----------------
@app.post("/extract")
def extract_fields(request: OCRRequest):
    try:
        result = mapper.extract_fields(request.text, request.fields)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/health")
def health():
    return {"status": "ok"}

# Enable nested event loop (for Jupyter/Notebook usage)
nest_asyncio.apply()

# ----------------- Utility: find free port -----------------
def find_free_port() -> int:
    """Find an available TCP port on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))  # let OS assign a free port
        return s.getsockname()[1]

# ----------------- Run FastAPI -----------------
if __name__ == "__main__":
    # Find available port
    port = find_free_port()
    host = "127.0.0.1"
    url = f"http://{host}:{port}"

    # Load .env and update NOTEBOOK_URL
    dotenv_path = "../.env"  # adjust path if needed
    load_dotenv(dotenv_path)
    set_key(dotenv_path, "NOTEBOOK_URL", url)

    print(f"Server running at {url} (saved in .env as NOTEBOOK_URL)")
    set_key(dotenv_path, "ISRUNNING", "true")



    # Run without reloader (avoids duplicate process in notebooks)
    uvicorn.run(app, host=host, port=8001)

