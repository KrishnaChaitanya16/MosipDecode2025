import React, { useState, useEffect } from 'react';
import { FileText, Edit3, Camera, Layers, Globe, Target, Plus, X, Settings, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { styles } from '../../constants/styles';
import { templates } from '../../constants/fields';
import FileUploadArea from '../upload/FileUploadArea';
import ErrorDisplay from '../common/ErrorDisplay';
import UnifiedResultsComponent from './UnifiedResultsComponent';
import MultipageResults from '../batch/BatchResults';

const ExtractionTab = ({
  // File management
  uploadedFiles, onFileUpload, onCameraCapture, onRemoveFile,
  // Template/Language
  selectedTemplate, onTemplateChange,
  // Single Page Extraction (now unified with multi-image)
  onExtractSinglePage, singlePageData, isExtractingSingle, singlePageError, singlePageErrorDetails, onDismissSinglePageError,
  // Multipage PDF Extraction - REMOVED THE OLD APPROACH
  // Multi-image extraction (includes PDF pages processed as images)
  multiImageData, currentImageIndex, isProcessingMultiImage, multiImageError, multiImageErrorDetails, onProcessMultipleImages, onNavigateToImage, onNextImage, onPrevImage, onDismissMultiImageError, onUpdateImageField, onClearMultiImageResults,
  // Field updates
  onFieldChange
}) => {
  const hasFiles = uploadedFiles.length > 0;
  const firstFile = hasFiles ? uploadedFiles[0] : null;
  const isMultipleFiles = uploadedFiles.length > 1;
  const isPdfFile = firstFile && firstFile.type === 'application/pdf';
  const isProcessing = isExtractingSingle || isProcessingMultiImage;
  const activeTemplate = templates[selectedTemplate];

  // Field customization state
  const [customFields, setCustomFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [showFieldManager, setShowFieldManager] = useState(false);

  // Initialize custom fields with template defaults on template change
  useEffect(() => {
    if (activeTemplate) {
      setCustomFields(activeTemplate.fields.map(field => ({ 
        ...field, 
        isCustom: false 
      })));
    }
  }, [selectedTemplate]);

  // Field manager styles
  const fieldManagerStyles = {
    container: {
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      transition: 'all var(--transition-fast)'
    },
    addFieldContainer: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-end',
      marginBottom: '1rem'
    },
    fieldInput: {
      flex: 1
    },
    label: {
      ...styles.label,
      fontSize: '0.875rem',
      marginBottom: '0.25rem',
      color: 'var(--text-primary)'
    },
    input: {
      ...styles.input,
      padding: '0.5rem 0.75rem',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-medium)',
      color: 'var(--text-primary)'
    },
    fieldsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '0.75rem',
      maxHeight: '240px',
      overflowY: 'auto'
    },
    fieldItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      transition: 'all var(--transition-fast)',
      border: '1px solid',
      position: 'relative'
    },
    defaultField: {
      backgroundColor: 'var(--bg-primary)',
      borderColor: 'var(--border-light)',
      color: 'var(--text-primary)'
    },
    customField: {
      backgroundColor: 'var(--bg-primary)',
      borderColor: 'var(--border-light)',
      color: 'var(--text-primary)'
    },
    fieldLabel: {
      fontWeight: '500',
      flex: 1,
      marginRight: '0.5rem'
    },
    fieldBadge: {
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontWeight: '500',
      marginRight: '0.5rem'
    },
    defaultBadge: {
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      color: 'var(--success)'
    },
    customBadge: {
      backgroundColor: 'rgba(255, 159, 10, 0.15)',
      color: 'var(--accent)'
    },
    removeButton: {
      padding: '0.375rem',
      border: 'none',
      background: 'transparent',
      color: 'var(--error)',
      cursor: 'pointer',
      borderRadius: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all var(--transition-fast)',
      opacity: 0.7
    },
    summary: {
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
    },
    summaryText: {
      margin: 0,
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
      fontWeight: '500',
      lineHeight: '1.5'
    },
    summaryFields: {
      fontWeight: '400',
      color: 'var(--text-tertiary)'
    }
  };

  // Determine extraction button text and handler
  const getExtractionButtonText = () => {
    if (isExtractingSingle || isProcessingMultiImage) return 'Extracting...';
    if (isMultipleFiles && !isPdfFile) return `Extract ${uploadedFiles.length} Images`;
    if(!isMultipleFiles && isPdfFile) return `Extract First Page`;
    return 'Extract';
  };

  const handleExtract = () => {
    if (!hasFiles || customFields.length === 0) return;
    
    const fieldNames = customFields.map(field => field.id);
    
    if (isMultipleFiles && !isPdfFile) {
      // Multiple image files
      onProcessMultipleImages(uploadedFiles, activeTemplate.langCode, fieldNames);
    } else {
      // Single file (image or PDF with single page extraction)
      onExtractSinglePage(firstFile, activeTemplate.langCode, fieldNames);
    }
  };

  // NEW: Handle PDF multipage extraction using the same logic as multi-image
  const handleMultipageExtract = () => {
    if (!firstFile || customFields.length === 0 || !isPdfFile) return;
    
    const fieldNames = customFields.map(field => field.id);
    // Use the processMultipagePdfAsImages function from parent
    onProcessMultipleImages([firstFile], activeTemplate.langCode, fieldNames, true); // Add isPdf flag
  };

  const addCustomField = () => {
    if (typeof newFieldName === 'string' && newFieldName.trim()) {
      const newField = {
        id: newFieldName.trim(),
        label: newFieldName.trim(),
        type: 'text',
        placeholder: `Enter ${newFieldName.trim()}`,
        isCustom: true
      };
      setCustomFields(prev => [...prev, newField]);
      setNewFieldName('');
    }
  };

  const removeField = (fieldId) => {
    setCustomFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const resetToTemplate = () => {
    setCustomFields(activeTemplate.fields.map(field => ({ 
      ...field, 
      isCustom: false 
    })));
  };

  const fieldManagerButton = {
    ...styles.button,
    ...styles.secondaryButton,
    marginLeft: 'auto',
    fontSize: '0.875rem',
    padding: '0.5rem 1rem',
    backgroundColor: showFieldManager ? 'var(--primary)' : 'var(--bg-tertiary)',
    color: showFieldManager ? 'var(--text-inverse)' : 'var(--text-primary)',
    border: `1px solid ${showFieldManager ? 'var(--primary)' : 'var(--border-medium)'}`
  };

  // Determine the result type for UnifiedResultsComponent
  const getResultType = () => {
    if (singlePageData && !multiImageData) return 'single';
    if (multiImageData && Object.keys(multiImageData).length > 0) {
      // Check if it's PDF pages or regular images
      const firstKey = Object.keys(multiImageData)[0];
      return firstKey.startsWith('page_') ? 'pdf' : 'multi-image';
    }
    return 'single';
  };

  const resultType = getResultType();
  const totalItems = multiImageData ? Object.keys(multiImageData).length : 0;

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
          allowMultiple={true}
        />
      </div>

      {/* Step 2: Template Field Configuration */}
      {hasFiles && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
              <Settings style={{ color: '#007AFF' }} />
            </div>
            <h3 style={styles.cardTitle}>Field Configuration</h3>
            <button
              onClick={() => setShowFieldManager(!showFieldManager)}
              style={fieldManagerButton}
            >
              <Settings size={16} />
              {showFieldManager ? 'Hide Manager' : 'Customize Fields'}
            </button>
          </div>

          {showFieldManager && (
            <div style={fieldManagerStyles.container}>
              {/* Add New Field */}
              <div style={fieldManagerStyles.addFieldContainer}>
                <div style={fieldManagerStyles.fieldInput}>
                  <label style={fieldManagerStyles.label}>
                    Add Custom Field:
                  </label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Enter field name"
                    style={fieldManagerStyles.input}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomField()}
                  />
                </div>
                <button
                  onClick={addCustomField}
                  disabled={!newFieldName.trim()}
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    padding: '0.5rem 1rem',
                    opacity: newFieldName.trim() ? 1 : 0.6,
                    cursor: newFieldName.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Plus size={16} />
                  Add Field
                </button>
                <button
                  onClick={resetToTemplate}
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    padding: '0.5rem 1rem'
                  }}
                  title="Reset to original template fields"
                >
                  <RefreshCw size={16} />
                  Reset
                </button>
              </div>

              {/* Field List */}
              <div style={fieldManagerStyles.fieldsGrid}>
                {customFields.map((field, index) => (
                  <div
                    key={field.id}
                    style={{
                      ...fieldManagerStyles.fieldItem,
                      ...(field.isCustom ? fieldManagerStyles.customField : fieldManagerStyles.defaultField)
                    }}
                  >
                    <span style={fieldManagerStyles.fieldLabel}>
                      {field.label}
                    </span>
                    <span 
                      style={{
                        ...fieldManagerStyles.fieldBadge,
                        ...(field.isCustom ? fieldManagerStyles.customBadge : fieldManagerStyles.defaultBadge)
                      }}
                    >
                      {field.isCustom ? 'CUSTOM' : 'DEFAULT'}
                    </span>
                    <button
                      onClick={() => removeField(field.id)}
                      style={{
                        ...fieldManagerStyles.removeButton,
                        ':hover': {
                          opacity: 1,
                          backgroundColor: 'var(--error)',
                          color: 'var(--text-inverse)'
                        }
                      }}
                      title={`Remove ${field.label} field`}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.backgroundColor = 'var(--error)';
                        e.target.style.color = 'var(--text-inverse)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '0.7';
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'var(--error)';
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {customFields.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--text-tertiary)',
                  fontStyle: 'italic'
                }}>
                  No fields selected. Add some fields to begin extraction.
                </div>
              )}
            </div>
          )}

          {/* Current Fields Summary */}
          <div style={fieldManagerStyles.summary}>
            <p style={fieldManagerStyles.summaryText}>
              <strong>Selected Fields ({customFields.length}):</strong>{' '}
              {customFields.length > 0 ? (
                <span style={fieldManagerStyles.summaryFields}>
                  {customFields.map(f => f.label).join(', ')}
                </span>
              ) : (
                <span style={{ color: 'var(--error)', fontStyle: 'italic' }}>
                  No fields selected - add fields to continue
                </span>
              )}
            </p>
          </div>

          {/* Extract Actions */}
          <div style={styles.actionsContainer}>
            <button 
              onClick={handleExtract} 
              disabled={isProcessing || customFields.length === 0}
              style={{ 
                ...styles.button, 
                ...styles.primaryButton,
                opacity: (isProcessing || customFields.length === 0) ? 0.6 : 1,
                cursor: (isProcessing || customFields.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {getExtractionButtonText()}
            </button>
            
            {isPdfFile && (
              <button 
                onClick={handleMultipageExtract} 
                disabled={isProcessing || customFields.length === 0}
                style={{ 
                  ...styles.button, 
                  ...styles.secondaryButton,
                  opacity: (isProcessing || customFields.length === 0) ? 0.6 : 1,
                  cursor: (isProcessing || customFields.length === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessingMultiImage ? 'Processing Pages...' : 'Extract All Pages (PDF)'}
              </button>
            )}
          </div>

          {/* Error Displays */}
          <ErrorDisplay
            error={singlePageError}
            errorDetails={singlePageErrorDetails}
            onDismiss={onDismissSinglePageError}
          />
          <ErrorDisplay
            error={multiImageError}
            errorDetails={multiImageErrorDetails}
            onDismiss={onDismissMultiImageError}
          />
        </div>
      )}

      {/* Step 3: View Results */}
      {/* Unified Results Display */}
      {(singlePageData || (multiImageData && Object.keys(multiImageData).length > 0)) && (
        <UnifiedResultsComponent
          singlePageData={singlePageData}
          multiImageData={multiImageData}
          currentImageIndex={currentImageIndex}
          totalImages={totalItems}
          onNavigateToImage={onNavigateToImage}
          onNextImage={onNextImage}
          onPrevImage={onPrevImage}
          fields={customFields}
          onFieldChange={onFieldChange}
          type={resultType}
        />
      )}
    </div>
  );
};

export default ExtractionTab;