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

      {/* Field Results Table - WITHOUT Confidence Column */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '0.875rem'
        }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'left', 
                fontWeight: '500', 
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Field
              </th>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'left', 
                fontWeight: '500', 
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Submitted
              </th>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'left', 
                fontWeight: '500', 
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Extracted
              </th>
              <th style={{ 
                padding: '0.75rem 1rem', 
                textAlign: 'center', 
                fontWeight: '500', 
                color: '#374151',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(field_results).map(([fieldName, fieldResult], index) => (
              <tr key={fieldName} style={{
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
              }}>
                <td style={{ 
                  padding: '1rem', 
                  fontWeight: '500',
                  color: '#374151',
                  borderBottom: index === Object.keys(field_results).length - 1 ? 'none' : '1px solid #e5e7eb'
                }}>
                  {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                </td>
                <td style={{ 
                  padding: '1rem',
                  color: '#6b7280',
                  borderBottom: index === Object.keys(field_results).length - 1 ? 'none' : '1px solid #e5e7eb'
                }}>
                  <code style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}>
                    {fieldResult.submitted}
                  </code>
                </td>
                <td style={{ 
                  padding: '1rem',
                  color: '#6b7280',
                  borderBottom: index === Object.keys(field_results).length - 1 ? 'none' : '1px solid #e5e7eb'
                }}>
                  <code style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}>
                    {fieldResult.extracted}
                  </code>
                </td>
                <td style={{ 
                  padding: '1rem',
                  textAlign: 'center',
                  borderBottom: index === Object.keys(field_results).length - 1 ? 'none' : '1px solid #e5e7eb'
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
