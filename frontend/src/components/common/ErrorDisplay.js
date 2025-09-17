import React from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { styles } from '../../constants/styles';

const ErrorDisplay = ({ error, errorDetails, onRetry, onDismiss, isRetrying = false }) => {
  if (!error) return null;

  return (
    <div style={styles.errorContainer}>
      <div style={styles.errorHeader}>
        <div style={styles.errorIconWrapper}>
          <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626' }} />
        </div>
        <h3 style={styles.errorTitle}>OCR Processing Failed</h3>
      </div>
      
      <p style={styles.errorMessage}>
        {errorDetails?.message || error}
      </p>

      {errorDetails?.quality && (
        <div style={styles.errorDetails}>
          <div style={styles.errorDetailsHeader}>
            <AlertCircle size={16} />
            <span>Quality Analysis</span>
          </div>
          
          <div style={styles.qualityScore}>
            <span>Quality Score: {errorDetails.quality.score}/100</span>
          </div>

          {errorDetails.quality.suggestions && errorDetails.quality.suggestions.length > 0 && (
            <>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#7f1d1d', marginBottom: '0.5rem' }}>
                Suggestions for improvement:
              </p>
              <ul style={styles.suggestionsList}>
                {errorDetails.quality.suggestions.map((suggestion, index) => (
                  <li key={index} style={styles.suggestionItem}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div style={styles.errorActions}>
        <button
          onClick={onRetry}
          style={styles.retryButton}
          disabled={isRetrying}
        >
          <RefreshCw size={16} />
          {isRetrying ? 'Processing...' : 'Retry Extraction'}
        </button>
        <button
          onClick={onDismiss}
          style={styles.dismissButton}
        >
          <X size={16} />
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
