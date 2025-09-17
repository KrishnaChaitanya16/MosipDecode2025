import { useState } from 'react';

export const useFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const setFileFromCamera = (file) => {
    setUploadedFile(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
  };

  return {
    uploadedFile,
    handleFileUpload,
    setFileFromCamera,
    clearFile
  };
};
