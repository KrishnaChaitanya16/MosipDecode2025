import React, { useState } from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import { styles } from './constants/styles';
import { useFileUpload } from './hooks/useFileUpload';
import { useOCRDetection } from './hooks/useOCRDetection';
import { useMultipagePdf } from './hooks/useMultipagePdf';
import { useFormData } from './hooks/useFormData';
import { useVerification } from './hooks/useVerification';
import ExtractionTab from './components/tabs/ExtractionTab';
import VerificationTab from './components/tabs/VerificationTab';

const OCRProjectUI = () => {
  const [activeTab, setActiveTab] = useState('extraction');
  const [selectedTemplate, setSelectedTemplate] = useState('en');

  // File upload hook
  const { uploadedFiles, handleFileUpload, removeFile, clearFiles } = useFileUpload(false);

  // Single page extraction hook
  const {
    extractedData, confidenceData, overlayImage, isExtracting, error,
    errorDetails, extractWithDetection, clearExtraction, handleDismissError
  } = useOCRDetection();
  
  // Multipage PDF hook
  const {
    multipageResults, isProcessing: isProcessingMultipage, error: multipageError,
    errorDetails: multipageErrorDetails, processMultipagePdf, clearResults: clearMultipage,
    handleDismissError: handleDismissMultipageError
  } = useMultipagePdf();

  // Form data for verification tab
  const { verificationData, updateField, populateForm, clearForm } = useFormData();
  const { verificationResult, isVerifying, verificationError, handleVerification, clearVerificationResult } = useVerification();
  
  const clearAllExtractions = () => {
    clearExtraction();
    clearMultipage();
    clearVerificationResult();
  };

  const handleFileChange = (files) => {
    handleFileUpload(files);
    clearAllExtractions();
  };
  
  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    clearAllExtractions();
  };
  
  const handleFieldChange = (fieldId, value) => {
    // This function is a placeholder for potential future state updates.
    // Currently, the form fields are part of the 'singlePageData' object.
    console.log(`Field ${fieldId} changed to: ${value}`);
  };

  const singlePageData = extractedData ? {
      extractedData,
      confidenceData,
      overlayImage,
  } : null;

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <div style={styles.header}>
          <h1 style={styles.title}>Multilingual OCR Extraction</h1>
          <p style={styles.subtitle}>
            Select a document language, upload a file, and extract structured data with confidence zones.
          </p>
        </div>

        <div style={styles.tabContainer}>
          <div style={styles.tabWrapper}>
            <button
              onClick={() => setActiveTab('extraction')}
              style={{...styles.tabButton, ...(activeTab === 'extraction' ? styles.activeTab : styles.inactiveTab)}}
            >
              <FileText size={20} /> Text Extraction
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              style={{...styles.tabButton, ...(activeTab === 'verification' ? styles.activeTab : styles.inactiveTab)}}
            >
              <CheckCircle size={20} /> Data Verification
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'extraction' && (
            <ExtractionTab
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileChange}
              onRemoveFile={removeFile}
              onCameraCapture={handleFileChange}
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
              onExtractSinglePage={extractWithDetection}
              singlePageData={singlePageData}
              isExtractingSingle={isExtracting}
              singlePageError={error}
              singlePageErrorDetails={errorDetails}
              onDismissSinglePageError={handleDismissError}
              onExtractMultipage={processMultipagePdf}
              multipageData={multipageResults}
              isExtractingMultipage={isProcessingMultipage}
              multipageError={multipageError}
              multipageErrorDetails={multipageErrorDetails}
              onDismissMultipageError={handleDismissMultipageError}
              onFieldChange={handleFieldChange}
            />
          )}
          {activeTab === 'verification' && (
             <VerificationTab
              uploadedFile={uploadedFiles[0]}
              onFileUpload={(files) => handleFileChange(files)}
              verificationData={verificationData}
              onVerificationFieldChange={updateField}
              onClearVerificationForm={clearForm}
              onUseExtractedData={populateForm}
              extractedData={extractedData}
              selectedTemplate={selectedTemplate}
              verificationResult={verificationResult}
              isVerifying={isVerifying}
              verificationError={verificationError}
              onStartVerification={handleVerification}
              onClearVerificationResult={clearVerificationResult}
            />
          )}
        </div>
        
        <div style={styles.footer}>
          <p>Built with React.js • Multi-language OCR • PDF Support • Confidence Zones</p>
        </div>
      </div>
    </div>
  );
};

export default OCRProjectUI;
