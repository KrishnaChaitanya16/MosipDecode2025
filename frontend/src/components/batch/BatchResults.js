import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { styles } from '../../constants/styles';
import FormField from '../common/FormField';
import { englishFields, chineseFields } from '../../constants/fields';

const BatchResults = ({ batchResults, batchErrors, selectedTemplate, onUpdateField }) => {
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [expandedPages, setExpandedPages] = useState(new Set());

  const activeFields = selectedTemplate === 'english' ? englishFields : chineseFields;
  const resultKeys = Object.keys(batchResults);
  const errorKeys = Object.keys(batchErrors);
  
  if (resultKeys.length === 0 && errorKeys.length === 0) return null;

  const toggleFileExpansion = (fileKey) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileKey)) {
        newSet.delete(fileKey);
      } else {
        newSet.add(fileKey);
      }
      return newSet;
    });
  };

  const togglePageExpansion = (pageKey) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageKey)) {
        newSet.delete(pageKey);
      } else {
        newSet.add(pageKey);
      }
      return newSet;
    });
  };

  const exportAllResults = () => {
    const exportData = {
      processed_files: Object.values(batchResults).length,
      failed_files: Object.values(batchErrors).length,
      results: batchResults,
      errors: batchErrors,
      template: selectedTemplate,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_ocr_results_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, ...styles.greenIcon }}>
            <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
          </div>
          <h2 style={styles.cardTitle}>Batch Processing Results</h2>
        </div>
        
        <button
          onClick={exportAllResults}
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          <Download size={16} />
          Export All Results
        </button>
      </div>

      {/* Summary */}
      <div style={{ ...styles.grid, ...styles.grid3, marginBottom: '2rem' }}>
        <div style={{ ...styles.statsCard, ...styles.statsGreen }}>
          <div style={{ ...styles.statsNumber, color: '#16a34a' }}>
            {resultKeys.length}
          </div>
          <div style={{ ...styles.statsLabel, color: '#15803d' }}>
            Successfully Processed
          </div>
        </div>
        <div style={{ ...styles.statsCard, ...styles.statsRed }}>
          <div style={{ ...styles.statsNumber, color: '#dc2626' }}>
            {errorKeys.length}
          </div>
          <div style={{ ...styles.statsLabel, color: '#991b1b' }}>
            Failed to Process
          </div>
        </div>
        <div style={{ ...styles.statsCard, ...styles.statsBlue }}>
          <div style={{ ...styles.statsNumber, color: '#2563eb' }}>
            {Math.round((resultKeys.length / (resultKeys.length + errorKeys.length)) * 100) || 0}%
          </div>
          <div style={{ ...styles.statsLabel, color: '#1d4ed8' }}>
            Success Rate
          </div>
        </div>
      </div>

      {/* Successful Results */}
      {resultKeys.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={16} style={{ color: '#16a34a' }} />
            Processed Files
          </h3>
          
          {resultKeys.map(fileKey => {
            const result = batchResults[fileKey];
            const isExpanded = expandedFiles.has(fileKey);
            
            return (
              <div key={fileKey} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => toggleFileExpansion(fileKey)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f9fafb',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <FileText size={16} />
                    <span>{result.fileName}</span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280',
                      backgroundColor: '#e5e7eb',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px'
                    }}>
                      {result.type === 'multipage' ? `${result.totalPages} pages` : 'single page'}
                    </span>
                  </div>
                  <span style={{ color: '#16a34a', fontSize: '0.75rem' }}>
                    {result.type === 'single' 
                      ? `${Object.values(result.data).filter(v => v).length} fields`
                      : `${result.totalPages} pages processed`
                    }
                  </span>
                </button>

                {isExpanded && (
                  <div style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
                    {result.type === 'single' ? (
                      <div style={{ ...styles.grid, ...styles.grid2 }}>
                        {activeFields.map(field => (
                          <FormField
                            key={`${fileKey}-${field.id}`}
                            field={field}
                            value={result.data[field.id]}
                            confidence={result.confidence?.[field.id]}
                            onChange={(fieldId, value) => onUpdateField && onUpdateField(fileKey, fieldId, value)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div>
                        {Object.keys(result.pages).map(pageNum => {
                          const pageKey = `${fileKey}-page-${pageNum}`;
                          const pageExpanded = expandedPages.has(pageKey);
                          const pageData = result.pages[pageNum];
                          
                          return (
                            <div key={pageKey} style={{ marginBottom: '1rem' }}>
                              <button
                                onClick={() => togglePageExpansion(pageKey)}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: '#f3f4f6',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {pageExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  <span>Page {pageNum}</span>
                                </div>
                                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                                  {Object.values(pageData.data).filter(v => v).length} fields
                                </span>
                              </button>

                              {pageExpanded && (
                                <div style={{ 
                                  marginTop: '0.5rem', 
                                  padding: '0.75rem',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '0.375rem',
                                  backgroundColor: '#fafafa'
                                }}>
                                  <div style={{ ...styles.grid, ...styles.grid2, gap: '0.75rem' }}>
                                    {activeFields.map(field => (
                                      <FormField
                                        key={`${pageKey}-${field.id}`}
                                        field={field}
                                        value={pageData.data[field.id]}
                                        confidence={pageData.confidence?.[field.id]}
                                        onChange={(fieldId, value) => onUpdateField && onUpdateField(fileKey, pageNum, fieldId, value)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Failed Files */}
      {errorKeys.length > 0 && (
        <div>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '500', 
            color: '#374151', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={16} style={{ color: '#dc2626' }} />
            Failed Files
          </h3>
          
          {errorKeys.map(errorKey => {
            const error = batchErrors[errorKey];
            
            return (
              <div key={errorKey} style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} style={{ color: '#dc2626' }} />
                    <span style={{ fontWeight: '500', color: '#991b1b' }}>{error.fileName}</span>
                  </div>
                </div>
                <p style={{ color: '#7f1d1d', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                  {error.error}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BatchResults;
