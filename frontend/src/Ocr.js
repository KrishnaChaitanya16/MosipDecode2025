import React, { useState } from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import { styles } from './constants/styles';
import { useFileUpload } from './hooks/useFileUpload';
import { useOCRExtraction } from './hooks/useOCRExtraction';
import { useMultipageOCR } from './hooks/useMultipageOCR';
import { useBatchOCR } from './hooks/useBatchOCR';
import { useFormData } from './hooks/useFormData';
import { useVerification } from './hooks/useVerification';
import ExtractionTab from './components/tabs/ExtractionTab';
import VerificationTab from './components/tabs/VerificationTab';

const OCRProjectUI = () => {
  const [activeTab, setActiveTab] = useState('extraction');
  const [selectedTemplate, setSelectedTemplate] = useState('english');

  const { 
    uploadedFiles,
    uploadedFile, // For backward compatibility
    handleFileUpload, 
    setFileFromCamera,
    removeFile,
    clearFiles
  } = useFileUpload(true); // Enable multiple files

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
    multipageData,
    currentPage,
    totalPages,
    pageConfidenceData,
    isExtractingMultipage,
    multipageError,
    multipageErrorDetails,
    handleMultipageExtract,
    clearMultipageExtraction,
    handleDismissMultipageError,
    goToPage,
    nextPage,
    prevPage,
    updatePageField
  } = useMultipageOCR(selectedTemplate);

  const {
    batchResults,
    batchProgress,
    isBatchProcessing,
    batchErrors,
    currentlyProcessing,
    processBatch,
    clearBatchResults
  } = useBatchOCR(selectedTemplate);

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
    clearMultipageExtraction();
    clearBatchResults();
  };

  const handleCameraCapture = (file) => {
    setFileFromCamera(file);
    clearExtraction();
    clearMultipageExtraction();
    clearBatchResults();
    clearVerificationResult();
  };

  const handleFileUploadWithClear = (files) => {
    handleFileUpload(files);
    clearExtraction();
    clearMultipageExtraction();
    clearBatchResults();
    clearVerificationResult();
  };

  const handleExtractWithClear = (file) => {
    clearVerificationResult();
    clearMultipageExtraction();
    clearBatchResults();
    handleExtract(file);
  };

  const handleMultipageExtractWithClear = (file) => {
    clearVerificationResult();
    clearExtraction();
    clearBatchResults();
    handleMultipageExtract(file);
  };

  const handleBatchProcessWithClear = (files, isMultipage) => {
    clearVerificationResult();
    clearExtraction();
    clearMultipageExtraction();
    processBatch(files, isMultipage);
  };

  const handleRetryExtraction = (file) => {
    clearVerificationResult();
    handleExtract(file);
  };

  const handleRetryMultipageExtraction = (file) => {
    clearVerificationResult();
    handleMultipageExtract(file);
  };

  const handleFieldChange = (fieldId, value) => {
    setExtractedData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleUpdateBatchField = (fileKey, pageNumOrFieldId, fieldIdOrValue, value) => {
    // Handle both single page and multipage batch updates
    // This is a placeholder - implement based on your batch results structure
    console.log('Update batch field:', { fileKey, pageNumOrFieldId, fieldIdOrValue, value });
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
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUploadWithClear}
              onCameraCapture={handleCameraCapture}
              onRemoveFile={removeFile}
              onExtract={handleExtractWithClear}
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
              // Multipage props
              multipageData={multipageData}
              currentPage={currentPage}
              totalPages={totalPages}
              pageConfidenceData={pageConfidenceData}
              isExtractingMultipage={isExtractingMultipage}
              multipageError={multipageError}
              multipageErrorDetails={multipageErrorDetails}
              onMultipageExtract={handleMultipageExtractWithClear}
              onRetryMultipage={handleRetryMultipageExtraction}
              onDismissMultipageError={handleDismissMultipageError}
              onGoToPage={goToPage}
              onNextPage={nextPage}
              onPrevPage={prevPage}
              onUpdatePageField={updatePageField}
              // Batch processing props
              batchResults={batchResults}
              batchProgress={batchProgress}
              isBatchProcessing={isBatchProcessing}
              batchErrors={batchErrors}
              currentlyProcessing={currentlyProcessing}
              onBatchProcess={handleBatchProcessWithClear}
              onClearBatchResults={clearBatchResults}
              onUpdateBatchField={handleUpdateBatchField}
            />
          )}
          {activeTab === 'verification' && (
            <VerificationTab
              uploadedFile={uploadedFile} // Use single file for verification
              onFileUpload={(event) => handleFileUploadWithClear([event.target.files[0]])}
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
          <p>Built with React.js • Supports PDF, JPG, PNG • Multi-language OCR • Multipage & Batch Support</p>
        </div>
      </div>
    </div>
  );
};

export default OCRProjectUI;
