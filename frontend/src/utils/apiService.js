/**
 * Extracts OCR data from a single page of a document with detection data.
 * @param {File} file - The file to process.
 * @param {string} language - The language code for OCR processing (e.g., 'en', 'ch').
 * @returns {Promise<any>} - The JSON response from the API.
 */
const api_base2 = 'https://unmachineable-mauro-crucially.ngrok-free.dev'
const api_base = 'http://127.0.0.1:8000';
export const extractOCRDataWithDetection = async (file, language = 'en') => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('include_detection', 'true');
  formData.append('language', language);

  const response = await fetch(`${api_base}/extract`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request with detection failed' }));
    throw new Error(errorData.error || `Request with detection failed: ${response.status}`);
  }

  return response.json();
};

/**
 * Extracts OCR data from all pages of a PDF document.
 * @param {File} file - The PDF file to process.
 * @param {string} language - The language code for OCR processing.
 * @returns {Promise<any>} - The JSON response from the API.
 */
export const extractMultipagePdfData = async (file, language = 'en') => {
  console.log(`📄 Starting multipage PDF extraction for: ${file.name} with language: ${language}`);
  
  const formData = new FormData();
  formData.append('document', file);
  formData.append('language', language);

  const response = await fetch(`${api_base}/extract/pdf/all`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Multipage extraction failed' }));
    throw new Error(errorData.error || `Multipage extraction failed: ${response.status}`);
  }

  return response.json();
};


/**
 * Verifies document data against submitted data.
 * @param {File} file - The file to verify against.
 * @param {object} submittedData - The data submitted by the user.
 * @returns {Promise<any>}
 */
export const verifyDocumentData = async (file, submittedData) => {
  if (!file || !submittedData || Object.keys(submittedData).length === 0) {
    throw new Error('File and submission data are required for verification');
  }

  const formData = new FormData();
  formData.append('document', file);
  formData.append('verification_data', JSON.stringify(submittedData));

  const response = await fetch(`${api_base}/verify`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Verification request failed: ${response.status} - ${errorText}`);
  }

  return response.json();
};


/**
 * Checks the health of the API.
 * @returns {Promise<any>}
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${api_base}/health`);
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error;
  }
};
