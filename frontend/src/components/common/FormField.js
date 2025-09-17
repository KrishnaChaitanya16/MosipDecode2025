import React from 'react';
import { styles } from '../../constants/styles';

const FormField = ({ field, value, onChange, confidence, hasError }) => {
  const getConfidenceStyle = (conf) => {
    if (conf > 0.8) return styles.confidenceHigh;
    if (conf > 0.6) return styles.confidenceMed;
    return styles.confidenceLow;
  };

  return (
    <div style={styles.formField}>
      <label style={styles.label}>
        {field.label}
        {confidence && (
          <span style={getConfidenceStyle(confidence)}>
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
      </label>
      {field.type === 'select' ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          style={{
            ...styles.input,
            ...(hasError ? styles.inputError : {})
          }}
        >
          <option value="">Select {field.label}</option>
          {field.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          value={value || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          style={{
            ...styles.input,
            ...(hasError ? styles.inputError : {})
          }}
        />
      )}
    </div>
  );
};

export default FormField;
