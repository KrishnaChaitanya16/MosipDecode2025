import { useState } from 'react';

export const useFileUpload = (allowMultiple = false) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (files) => {
    if (allowMultiple) {
      if (Array.isArray(files)) {
        setUploadedFiles(prev => [...prev, ...files]);
      } else {
        // Single file event
        const fileList = Array.from(files.target?.files || [files]);
        setUploadedFiles(prev => [...prev, ...fileList]);
      }
    } else {
      // Single file mode - keep only the first file
      const file = Array.isArray(files) ? files[0] : (files.target?.files?.[0] || files);
      setUploadedFiles(file ? [file] : []);
    }
  };

  const setFileFromCamera = (file) => {
    if (allowMultiple) {
      setUploadedFiles(prev => [...prev, file]);
    } else {
      setUploadedFiles([file]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  // For backward compatibility
  const uploadedFile = uploadedFiles.length > 0 ? uploadedFiles[0] : null;

  return {
    uploadedFiles,
    uploadedFile, // For backward compatibility
    handleFileUpload,
    setFileFromCamera,
    removeFile,
    clearFiles
  };
};
