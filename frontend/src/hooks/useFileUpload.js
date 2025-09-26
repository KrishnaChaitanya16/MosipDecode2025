import { useState } from 'react';

export const useFileUpload = (allowMultiple) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (files) => {
    console.log('🔧 useFileUpload: handleFileUpload called with:', files);
    console.log('🔧 allowMultiple:', allowMultiple);
    
    // Handle different input types
    let fileArray = [];
    
    if (files) {
      if (Array.isArray(files)) {
        // Already an array of File objects
        fileArray = files;
      } else if (files.target && files.target.files) {
        // Event object with FileList
        fileArray = Array.from(files.target.files);
      } else if (files instanceof File) {
        // Single File object
        fileArray = [files];
      } else if (files instanceof FileList) {
        // FileList object
        fileArray = Array.from(files);
      }
    }
    
    console.log('🔧 Processed fileArray:', fileArray);
    
    if (fileArray.length > 0) {
      if (allowMultiple) {
        // Add to existing files
        setUploadedFiles(prev => {
          const newFiles = [...prev, ...fileArray];
          console.log('🔧 Setting multiple files:', newFiles);
          return newFiles;
        });
      } else {
        // Replace with single file
        const singleFile = [fileArray[0]];
        console.log('🔧 Setting single file:', singleFile);
        setUploadedFiles(singleFile);
      }
    }
  };

  const setFileFromCamera = (file) => {
    console.log('📷 Camera file received:', file);
    if (allowMultiple) {
      setUploadedFiles(prev => [...prev, file]);
    } else {
      setUploadedFiles([file]);
    }
  };

  const removeFile = (index) => {
    console.log('🗑️ Removing file at index:', index);
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    console.log('🧹 Clearing all files');
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