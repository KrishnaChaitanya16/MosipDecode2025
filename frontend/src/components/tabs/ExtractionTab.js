import React from 'react';
import { FileText, Edit3, Camera, Eye, RotateCcw, Download, CheckCircle } from 'lucide-react';
import { styles } from '../../constants/styles';
import { englishFields, chineseFields } from '../../constants/fields';
import FileUploadArea from '../upload/FileUploadArea';
import ErrorDisplay from '../common/ErrorDisplay';
import FormField from '../common/FormField';

const ExtractionTab = ({
  uploadedFile,
  onFileUpload,
  onCameraCapture,
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
  onFieldChange
}) => {
  const activeFields = selectedTemplate === 'english' ? englishFields : chineseFields;
  
  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, ...styles.blueIcon }}>
            <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
          </div>
          <h2 style={styles.cardTitle}>Document Upload</h2>
        </div>
        
        <FileUploadArea 
          onFileUpload={onFileUpload} 
          uploadedFile={uploadedFile}
          onCameraCapture={onCameraCapture}
        />
        
        {uploadedFile && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => onExtract(uploadedFile)} 
              disabled={isExtracting} 
              style={{ 
                ...styles.button, 
                ...styles.primaryButton, 
                opacity: isExtracting ? 0.8 : 1 
              }}
            >
              <Camera size={16} />
              {isExtracting ? 'Extracting…' : 'Extract Text'}
            </button>
            <button style={{ ...styles.button, ...styles.secondaryButton }}>
              <Eye size={16} />
              Preview
            </button>
          </div>
        )}
        
        <ErrorDisplay
          error={extractError}
          errorDetails={errorDetails}
          onRetry={() => onRetryExtraction(uploadedFile)}
          onDismiss={onDismissError}
          isRetrying={isExtracting}
        />
      </div>

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
  );
};

export default ExtractionTab;
