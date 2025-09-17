import React from 'react';
import { FileText, Layers, AlertCircle } from 'lucide-react';
import { styles } from '../../constants/styles';
import { englishFields, chineseFields } from '../../constants/fields';
import FormField from '../common/FormField';
import ErrorDisplay from '../common/ErrorDisplay';
import PageNavigation from './PageNavigation';

const MultipageExtraction = ({
  multipageData,
  currentPage,
  totalPages,
  pageConfidenceData,
  isExtractingMultipage,
  multipageError,
  multipageErrorDetails,
  onRetryMultipage,
  onDismissMultipageError,
  selectedTemplate,
  onGoToPage,
  onNextPage,
  onPrevPage,
  onUpdatePageField,
  uploadedFile
}) => {
  const activeFields = selectedTemplate === 'english' ? englishFields : chineseFields;
  const currentPageData = multipageData[currentPage] || {};
  const currentPageConfidence = pageConfidenceData[currentPage] || {};
  const hasMultipageData = Object.keys(multipageData).length > 0;

  if (!hasMultipageData) return null;

  return (
    <div style={{
      ...styles.card,
      marginTop: '2rem'
    }}>
      <div style={styles.cardHeader}>
        <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
          <Layers style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} />
        </div>
        <h2 style={styles.cardTitle}>Multipage Extraction Results</h2>
      </div>

      {/* Error Display */}
      <ErrorDisplay
        error={multipageError}
        errorDetails={multipageErrorDetails}
        onRetry={() => onRetryMultipage(uploadedFile)}
        onDismiss={onDismissMultipageError}
        isRetrying={isExtractingMultipage}
      />

      {/* Page Navigation */}
      <PageNavigation
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onGoToPage}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
      />

      {/* Current Page Info */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <FileText size={16} style={{ color: '#2563eb' }} />
        <span style={{ color: '#1e40af', fontWeight: '500', fontSize: '0.875rem' }}>
          Viewing Page {currentPage} - {Object.keys(currentPageData).filter(key => 
            currentPageData[key] !== null && currentPageData[key] !== '').length} fields extracted
        </span>
      </div>

      {/* Current Page Fields */}
      <div style={{ ...styles.grid, ...styles.grid2 }}>
        {activeFields.map(field => (
          <FormField
            key={`page-${currentPage}-${field.id}`}
            field={field}
            value={currentPageData[field.id]}
            confidence={currentPageConfidence[field.id]}
            onChange={(fieldId, value) => onUpdatePageField(currentPage, fieldId, value)}
          />
        ))}
      </div>

      {/* Page Summary */}
      <div style={{
        ...styles.summary,
        marginTop: '1.5rem'
      }}>
        <div style={styles.summaryHeader}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
          <span style={styles.summaryTitle}>Page {currentPage} Summary</span>
        </div>
        <div style={styles.summaryGrid}>
          <div>
            <span style={styles.summaryLabel}>Fields Extracted:</span>
            <span style={styles.summaryValue}>
              {Object.keys(currentPageData).filter(key => 
                currentPageData[key] !== null && currentPageData[key] !== '').length}/
              {activeFields.length}
            </span>
          </div>
          {Object.keys(currentPageConfidence).length > 0 && (
            <div>
              <span style={styles.summaryLabel}>Avg Confidence:</span>
              <span style={{ 
                ...styles.summaryValue,
                color: Object.values(currentPageConfidence).filter(c => c !== null).length > 0 
                  ? (Object.values(currentPageConfidence).filter(c => c !== null).reduce((a, b) => a + b, 0) / Object.values(currentPageConfidence).filter(c => c !== null).length) > 0.8 
                    ? '#16a34a' 
                    : (Object.values(currentPageConfidence).filter(c => c !== null).reduce((a, b) => a + b, 0) / Object.values(currentPageConfidence).filter(c => c !== null).length) > 0.6 
                      ? '#d97706' 
                      : '#dc2626'
                  : '#6b7280'
              }}>
                {Object.values(currentPageConfidence).filter(c => c !== null).length > 0 
                  ? Math.round((Object.values(currentPageConfidence).filter(c => c !== null).reduce((a, b) => a + b, 0) / Object.values(currentPageConfidence).filter(c => c !== null).length) * 100) + '%'
                  : 'N/A'
                }
              </span>
            </div>
          )}
          <div>
            <span style={styles.summaryLabel}>Total Pages:</span>
            <span style={styles.summaryValue}>{totalPages}</span>
          </div>
        </div>
      </div>

      {/* All Pages Overview */}
      {totalPages > 1 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            All Pages Overview
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.keys(multipageData).map(pageNum => {
              const pageData = multipageData[pageNum];
              const fieldsCount = Object.keys(pageData).filter(key => 
                pageData[key] !== null && pageData[key] !== '').length;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onGoToPage(parseInt(pageNum))}
                  style={{
                    ...styles.button,
                    ...(parseInt(pageNum) === currentPage ? styles.primaryButton : styles.secondaryButton),
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem'
                  }}
                >
                  Page {pageNum} ({fieldsCount} fields)
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipageExtraction;
