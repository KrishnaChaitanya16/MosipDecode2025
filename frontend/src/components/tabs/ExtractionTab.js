import React from 'react';
import { FileText, Edit3, Camera, Layers, Globe, Target } from 'lucide-react';
import { styles } from '../../constants/styles';
import { templates } from '../../constants/fields';
import FileUploadArea from '../upload/FileUploadArea';
import ErrorDisplay from '../common/ErrorDisplay';
import FormField from '../common/FormField';
import ConfidenceOverlay from '../detection/ConfidenceOverlay';
import MultipageResults from '../batch/BatchResults';

const ExtractionTab = ({
  // File management
  uploadedFiles, onFileUpload, onCameraCapture, onRemoveFile,
  // Template/Language
  selectedTemplate, onTemplateChange,
  // Single Page Extraction
  onExtractSinglePage, singlePageData, isExtractingSingle, singlePageError, singlePageErrorDetails, onDismissSinglePageError,
  // Multipage Extraction
  onExtractMultipage, multipageData, isExtractingMultipage, multipageError, multipageErrorDetails, onDismissMultipageError,
  // Field updates
  onFieldChange
}) => {
  const firstFile = uploadedFiles.length > 0 ? uploadedFiles[0] : null;
  const isProcessing = isExtractingSingle || isExtractingMultipage;
  const activeTemplate = templates[selectedTemplate];

  const handleSinglePageExtract = () => {
    if (firstFile) {
      onExtractSinglePage(firstFile, activeTemplate.langCode);
    }
  };

  const handleMultipageExtract = () => {
    if (firstFile) {
      onExtractMultipage(firstFile, activeTemplate.langCode);
    }
  };

  return (
    <div>
      {/* Step 1: Upload and Language Selection */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, ...styles.blueIcon }}>
            <FileText style={{ color: '#2563eb' }} />
          </div>
          <h2 style={styles.cardTitle}>Upload & Configure</h2>
        </div>

        <FileUploadArea 
          onFileUpload={onFileUpload}
          uploadedFiles={uploadedFiles}
          onCameraCapture={onCameraCapture}
          onRemoveFile={onRemoveFile}
          allowMultiple={false} // Simplified to single file upload for clarity
        />

        {firstFile && (
          <>
            <div style={styles.templateSelector}>
              {/* <Globe size={20} style={{ color: '#6b7280' }} /> */}
              <label htmlFor="template-select" style={styles.templateLabel}>
                Document Language:
              </label>
              <select
                id="template-select"
                value={selectedTemplate}
                onChange={(e) => onTemplateChange(e.target.value)}
                style={styles.templateSelect}
                disabled={isProcessing}
              >
                {Object.entries(templates).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.actionsContainer}>
              <button 
                onClick={handleSinglePageExtract} 
                disabled={isProcessing}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                <Target size={18} />
                {isExtractingSingle ? 'Extracting...' : 'Extract Single Page'}
              </button>
              <button 
                onClick={handleMultipageExtract} 
                disabled={isProcessing}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                <Layers size={18} />
                {isExtractingMultipage ? 'Processing...' : 'Extract All Pages (PDF)'}
              </button>
            </div>
          </>
        )}

        <ErrorDisplay
          error={singlePageError}
          errorDetails={singlePageErrorDetails}
          onDismiss={onDismissSinglePageError}
        />
        <ErrorDisplay
          error={multipageError}
          errorDetails={multipageErrorDetails}
          onDismiss={onDismissMultipageError}
        />
      </div>

      {/* Step 2: View Results */}
      {singlePageData && (
        <div style={styles.resultsGrid}>
          <ConfidenceOverlay
            originalImage={firstFile}
            overlayImage={singlePageData.overlayImage}
            detections={singlePageData.extractedData ? Object.values(singlePageData.extractedData).length : 0}
          />
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, ...styles.greenIcon }}>
                <Edit3 style={{ color: '#16a34a' }} />
              </div>
              <h2 style={styles.cardTitle}>Extracted Form Data</h2>
            </div>
            <div style={{ ...styles.grid, ...styles.grid2 }}>
              {activeTemplate.fields.map(field => (
                <FormField
                  key={field.id}
                  field={field}
                  value={singlePageData.extractedData ? singlePageData.extractedData[field.id] : ''}
                  confidence={singlePageData.confidenceData ? singlePageData.confidenceData[field.id] : null}
                  onChange={onFieldChange}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {multipageData && (
        <MultipageResults 
          results={multipageData}
          template={activeTemplate}
        />
      )}
    </div>
  );
};

export default ExtractionTab;