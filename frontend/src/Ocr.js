import React, { useState } from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import { styles } from './constants/styles';
import { useFileUpload } from './hooks/useFileUpload';
import { useOCRExtraction } from './hooks/useOCRExtraction';
import { useMultipageOCR } from './hooks/useMultipageOCR';
import { useBatchOCR } from './hooks/useBatchOCR';
import { useOCRDetection } from './hooks/useOCRDetection';
import { useFormData } from './hooks/useFormData';
import { useVerification } from './hooks/useVerification';
import ExtractionTab from './components/tabs/ExtractionTab';
import VerificationTab from './components/tabs/VerificationTab';
// import './animations.css'; // Uncomment if you have this CSS file

const OCRProjectUI = () => {
  const [activeTab, setActiveTab] = useState('extraction');
  const [selectedTemplate, setSelectedTemplate] = useState('english');

  // File upload hook with multiple file support
  const { 
    uploadedFiles,
    uploadedFile, // For backward compatibility with single file operations
    handleFileUpload, 
    setFileFromCamera,
    removeFile,
    clearFiles
  } = useFileUpload(true); // Enable multiple files

  // Single page OCR extraction hook
  const { 
    extractedData,
    confidenceData,
    isExtracting,
    extractError,
    errorDetails,
    handleExtract,
    clearExtraction,
    handleDismissError,
    setExtractedData,
    setConfidenceData
  } = useOCRExtraction(selectedTemplate);

  // Multipage OCR extraction hook
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

  // Batch processing hook
  const {
    batchResults,
    batchProgress,
    isBatchProcessing,
    batchErrors,
    currentlyProcessing,
    processBatch,
    clearBatchResults
  } = useBatchOCR(selectedTemplate);

  // OCR detection and confidence zones hook
  const {
    detectionData,
    overlayImage,
    isDetecting,
    detectionError,
    detectTextRegions,
    extractWithDetection,
    clearDetection
  } = useOCRDetection();

  // Form data management hook
  const { 
    verificationData,
    updateField: updateVerificationField,
    clearForm: clearVerificationForm,
    populateForm: populateVerificationForm
  } = useFormData();

  // Verification hook
  const {
    verificationResult,
    isVerifying,
    verificationError,
    handleVerification,
    clearVerificationResult
  } = useVerification();

  // Template change handler
  const handleTemplateChange = (template) => {
    console.log('🔄 Changing template to:', template);
    setSelectedTemplate(template);
    clearExtraction();
    clearMultipageExtraction();
    clearBatchResults();
    clearDetection();
  };

  // Camera capture handler
  const handleCameraCapture = (file) => {
    console.log('📷 Camera capture:', file?.name);
    setFileFromCamera(file);
    clearExtraction();
    clearMultipageExtraction();
    clearBatchResults();
    clearDetection();
    clearVerificationResult();
  };

  // File upload handler with clearing
  const handleFileUploadWithClear = (files) => {
    console.log('📁 File upload:', files?.length || 0, 'files');
    handleFileUpload(files);
    clearExtraction();
    clearMultipageExtraction();
    clearBatchResults();
    clearDetection();
    clearVerificationResult();
  };

  // Single page extraction with clearing
  const handleExtractWithClear = (file) => {
    console.log('🔍 Starting single page extraction for:', file?.name);
    clearVerificationResult();
    clearMultipageExtraction();
    clearBatchResults();
    clearDetection();
    handleExtract(file);
  };

  // Multipage extraction with clearing
  const handleMultipageExtractWithClear = (file) => {
    console.log('📄 Starting multipage extraction for:', file?.name);
    clearVerificationResult();
    clearExtraction();
    clearBatchResults();
    clearDetection();
    handleMultipageExtract(file);
  };

  // Batch processing with clearing
  const handleBatchProcessWithClear = (files, isMultipage) => {
    console.log('🔄 Starting batch processing for:', files?.length, 'files, multipage:', isMultipage);
    clearVerificationResult();
    clearExtraction();
    clearMultipageExtraction();
    clearDetection();
    processBatch(files, isMultipage);
  };

  // Detection regions handler
  const handleDetectRegions = (file) => {
    console.log('🎯 Starting detection for:', file?.name);
    clearVerificationResult();
    clearExtraction();
    clearMultipageExtraction();
    clearBatchResults();
    detectTextRegions(file);
  };

  // Extract with detection handler
  const handleExtractWithDetection = async (file) => {
    console.log('🎯 Starting extract with detection for:', file?.name);
    clearVerificationResult();
    clearMultipageExtraction();
    clearBatchResults();
    
    try {
      const result = await extractWithDetection(file);
      console.log('✅ Extract with detection result:', result);
      
      if (result && result.mapped_fields) {
        const mapped = result.mapped_fields;
        const unwrapped = {};
        const confidence = {};
        
        Object.keys(mapped).forEach((key) => {
          unwrapped[key] = mapped[key]?.value || null;
          confidence[key] = mapped[key]?.confidence || null;
        });
        
        // Apply template transformation if needed
        if (selectedTemplate === 'chinese') {
          // Import dynamically to avoid circular dependency
          const { englishToChineseKey } = await import('./constants/fields');
          const transformed = {};
          const transformedConfidence = {};
          
          Object.keys(unwrapped).forEach((key) => {
            const chineseKey = englishToChineseKey[key];
            if (chineseKey) {
              transformed[chineseKey] = unwrapped[key];
              transformedConfidence[chineseKey] = confidence[key];
            } else {
              transformed[key] = unwrapped[key];
              transformedConfidence[key] = confidence[key];
            }
          });
          
          setExtractedData(transformed);
          setConfidenceData(transformedConfidence);
        } else {
          setExtractedData(unwrapped);
          setConfidenceData(confidence);
        }
        
        console.log('✅ Updated extracted data with detection');
      }
    } catch (error) {
      console.error('❌ Extract with detection failed:', error);
    }
  };

  // Retry extraction handler
  const handleRetryExtraction = (file) => {
    console.log('🔄 Retrying extraction for:', file?.name);
    clearVerificationResult();
    handleExtract(file);
  };

  // Retry multipage extraction handler
  const handleRetryMultipageExtraction = (file) => {
    console.log('🔄 Retrying multipage extraction for:', file?.name);
    clearVerificationResult();
    handleMultipageExtract(file);
  };

  // Field change handler
  const handleFieldChange = (fieldId, value) => {
    console.log('✏️ Field changed:', fieldId, '=', value);
    setExtractedData(prev => ({ ...prev, [fieldId]: value }));
  };

  // Batch field update handler
  const handleUpdateBatchField = (fileKey, pageNumOrFieldId, fieldIdOrValue, value) => {
    console.log('🔄 Update batch field:', { fileKey, pageNumOrFieldId, fieldIdOrValue, value });
    // This is a placeholder - implement based on your batch results structure
    // You might want to update the batchResults state here
  };

  // Use extracted data for verification
  const handleUseExtractedData = (data) => {
    console.log('📝 Using extracted data for verification:', Object.keys(data || {}).length, 'fields');
    if (data && Object.keys(data).length > 0) {
      populateVerificationForm(data);
    }
  };

  // Start verification handler
  const handleStartVerification = (file, submittedData) => {
    console.log('✅ Starting verification for:', file?.name, 'with', Object.keys(submittedData || {}).length, 'fields');
    handleVerification(file, submittedData);
  };

  // Clear batch results handler
  const handleClearBatchResults = () => {
    console.log('🧹 Clearing batch results');
    clearBatchResults();
  };

  // Clear detection handler
  const handleClearDetection = () => {
    console.log('🧹 Clearing detection results');
    clearDetection();
  };

  // Get current processing status for debugging
  const getCurrentStatus = () => {
    return {
      hasFiles: uploadedFiles.length > 0,
      isExtracting,
      isExtractingMultipage,
      isBatchProcessing,
      isDetecting,
      isVerifying,
      hasExtractedData: Object.keys(extractedData).length > 0,
      hasMultipageData: Object.keys(multipageData).length > 0,
      hasBatchResults: Object.keys(batchResults).length > 0,
      hasDetectionData: (detectionData && detectionData.length > 0) || !!overlayImage,
      hasVerificationResult: !!verificationResult
    };
  };

  // Debug current status
  console.log('🔍 Current OCR App Status:', getCurrentStatus());

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
              onClick={() => {
                console.log('📑 Switching to extraction tab');
                setActiveTab('extraction');
              }}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'extraction' ? styles.activeTab : styles.inactiveTab)
              }}
            >
              <FileText size={20} />
              Text Extraction
            </button>
            <button
              onClick={() => {
                console.log('✅ Switching to verification tab');
                setActiveTab('verification');
              }}
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
              // File management props
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUploadWithClear}
              onCameraCapture={handleCameraCapture}
              onRemoveFile={removeFile}
              
              // Single page extraction props
              onExtract={handleExtractWithClear}
              isExtracting={isExtracting}
              extractError={extractError}
              errorDetails={errorDetails}
              onRetryExtraction={handleRetryExtraction}
              onDismissError={handleDismissError}
              extractedData={extractedData}
              confidenceData={confidenceData}
              
              // Template and field props
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
              onClearBatchResults={handleClearBatchResults}
              onUpdateBatchField={handleUpdateBatchField}
              
              // Detection and confidence zones props
              detectionData={detectionData}
              overlayImage={overlayImage}
              isDetecting={isDetecting}
              detectionError={detectionError}
              onDetectRegions={handleDetectRegions}
              onExtractWithDetection={handleExtractWithDetection}
              onClearDetection={handleClearDetection}
            />
          )}
          
          {activeTab === 'verification' && (
            <VerificationTab
              // File upload (single file for verification)
              uploadedFile={uploadedFile} // Use single file for verification
              onFileUpload={(files) => {
                // Handle file upload for verification tab
                console.log('📁 Verification tab file upload:', files);
                if (Array.isArray(files) && files.length > 0) {
                  handleFileUploadWithClear(files);
                } else if (files && files instanceof FileList && files.length > 0) {
                  handleFileUploadWithClear([files[0]]);
                }
              }}
              onCameraCapture={handleCameraCapture}
              
              // Verification data management
              verificationData={verificationData}
              onVerificationFieldChange={updateVerificationField}
              onClearVerificationForm={clearVerificationForm}
              onUseExtractedData={handleUseExtractedData}
              extractedData={extractedData}
              selectedTemplate={selectedTemplate}
              
              // Verification process props
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
          <p>
            Built with React.js • Supports PDF, JPG, PNG • Multi-language OCR • 
            Multipage & Batch Support • Confidence Zones & Bounding Boxes
          </p>
        </div>
      </div>
    </div>
  );
};

export default OCRProjectUI;
