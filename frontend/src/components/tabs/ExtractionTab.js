import React from 'react';
import { FileText, Edit3, Camera, Eye, RotateCcw, Download, CheckCircle, Layers, Users } from 'lucide-react';
import { styles } from '../../constants/styles';
import { englishFields, chineseFields } from '../../constants/fields';
import FileUploadArea from '../upload/FileUploadArea';
import ErrorDisplay from '../common/ErrorDisplay';
import FormField from '../common/FormField';
import MultipageExtraction from '../multipage/MultipageExtraction';
import BatchResults from '../batch/BatchResults';

const ExtractionTab = ({
  uploadedFiles,
  onFileUpload,
  onCameraCapture,
  onRemoveFile,
  onExtract,
  isExtracting,
  extractError,
  errorDetails,
  onRetryExtraction,
  onDismissError,
  extractedData,
  confidenceData,
  selectedTemplate,
  onTemplateChange,
  onFieldChange,
  // Multipage props
  multipageData,
  currentPage,
  totalPages,
  pageConfidenceData,
  isExtractingMultipage,
  multipageError,
  multipageErrorDetails,
  onMultipageExtract,
  onRetryMultipage,
  onDismissMultipageError,
  onGoToPage,
  onNextPage,
  onPrevPage,
  onUpdatePageField,
  // Batch processing props
  batchResults,
  batchProgress,
  isBatchProcessing,
  batchErrors,
  currentlyProcessing,
  onBatchProcess,
  onClearBatchResults,
  onUpdateBatchField
}) => {
  const activeFields = selectedTemplate === 'english' ? englishFields : chineseFields;
  const hasExtractedData = Object.keys(extractedData).length > 0 && Object.values(extractedData).some(value => value !== null && value !== '' && value !== undefined);
  const hasMultipageData = Object.keys(multipageData).length > 0;
  const hasBatchResults = Object.keys(batchResults).length > 0 || Object.keys(batchErrors).length > 0;
  
  // Show single page results only when not extracting and has data and no multipage/batch data
  const showSinglePageResults = !isExtracting && hasExtractedData && !hasMultipageData && !hasBatchResults;
  
  // Determine if we should show batch mode
  const isBatchMode = uploadedFiles.length > 1;
  const firstFile = uploadedFiles.length > 0 ? uploadedFiles[0] : null;

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, ...styles.blueIcon }}>
            <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
          </div>
          <h2 style={styles.cardTitle}>Document Upload</h2>
          {isBatchMode && (
            <div style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Users size={12} />
              Batch Mode
            </div>
          )}
        </div>
        
        <FileUploadArea 
          onFileUpload={onFileUpload}
          uploadedFiles={uploadedFiles}
          onCameraCapture={onCameraCapture}
          onRemoveFile={onRemoveFile}
          allowMultiple={true}
        />
        
        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            {isBatchMode ? (
              // Batch Processing Controls
              <div>
                <div style={{ 
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ 
                    margin: 0, 
                    marginBottom: '0.5rem',
                    color: '#1e40af',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Batch Processing Mode
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#1d4ed8',
                    fontSize: '0.75rem'
                  }}>
                    {uploadedFiles.length} files selected. Choose processing type below.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => onBatchProcess(uploadedFiles, false)}
                    disabled={isBatchProcessing}
                    style={{ 
                      ...styles.button, 
                      ...styles.primaryButton,
                      opacity: isBatchProcessing ? 0.8 : 1
                    }}
                  >
                    <Users size={16} />
                    {isBatchProcessing ? 'Processing Batch...' : 'Process as Single Pages'}
                  </button>

                  <button 
                    onClick={() => onBatchProcess(uploadedFiles, true)}
                    disabled={isBatchProcessing}
                    style={{ 
                      ...styles.button, 
                      ...styles.purpleButton,
                      opacity: isBatchProcessing ? 0.8 : 1
                    }}
                  >
                    <Layers size={16} />
                    {isBatchProcessing ? 'Processing Multipage...' : 'Process as Multipage'}
                  </button>

                  {hasBatchResults && (
                    <button
                      onClick={onClearBatchResults}
                      style={{ ...styles.button, ...styles.secondaryButton }}
                    >
                      Clear Results
                    </button>
                  )}
                </div>

                {/* Batch Processing Progress */}
                {isBatchProcessing && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '0.5rem',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0369a1' }}>
                        Processing Files...
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>
                        {batchProgress.processed} / {batchProgress.total}
                      </span>
                    </div>
                    
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e0f2fe',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        width: `${(batchProgress.processed / batchProgress.total) * 100}%`,
                        height: '100%',
                        backgroundColor: '#0ea5e9',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    
                    {currentlyProcessing && (
                      <p style={{ 
                        margin: 0, 
                        fontSize: '0.75rem', 
                        color: '#0369a1' 
                      }}>
                        Currently processing: {currentlyProcessing}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Single File Controls
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => onExtract(firstFile)} 
                  disabled={isExtracting || isExtractingMultipage} 
                  style={{ 
                    ...styles.button, 
                    ...styles.primaryButton, 
                    opacity: (isExtracting || isExtractingMultipage) ? 0.8 : 1 
                  }}
                >
                  <Camera size={16} />
                  {isExtracting ? 'Extracting…' : 'Extract Text (Single Page)'}
                </button>

                <button 
                  onClick={() => onMultipageExtract(firstFile)} 
                  disabled={isExtracting || isExtractingMultipage} 
                  style={{ 
                    ...styles.button, 
                    ...styles.purpleButton, 
                    opacity: (isExtracting || isExtractingMultipage) ? 0.8 : 1 
                  }}
                >
                  <Layers size={16} />
                  {isExtractingMultipage ? 'Processing Pages…' : 'Extract Multipage'}
                </button>

                <button style={{ ...styles.button, ...styles.secondaryButton }}>
                  <Eye size={16} />
                  Preview
                </button>
              </div>
            )}
          </div>
        )}
        
        <ErrorDisplay
          error={extractError}
          errorDetails={errorDetails}
          onRetry={() => onRetryExtraction(firstFile)}
          onDismiss={onDismissError}
          isRetrying={isExtracting}
        />
      </div>

      {/* Batch Results */}
      {hasBatchResults && (
        <BatchResults
          batchResults={batchResults}
          batchErrors={batchErrors}
          selectedTemplate={selectedTemplate}
          onUpdateField={onUpdateBatchField}
        />
      )}

      {/* Single Page Extracted Form Data */}
      <div style={{
        maxHeight: showSinglePageResults ? '2000px' : '0px',
        opacity: showSinglePageResults ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: showSinglePageResults ? 'translateY(0)' : 'translateY(-20px)',
        marginTop: showSinglePageResults ? '2rem' : '0'
      }}>
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, ...styles.greenIcon }}>
                <Edit3 style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
              </div>
              <h2 style={styles.cardTitle}>Extracted Form Data</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={selectedTemplate}
                onChange={(e) => onTemplateChange(e.target.value)}
                style={{ ...styles.input, width: 'auto' }}
              >
                <option value="english">English Template</option>
                <option value="chinese">中文模板</option>
              </select>
              <button style={{ ...styles.button, ...styles.secondaryButton }}>
                <RotateCcw size={14} />
                Re-extract
              </button>
              <button style={{ ...styles.button, ...styles.primaryButton }}>
                <Download size={14} />
                Export Data
              </button>
            </div>
          </div>
          
          <div style={{ ...styles.grid, ...styles.grid2 }}>
            {activeFields.map(field => (
              <FormField
                key={field.id}
                field={field}
                value={extractedData[field.id]}
                confidence={confidenceData[field.id]}
                onChange={onFieldChange}
              />
            ))}
          </div>

          <div style={styles.summary}>
            <div style={styles.summaryHeader}>
              <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
              <span style={styles.summaryTitle}>Extraction Summary</span>
            </div>
            <div style={styles.summaryGrid}>
              <div>
                <span style={styles.summaryLabel}>Fields Extracted:</span>
                <span style={styles.summaryValue}>
                  {Object.keys(extractedData).filter(key => extractedData[key] !== null && extractedData[key] !== '').length}/
                  {activeFields.length}
                </span>
              </div>
              {Object.keys(confidenceData).length > 0 && (
                <div>
                  <span style={styles.summaryLabel}>Avg Confidence:</span>
                  <span style={{ 
                    ...styles.summaryValue, 
                    color: Object.values(confidenceData).filter(c => c !== null).length > 0 
                      ? (Object.values(confidenceData).filter(c => c !== null).reduce((a, b) => a + b, 0) / Object.values(confidenceData).filter(c => c !== null).length) > 0.8 
                        ? '#16a34a' 
                        : (Object.values(confidenceData).filter(c => c !== null).reduce((a, b) => a + b, 0) / Object.values(confidenceData).filter(c => c !== null).length) > 0.6 
                          ? '#d97706' 
                          : '#dc2626'
                      : '#6b7280'
                  }}>
                    {Object.values(confidenceData).filter(c => c !== null).length > 0 
                      ? Math.round((Object.values(confidenceData).filter(c => c !== null).reduce((a, b) => a + b, 0) / Object.values(confidenceData).filter(c => c !== null).length) * 100) + '%'
                      : 'N/A'
                    }
                  </span>
                </div>
              )}
              <div>
                <span style={styles.summaryLabel}>Processing Time:</span>
                <span style={styles.summaryValue}>2.3s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multipage Extraction Results */}
      <MultipageExtraction
        multipageData={multipageData}
        currentPage={currentPage}
        totalPages={totalPages}
        pageConfidenceData={pageConfidenceData}
        isExtractingMultipage={isExtractingMultipage}
        multipageError={multipageError}
        multipageErrorDetails={multipageErrorDetails}
        onRetryMultipage={onRetryMultipage}
        onDismissMultipageError={onDismissMultipageError}
        selectedTemplate={selectedTemplate}
        onGoToPage={onGoToPage}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        onUpdatePageField={onUpdatePageField}
        uploadedFile={firstFile}
      />
    </div>
  );
};

export default ExtractionTab;
