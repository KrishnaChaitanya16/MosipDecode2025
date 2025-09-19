export const extractOCRData = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch('http://127.0.0.1:8000/extract', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};

export const extractOCRDataWithDetection = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('include_detection', 'true');

  const response = await fetch('http://127.0.0.1:8000/extract', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Request with detection failed: ${response.status}`);
  }

  return response.json();
};

export const extractMultipageOCRData = async (file) => {
  console.log('📄 Starting multipage extraction for:', file ? file.name : 'No file');
  
  const formData = new FormData();
  formData.append('document', file);
  formData.append('multipage', 'true'); // Flag to enable multipage processing

  const response = await fetch('http://127.0.0.1:8000/extract/multipage', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Multipage extraction failed: ${response.status}`);
  }

  return response.json();
};

export const detectTextRegions = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch('http://127.0.0.1:8000/detect', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Detection failed: ${response.status}`);
  }

  return response.json();
};

export const verifyDocumentData = async (file, submittedData) => {
  console.log('🚀 Starting verification API call...');
  console.log('📁 File:', file ? file.name : 'No file');
  console.log('📝 Submitted data:', submittedData);

  if (!file) {
    throw new Error('No file provided for verification');
  }
  
  if (!submittedData || Object.keys(submittedData).length === 0) {
    throw new Error('No submitted data provided for verification');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('submitted_data', JSON.stringify(submittedData));

  console.log('📦 FormData entries:');
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value);
  }

  try {
    console.log('🌐 Making fetch request to verification endpoint...');
    
    const response = await fetch('http://127.0.0.1:8000/verify', {
      method: 'POST',
      body: formData
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server error response:', errorText);
      throw new Error(`Verification request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Verification response:', result);
    return result;

  } catch (error) {
    console.error('❌ Verification API error:', error);
    throw error;
  }
};

export const verifyMultipageDocumentData = async (file, submittedData, pageNumber = 1) => {
  console.log('🚀 Starting multipage verification API call...');
  console.log('📁 File:', file ? file.name : 'No file');
  console.log('📝 Submitted data:', submittedData);
  console.log('📄 Page number:', pageNumber);

  if (!file) {
    throw new Error('No file provided for verification');
  }
  
  if (!submittedData || Object.keys(submittedData).length === 0) {
    throw new Error('No submitted data provided for verification');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('submitted_data', JSON.stringify(submittedData));
  formData.append('page_number', pageNumber.toString());

  try {
    console.log('🌐 Making fetch request to multipage verification endpoint...');
    
    const response = await fetch('http://127.0.0.1:8000/verify/multipage', {
      method: 'POST',
      body: formData
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server error response:', errorText);
      throw new Error(`Multipage verification request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Multipage verification response:', result);
    return result;

  } catch (error) {
    console.error('❌ Multipage verification API error:', error);
    throw error;
  }
};

// Health check endpoint
export const checkAPIHealth = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/health', {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error;
  }
};
