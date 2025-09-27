import { useState } from 'react';
import { verifyDocumentData } from '../utils/apiService';

export const useVerification = () => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const handleVerification = async (file, submittedData, fields) => {
    console.log('🔍 handleVerification called with:', { 
      file: file ? file.name : 'no file', 
      dataKeys: Object.keys(submittedData || {}) 
    });

    // Validate inputs
    if (!file) {
      const error = 'Please upload a file for verification.';
      console.error('❌ Validation error:', error);
      setVerificationError(error);
      return;
    }

    if (!submittedData || Object.keys(submittedData).length === 0) {
      const error = 'Please provide submitted data for verification.';
      console.error('❌ Validation error:', error);
      setVerificationError(error);
      return;
    }

    setIsVerifying(true);
    setVerificationError('');
    setVerificationResult(null);

    try {
      console.log('📞 Calling verifyDocumentData API...');
      const result = await verifyDocumentData(file, submittedData, fields);
      
      console.log('✅ Verification successful:', result);
      setVerificationResult(result.verification_result);
      
    } catch (err) {
      const errorMessage = err.message || 'Verification failed. Please try again.';
      console.error('❌ Verification failed:', err);
      setVerificationError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const clearVerificationResult = () => {
    console.log('🧹 Clearing verification results');
    setVerificationResult(null);
    setVerificationError('');
  };

  return {
    verificationResult,
    isVerifying,
    verificationError,
    handleVerification,
    clearVerificationResult
  };
};
