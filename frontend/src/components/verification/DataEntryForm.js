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

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '500', 
          color: '#374151', 
          marginBottom: '1rem' 
        }}>
          Enter Verification Data
        </h3>
        
        {/* Method 1: JSON Input */}
        {/* <div style={{ marginBottom: '1.5rem' }}>
          <label style={styles.label}>
            JSON Data Input
            {jsonError && (
              <span style={{ color: '#dc2626', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                ({jsonError})
              </span>
            )}
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => handleJsonInputChange(e.target.value)}
            style={{
              ...styles.input,
              height: '120px',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              ...(jsonError ? { borderColor: '#fca5a5', backgroundColor: '#fef2f2' } : {})
            }}
            placeholder='{"name": "John Smith", "age": "30", "gender": "Male", "address": "123 Elm Street"}'
          />
        </div> */}

        {/* Method 2: Individual Form Fields */}
        <div style={{ marginBottom: '1.5rem' }}>
{/*           <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '0.75rem' 
          }}>
            Or fill individual fields:
          </h4> */}
          <div style={{ ...styles.grid, ...styles.grid2, gap: '1rem' }}>
            {englishFields.slice(0, 8).map(field => (
              <FormField
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
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button 
            onClick={onClear}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Clear All
          </button>
          <button 
            onClick={() => onUseExtracted(extractedData)}
            style={{ ...styles.button, ...styles.primaryButton }}
            disabled={!extractedData || Object.keys(extractedData).length === 0}
          >
            Use Extracted Data
          </button>
        </div>
      </div>

      {/* Preview Current Data */}
    </div>
  );
};

export default DataEntryForm;
