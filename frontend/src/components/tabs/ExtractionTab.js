import React, { useState, useEffect } from 'react';
import { FileText, Edit3, Camera, Layers, Globe, Target, Plus, X, Settings, RefreshCw } from 'lucide-react';
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

  // Dark mode styles (CSS-in-JS approach using CSS variables)
  const fieldManagerStyles = {
    container: {
      padding: '1rem',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      border: '1px solid var(--border-light)',
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
      backgroundColor: 'rgba(255, 159, 10, 0.1)',
      borderColor: 'rgba(255, 159, 10, 0.3)',
      color: 'var(--accent)'
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
      backgroundColor: 'var(--bg-tertiary)',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      border: '1px solid var(--border-light)'
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

  const handleSinglePageExtract = () => {
    if (uploadedFiles.length > 0) {
      // Extract field names for API call
      const fieldNames = customFields.map(field => field.id);
      console.log("Field Names");
      console.log(fieldNames);
      onExtractSinglePage(firstFile, activeTemplate.langCode, fieldNames);
    }
  };

  const handleMultipageExtract = () => {
    if (uploadedFiles.length > 0) {
      // Extract field names for API call
      const fieldNames = customFields.map(field => field.id);
      onExtractMultipage(firstFile, activeTemplate.langCode, fieldNames);
    }
  };

  const addCustomField = () => {
    if (newFieldName.trim()) {
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

        {firstFile && (
          <>
            <div style={styles.templateSelector}>
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
          </>
        )}
      </div>

      {/* Step 2: Template Field Configuration */}
      {firstFile && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
              <Settings style={{ color: '#7c3aed' }} />
            </div>
            <h2 style={styles.cardTitle}>Field Configuration</h2>
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
              onClick={handleSinglePageExtract} 
              disabled={isProcessing || customFields.length === 0}
              style={{ 
                ...styles.button, 
                ...styles.primaryButton,
                opacity: (isProcessing || customFields.length === 0) ? 0.6 : 1,
                cursor: (isProcessing || customFields.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              <Target size={18} />
              {isExtractingSingle ? 'Extracting...' : 'Extract Single Page'}
            </button>
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
              <Layers size={18} />
              {isExtractingMultipage ? 'Processing...' : 'Extract All Pages (PDF)'}
            </button>
          </div>

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
      )}

      {/* Step 3: View Results */}
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
              {customFields.map(field => (
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
          template={{ ...activeTemplate, fields: customFields }}
        />
      )}
    </div>
  );
};

export default ExtractionTab;