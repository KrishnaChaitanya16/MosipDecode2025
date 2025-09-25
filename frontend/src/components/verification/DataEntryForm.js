import React, { useState } from 'react';
import { styles } from '../../constants/styles';
import FormField from '../common/FormField';
import { englishFields } from '../../constants/fields';

const DataEntryForm = ({ 
  verificationData, 
  onFieldChange, 
  onClear, 
  onUseExtracted, 
  extractedData 
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  const handleJsonInputChange = (value) => {
    setJsonInput(value);
    setJsonError('');
    
    if (!value.trim()) {
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
    const sampleData = {
      "name": "John Smith",
      "age": "30",
      "gender": "Male",
      "address": "123 Elm Street"
    };
    setJsonInput(JSON.stringify(sampleData, null, 2));
    Object.entries(sampleData).forEach(([key, val]) => {
      onFieldChange(key, val);
    });
  };

  // Custom horizontal form field component for side-by-side layout
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
        type="text"
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}`}
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

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        
        {/* Method 2: Individual Form Fields with Horizontal Layout */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--space-xs)' 
          }}>
            {englishFields.slice(0, 8).map(field => (
              <HorizontalFormField
                key={field.id}
                field={field}
                value={verificationData[field.id] || ''}
                onChange={onFieldChange}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: 'var(--space-md)',
          flexWrap: 'wrap',
          alignItems: 'center',
          paddingTop: 'var(--space-lg)',
          /* borderTop: '1px solid var(--border-light)' */
        }}>
          <button 
            onClick={onClear}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataEntryForm;