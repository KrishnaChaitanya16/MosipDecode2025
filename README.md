# MOSIPDecode2025 – OCR Extraction & Verification (Local Only)

This repository includes a FastAPI backend (already provided) and a clean static frontend that demonstrates OCR text extraction and data verification using Microsoft TrOCR. No cloud services are used.

Do not modify the backend. The frontend consumes the existing APIs as-is.

## Backend (FastAPI)

Endpoints:
- POST /extract
  - multipart/form-data: document (image or PDF)
  - returns: { raw_text: string, mapped_fields: { name, dob, id_number } }
- POST /verify
  - multipart/form-data: document, name?, dob?, id_number?
  - returns: { verification: { [field]: { submitted, extracted, status, confidence } } }

Run backend:
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Notes:
- TrOCR model weights download on first run.
- PDFs are converted to images internally.

## Frontend (Static)

Located in `frontend/`. Single-page app that:
- Uploads a document and calls /extract
- Displays raw OCR text and mapped fields (name, dob, id_number)
- Allows manual corrections
- Calls /verify with the same document and user-edited values
- Shows per-field status and confidence

Open frontend:
- Open `frontend/index.html` directly in a browser (defaults to http://localhost:8000)
- Or pass API base via query: `frontend/index.html?api=http://127.0.0.1:8000`
- Or serve statically:
```bash
cd frontend
python -m http.server 5500
# visit http://localhost:5500/
```

## Deliverables Mapping
- Source code: backend + frontend
- Demo: open frontend and use provided documents
- Docs: this README describes setup, API contract, and usage

## License
Open source. See repository terms.
