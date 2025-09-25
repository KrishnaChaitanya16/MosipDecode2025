import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { styles } from '../../constants/styles';

const StatusBadge = ({ status, score }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'MATCH':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534',
          border: '1px solid #bbf7d0'
        };
      case 'MISMATCH':
        return {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fecaca'
        };
      case 'NOT_FOUND':
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
    switch (status) {
      case 'MATCH':
        return <CheckCircle size={14} />;
      case 'MISMATCH':
        return <XCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
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
      {status}
      {score && ` (${Math.round(score * 100)}%)`}
    </span>
  );
};

const VerificationResults = ({ verificationResult }) => {
  if (!verificationResult) return null;

  const { verification_summary, field_results } = verificationResult;

  return (
    <div>
      {/* Summary Stats */}

      {/* Field Results Table - Dark Mode Compatible with Centered Headers */}
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
                textAlign: 'center', // Centered header
                fontWeight: '500', 
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                Field
              </th>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'center', // Centered header
                fontWeight: '500', 
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                Submitted
              </th>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'center', // Centered header
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
            {Object.entries(field_results).map(([fieldName, fieldResult], index) => (
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
                    {fieldResult.submitted}
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
                    {fieldResult.extracted}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerificationResults;
