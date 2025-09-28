import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const FormField = ({ field, value, confidence, onChange, disabled = false }) => {
  if (!field) return null;

  const handleChange = (e) => {
    if (onChange) {
      onChange(field.id, e.target.value);
    }
  };

  // Determine confidence color and icon
  const getConfidenceColor = (conf) => {
    if (conf === null || conf === undefined) return '#6b7280';
    if (conf >= 0.8) return '#16a34a';
    if (conf >= 0.6) return '#d97706';
    return '#dc2626';
  };

  const getConfidenceIcon = (conf) => {
    if (conf === null || conf === undefined) return <AlertCircle size={14} />;
    if (conf >= 0.8) return <CheckCircle size={14} />;
    return <AlertTriangle size={14} />;
  };

  const confidenceColor = getConfidenceColor(confidence);
  const confidenceIcon = getConfidenceIcon(confidence);
  const confidenceText = confidence !== null && confidence !== undefined 
    ? `${Math.round(confidence * 100)}%` 
    : 'N/A';

  const fieldStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    labelContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--text-primary)'
    },
    confidenceBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      backgroundColor: `${confidenceColor}15`,
      color: confidenceColor,
      border: `1px solid ${confidenceColor}30`
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid var(--border-medium)',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      backgroundColor: disabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    textarea: {
      minHeight: '80px',
      resize: 'vertical'
    }
  };

  // Add focus styles
  const inputFocusStyles = {
    borderColor: 'var(--primary)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  };

  return (
    <div style={fieldStyles.container}>
      <div style={fieldStyles.labelContainer}>
        <label style={fieldStyles.label}>
          {field.label}
        </label>
        {confidence !== null && confidence !== undefined && (
          <div style={fieldStyles.confidenceBadge}>
            {confidenceIcon}
            <span>{confidenceText}</span>
          </div>
        )}
      </div>
      
      {field.type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          disabled={disabled}
          style={{
            ...fieldStyles.input,
            ...fieldStyles.textarea
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-medium)';
            e.target.style.boxShadow = 'none';
          }}
        />
      ) : (
        <input
          type={field.type || 'text'}
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          disabled={disabled}
          style={fieldStyles.input}
          onFocus={(e) => {
            if (!disabled) {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-medium)';
            e.target.style.boxShadow = 'none';
          }}
        />
      )}
    </div>
  );
};

export default FormField;