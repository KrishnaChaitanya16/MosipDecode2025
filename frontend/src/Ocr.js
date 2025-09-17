import React, { useState } from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import { styles } from './constants/styles';
import { useFileUpload } from './hooks/useFileUpload';
import { useOCRExtraction } from './hooks/useOCRExtraction';
import { useFormData } from './hooks/useFormData';
import { useVerification } from './hooks/useVerification';
import ExtractionTab from './components/tabs/ExtractionTab';
import VerificationTab from './components/tabs/VerificationTab';

const OCRProjectUI = () => {
  const [activeTab, setActiveTab] = useState('extraction');
  const [selectedTemplate, setSelectedTemplate] = useState('english');

  const { 
    uploadedFile, 
    handleFileUpload, 
    setFileFromCamera 
  } = useFileUpload();

  const { 
    extractedData,
    confidenceData,
    isExtracting,
    extractError,
    errorDetails,
    handleExtract,
    clearExtraction,
    handleDismissError,
    setExtractedData
  } = useOCRExtraction(selectedTemplate);

  const { 
    verificationData,
    updateField: updateVerificationField,
    clearForm: clearVerificationForm,
    populateForm: populateVerificationForm
  } = useFormData();

  const {
    verificationResult,
    isVerifying,
    verificationError,
    handleVerification,
    clearVerificationResult
  } = useVerification();

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    clearExtraction();
  };

  const handleCameraCapture = (file) => {
    setFileFromCamera(file);
    clearExtraction();
  };

  const handleFileUploadWithClear = (event) => {
    handleFileUpload(event);
    clearExtraction();
    clearVerificationResult();
  };

  const handleRetryExtraction = (file) => {
    handleExtract(file);
  };

  const handleFieldChange = (fieldId, value) => {
    setExtractedData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleUseExtractedData = (data) => {
    if (Object.keys(data).length > 0) {
      populateVerificationForm(data);
    }
  };

  const handleStartVerification = (file, submittedData) => {
    handleVerification(file, submittedData);
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            OCR Text Extraction & Verification
          </h1>
          <p style={styles.subtitle}>
            Seamlessly extract text from scanned documents and verify data accuracy with advanced OCR technology
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={styles.tabContainer}>
          <div style={styles.tabWrapper}>
            <button
              onClick={() => setActiveTab('extraction')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'extraction' ? styles.activeTab : styles.inactiveTab)
              }}
            >
              <FileText size={20} />
              Text Extraction
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'verification' ? styles.activeTab : styles.inactiveTab)
              }}
            >
              <CheckCircle size={20} />
              Data Verification
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'extraction' && (
            <ExtractionTab
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUploadWithClear}
              onCameraCapture={handleCameraCapture}
              onExtract={handleExtract}
              isExtracting={isExtracting}
              extractError={extractError}
              errorDetails={errorDetails}
              onRetryExtraction={handleRetryExtraction}
              onDismissError={handleDismissError}
              extractedData={extractedData}
              confidenceData={confidenceData}
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
              onFieldChange={handleFieldChange}
            />
          )}
          {activeTab === 'verification' && (
            <VerificationTab
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUploadWithClear}
              onCameraCapture={handleCameraCapture}
              verificationData={verificationData}
              onVerificationFieldChange={updateVerificationField}
              onClearVerificationForm={clearVerificationForm}
              onUseExtractedData={handleUseExtractedData}
              extractedData={extractedData}
              selectedTemplate={selectedTemplate}
              // Verification specific props
              verificationResult={verificationResult}
              isVerifying={isVerifying}
              verificationError={verificationError}
              onStartVerification={handleStartVerification}
              onClearVerificationResult={clearVerificationResult}
            />
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p>Built with React.js • Supports PDF, JPG, PNG • Multi-language OCR</p>
        </div>
      </div>
    </div>
  );
};

export default OCRProjectUI;
