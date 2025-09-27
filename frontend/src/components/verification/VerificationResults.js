import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { styles } from '../../constants/styles';

const StatusBadge = ({ status, score }) => {
  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'match':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534',
          border: '1px solid #bbf7d0'
        };
      case 'no_match':
        return {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fecaca'
        };
      case 'partial_match':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fed7aa'
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db'
        };
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'match':
        return <CheckCircle size={14} />;
      case 'no_match':
        return <XCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const getStatusDisplayName = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'match':
        return 'MATCH';
      case 'no_match':
        return 'NO MATCH';
      case 'partial_match':
        return 'PARTIAL';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  return (
    <span style={{
      ...getStatusStyle(status),
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px'
    }}>
      {getStatusIcon(status)}
      {getStatusDisplayName(status)}
      {score && ` (${Math.round(score * 100)}%)`}
    </span>
  );
};

const OverallStatusBadge = ({ status, confidence }) => {
  const getOverallStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534',
          border: '1px solid #bbf7d0'
        };
      case 'failed':
        return {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fecaca'
        };
      case 'partial':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fed7aa'
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db'
        };
    }
  };

  const getOverallStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return <CheckCircle size={16} />;
      case 'failed':
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

};

const VerificationResults = ({ verificationResult, customFields = null }) => {
  if (!verificationResult) return null;

  console.log('Verification result received:', verificationResult);

  // FIXED: Extract correct properties from the actual data structure
  const {
    overall_status,
    overall_confidence,
    field_results,
    total_fields_checked,
    extracted_text_available,
    error
  } = verificationResult;

  // Handle error case
  if (error) {
    return (
      <div style={{
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <XCircle size={16} style={{ color: '#dc2626' }} />
          <span style={{ color: '#dc2626', fontWeight: '500' }}>Verification Error</span>
        </div>
        <p style={{ color: '#991b1b', marginTop: '0.5rem', marginBottom: 0 }}>
          {error}
        </p>
      </div>
    );
  }

  // FIXED: Check if field_results exists and has data
  if (!field_results || Object.keys(field_results).length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-tertiary)',
        fontStyle: 'italic'
      }}>
        No verification results to display.
      </div>
    );
  }

  return (
    <div>

      {/* Field Results Table - Dark Mode Compatible */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'center',
                fontWeight: '500', 
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                Field
              </th>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'center',
                fontWeight: '500', 
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                Submitted
              </th>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'center',
                fontWeight: '500', 
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                Extracted
              </th>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'center', 
                fontWeight: '500', 
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(field_results).map(([fieldName, fieldResult], index) => {
              console.log(`Processing field: ${fieldName}`, fieldResult);

              return (
                <tr key={fieldName} style={{
                  backgroundColor: index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)'
                }}>
                  <td style={{ 
                    padding: '1rem', 
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    borderBottom: index === Object.keys(field_results).length - 1 ? 'none' : '1px solid var(--border-light)'
                  }}>
                    {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                  </td>
                  <td style={{ 
                    padding: '1rem',
                    color: 'var(--text-secondary)',
                    borderBottom: index === Object.keys(field_results).length - 1 ? 'none' : '1px solid var(--border-light)'
                  }}>
                    <code style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      {/* FIXED: Use correct property names */}
                      {fieldResult.submitted_value || fieldResult.submitted || 'N/A'}
                    </code>
                  </td>
                  <td style={{ 
                    padding: '1rem',
                    color: 'var(--text-secondary)',
                    borderBottom: index === Object.keys(field_results).length - 1 ? 'none' : '1px solid var(--border-light)'
                  }}>
                    <code style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      {/* FIXED: Use correct property names */}
                      {fieldResult.extracted_value || fieldResult.extracted || 'Not found'}
                    </code>
                  </td>
                  <td style={{ 
                    padding: '1rem',
                    textAlign: 'center',
                    borderBottom: index === Object.keys(field_results).length - 1 ? 'none' : '1px solid var(--border-light)'
                  }}>
                    <StatusBadge 
                      status={fieldResult.status} 
                      score={fieldResult.similarity_score}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Debug Info (can be removed in production) */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
            Debug: Raw Verification Data
          </summary>
          <pre style={{
            fontSize: '0.75rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: '0.5rem',
            overflow: 'auto',
            color: 'var(--text-secondary)'
          }}>
            {JSON.stringify(verificationResult, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default VerificationResults;