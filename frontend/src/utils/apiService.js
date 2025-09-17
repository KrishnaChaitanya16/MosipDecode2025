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
  
  export const verifyDocumentData = async (file, submittedData) => {
    console.log('🚀 Starting verification API call...');
    console.log('📁 File:', file ? file.name : 'No file');
    console.log('📝 Submitted data:', submittedData);
  
    // Validate inputs
    if (!file) {
      throw new Error('No file provided for verification');
    }
    
    if (!submittedData || Object.keys(submittedData).length === 0) {
      throw new Error('No submitted data provided for verification');
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('submitted_data', JSON.stringify(submittedData));
  
    // Debug FormData contents
    console.log('📦 FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
  
    try {
      console.log('🌐 Making fetch request to verification endpoint...');
      
      const response = await fetch('http://127.0.0.1:8000/verify', {
        method: 'POST',
        // Don't set Content-Type header - let browser set it automatically for FormData
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
  