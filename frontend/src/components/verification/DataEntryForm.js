import React, { useState } from 'react';
import { styles } from '../../constants/styles';
import FormField from '../common/FormField';
import { englishFields } from '../../constants/fields';

// --- Move HorizontalFormField outside of the main component ---
// By defining it here, it's created only once.
const HorizontalFormField = ({ field, value, onChange }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    marginBottom: 'var(--space-sm)',
    padding: 'var(--space-sm)',
    borderRadius: 'var(--radius-sm)',
  }}>
    <label style={{
      fontSize: '0.9rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
      minWidth: '80px',
      textAlign: 'left',
      marginBottom: 0
    }}>
      {field.label}:
    </label>
    <input
      type={field.type || 'text'}
      value={value}
      onChange={(e) => onChange(field.id, e.target.value)}
      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
      style={{
        flex: 1,
        padding: 'var(--space-sm)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        fontFamily: 'var(--font-family)',
        transition: 'all var(--transition-fast)',
        boxSizing: 'border-box'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--primary)';
        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border-medium)';
        e.target.style.boxShadow = 'none';
      }}
    />
  </div>
);

const DataEntryForm = ({ 
  verificationData, 
  onFieldChange, 
  onClear, 
  onUseExtracted, 
  extractedData,
  customFields = null  // NEW: Accept custom fields
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Determine which fields to use: custom fields if provided, otherwise default English fields
  const fieldsToRender = customFields && customFields.length > 0 
    ? customFields 
    : englishFields.slice(0, 8);

  const handleJsonInputChange = (value) => {
    setJsonInput(value);
    setJsonError('');

    if (typeof value === 'string' && !value.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(value);
      // Update verification data with parsed JSON
      Object.entries(parsed).forEach(([key, val]) => {
        onFieldChange(key, val);
      });
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const populateWithSampleData = () => {
    // Generate sample data based on current fields
    const sampleData = {};
    fieldsToRender.slice(0, 4).forEach((field, index) => {
      switch (field.type) {
        case 'number':
          sampleData[field.id] = index === 0 ? '30' : '25';
          break;
        case 'email':
          sampleData[field.id] = 'john.smith@example.com';
          break;
        case 'tel':
          sampleData[field.id] = '+1-555-0123';
          break;
        default:
          if (field.id.toLowerCase().includes('name')) {
            sampleData[field.id] = 'John Smith';
          } else if (field.id.toLowerCase().includes('address')) {
            sampleData[field.id] = '123 Elm Street';
          } else if (field.id.toLowerCase().includes('gender')) {
            sampleData[field.id] = 'Male';
          } else {
            sampleData[field.id] = `Sample ${field.label}`;
          }
      }
    });

    setJsonInput(JSON.stringify(sampleData, null, 2));
    Object.entries(sampleData).forEach(([key, val]) => {
      onFieldChange(key, val);
    });
  };

  const clearCurrentFields = () => {
    // Clear only the fields that are currently being displayed
    fieldsToRender.forEach(field => {
      onFieldChange(field.id, '');
    });
    setJsonInput('');
    setJsonError('');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Dynamic Form Fields with Horizontal Layout */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--space-xs)' 
          }}>
            {fieldsToRender.length > 0 ? (
              fieldsToRender.map(field => (
                <HorizontalFormField
                  key={field.id}
                  field={field}
                  value={verificationData[field.id] || ''}
                  onChange={onFieldChange}
                />
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--text-tertiary)',
                fontStyle: 'italic',
                border: '2px dashed var(--border-light)',
                borderRadius: 'var(--radius-md)'
              }}>
                No fields configured for verification. Please add fields in the Field Configuration section above.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: 'var(--space-md)',
          flexWrap: 'wrap',
          alignItems: 'center',
          paddingTop: 'var(--space-lg)',
        }}>
          <button 
            onClick={clearCurrentFields}
            disabled={fieldsToRender.length === 0}
            style={{ 
              ...styles.button, 
              ...styles.secondaryButton,
              opacity: fieldsToRender.length === 0 ? 0.6 : 1,
              cursor: fieldsToRender.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Clear All Fields
          </button>

          {extractedData && Object.keys(extractedData).length > 0 && (
            <button 
              onClick={() => {
                // Populate with extracted data for current fields only
                fieldsToRender.forEach(field => {
                  if (extractedData[field.id]) {
                    onFieldChange(field.id, extractedData[field.id]);
                  }
                });
              }}
              style={{ ...styles.button, ...styles.primaryButton }}
            >
              Use Extracted Data
            </button>
          )}
        </div>

        {fieldsToRender.length === 0 && (
          <p style={{
            color: 'var(--text-tertiary)',
            fontSize: '0.875rem',
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: '1rem'
          }}>
            Configure fields in the Field Configuration section above to start entering verification data.
          </p>
        )}
      </div>
    </div>
  );
};

export default DataEntryForm;