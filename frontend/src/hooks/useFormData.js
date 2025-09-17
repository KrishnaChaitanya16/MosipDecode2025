import { useState } from 'react';

export const useFormData = () => {
  const [verificationData, setVerificationData] = useState({});

  const updateField = (fieldId, value) => {
    setVerificationData(prev => ({ ...prev, [fieldId]: value }));
  };

  const clearForm = () => {
    setVerificationData({});
  };

  const populateForm = (data) => {
    setVerificationData(data);
  };

  return {
    verificationData,
    updateField,
    clearForm,
    populateForm
  };
};
