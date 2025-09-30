/**
* Extracts OCR data from a single page of a document with detection data.
* @param {File} file - The file to process.
* @param {string} language - The language code for OCR processing (e.g., 'en', 'ch').
* @param {string[]} fields - Array of field names to extract (optional).
* @returns {Promise} - The JSON response from the API.
*/
const api_base2 = 'https://unmachineable-mauro-crucially.ngrok-free.dev'
export const api_base = 'http://127.0.0.1:8000';

export const extractOCRDataWithDetection = async (file, language = 'en', fields = null) => {
  console.log("Fields");
  console.log(fields);
  const formData = new FormData();
  formData.append('document', file);
  formData.append('include_detection', 'true');
  formData.append('language', language);

  // Add fields parameter if provided
  if (fields && fields.length > 0) {
    formData.append('fields', JSON.stringify(fields));
  }
  console.log("Form Data");
  console.log(formData);
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
* Verifies document data against submitted data.
* @param {File} file - The file to verify against.
* @param {object} submittedData - The data submitted by the user.
* @returns {Promise}
*/
export const verifyDocumentData = async (file, submittedData, fields = null) => {
  if (!file || !submittedData || Object.keys(submittedData).length === 0) {
    throw new Error('File and submission data are required for verification');
  }

  const formData = new FormData();
  formData.append('document', file);
  formData.append('verification_data', JSON.stringify(submittedData));

  // Add fields parameter if provided
  if (fields && fields.length > 0) {
    formData.append('fields', JSON.stringify(fields));
  }

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
* @returns {Promise}
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