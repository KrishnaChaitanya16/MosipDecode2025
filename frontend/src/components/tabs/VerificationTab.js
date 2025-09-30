import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Settings, Plus, X } from 'lucide-react';
import { styles } from '../../constants/styles';
import { templates } from '../../constants/fields';
import FileUploadArea from '../upload/FileUploadArea';
import DataEntryForm from '../verification/DataEntryForm';
import VerificationResults from '../verification/VerificationResults';

const VerificationTab = ({
  onRemoveFile,
  uploadedFile,
  onFileUpload,
  onCameraCapture,
  verificationData,
  onVerificationFieldChange,
  onClearVerificationForm,
  onUseExtractedData,
  extractedData,
  selectedTemplate,
  // New verification props
  verificationResult,
  isVerifying,
  verificationError,
  onStartVerification,
  onClearVerificationResult
}) => {
  // Field customization state
  const [customFields, setCustomFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [showFieldManager, setShowFieldManager] = useState(false);

  const activeTemplate = templates[selectedTemplate];

  // Initialize custom fields with template defaults
  useEffect(() => {
    if (activeTemplate) {
      setCustomFields(activeTemplate.fields.map(field => ({ 
        ...field, 
        isCustom: false 
      })));
    }
  }, [selectedTemplate]);

  const canStartVerification = uploadedFile && Object.keys(verificationData).length > 0;

  // Show results only when not verifying and has result
  const showResults = !isVerifying && verificationResult;

  // Dark mode styles for field manager
  const fieldManagerStyles = {
    container: {
      padding: '1rem',
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
      <div style={styles.card}>

        {/* Field Configuration Section */}
        <div style={{
          ...styles.cardHeader,
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '1.5rem',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
              <Settings style={{ color: '#007AFF' }} />
            </div>
            <h2 style={styles.cardTitle}>Verification Field Configuration</h2>
          </div>
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
                  Add Custom Verification Field:
                </label>
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Enter field name to verify"
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
                No fields selected for verification. Add some fields to begin.
              </div>
            )}
          </div>
        )}

        {/* Current Fields Summary */}
        <div style={fieldManagerStyles.summary}>
          <p style={fieldManagerStyles.summaryText}>
            <strong>Verification Fields ({customFields.length}):</strong>{' '}
            {customFields.length > 0 ? (
              <span style={fieldManagerStyles.summaryFields}>
                {customFields.map(f => f.label).join(', ')}
              </span>
            ) : (
              <span style={{ color: 'var(--error)', fontStyle: 'italic' }}>
                No fields selected for verification
              </span>
            )}
          </p>
        </div>

        <div style={{ ...styles.grid, ...styles.grid2, marginBottom: '1.5rem', alignItems: 'flex-start' }}>
          {/* File Upload Section */}
          <div style={{ 
            position: 'relative',
            paddingRight: '1.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '500', 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              height: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              Original Document
            </h3>

            <FileUploadArea 
              onFileUpload={onFileUpload}
              uploadedFiles={uploadedFile ? [uploadedFile] : []} 
              onCameraCapture={onCameraCapture}
              onRemoveFile={onRemoveFile}
              allowMultiple={false}
            />

            {/* Vertical separator line */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '2px',
              height: '150%',
              backgroundColor: 'var(--border-light)',
              opacity: 0.9
            }} />
          </div>

          {/* Data Entry Section */}
          <div style={{ 
            paddingLeft: '1.5rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '500', 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              height: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              Enter Verification Data
            </h3>

            <DataEntryForm
              verificationData={verificationData}
              onFieldChange={onVerificationFieldChange}
              onClear={onClearVerificationForm}
              onUseExtracted={onUseExtractedData}
              extractedData={extractedData}
              customFields={customFields} // Pass custom fields to form
            />
          </div>
        </div>

        {/* Verification Error Display */}
        {verificationError && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ color: '#dc2626' }} />
              <span style={{ color: '#dc2626', fontWeight: '500' }}>Verification Error</span>
            </div>
            <p style={{ color: '#991b1b', marginTop: '0.5rem', marginBottom: 0 }}>
              {verificationError}
            </p>
          </div>
        )}

        {/* Start Verification Button */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => {
              // Extract field names for verification
              const fieldNames = customFields.map(field => field.id);
              onStartVerification(uploadedFile, verificationData, fieldNames);
            }}
            disabled={!canStartVerification || isVerifying || customFields.length === 0}
            style={{ 
              ...styles.button, 
              ...styles.primaryButton, 
              padding: '0.75rem 1.5rem',
              opacity: (!canStartVerification || isVerifying || customFields.length === 0) ? 0.6 : 1,
              cursor: (!canStartVerification || isVerifying || customFields.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {isVerifying ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Verifying...
              </>
            ) : (
              'Start Verification'
            )}
          </button>

          {verificationResult && !isVerifying && (
            <button 
              onClick={onClearVerificationResult}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Clear Results
            </button>
          )}
        </div>

        {!canStartVerification && (
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem', 
            marginTop: '0.5rem',
            marginBottom: 0 
          }}>
            {customFields.length === 0 
              ? "Please configure verification fields, upload a document and enter verification data to proceed."
              : "Please upload a document and enter verification data to proceed."
            }
          </p>
        )}
      </div>

      {/* Verification Results with Smooth Transition - Hide when verifying */}
      <div style={{
        maxHeight: showResults ? '2000px' : '0px',
        opacity: showResults ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: showResults ? 'translateY(0)' : 'translateY(-20px)',
        marginTop: showResults ? '2rem' : '0'
      }}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Verification Results</h2>
          </div>

          <VerificationResults 
            verificationResult={verificationResult} 
            customFields={customFields} // Pass custom fields to results
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationTab;