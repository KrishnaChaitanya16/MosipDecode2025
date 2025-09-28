import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, AlertTriangle, CheckCircle, Edit3, Download, Image as ImageIcon } from 'lucide-react';
import { styles } from '../../constants/styles';
import FormField from '../common/FormField';

const MultiImageResults = ({ 
  multiImageData, 
  currentImageIndex, 
  totalImages,
  onNavigateToImage,
  onNextImage,
  onPrevImage,
  fields,
  onFieldChange,
  processedFiles = []
}) => {
  const [showAllImages, setShowAllImages] = useState(false);
  const [unifiedFormData, setUnifiedFormData] = useState({});
  console.log("Multi Image Data");
  console.log(multiImageData);
  
  // Merge all extracted data into a single form
  useEffect(() => {
    if (!multiImageData || Object.keys(multiImageData).length === 0) return;
    
    let mergedData = {};
    
    // Merge data from all successful images, prioritizing non-empty values
    Object.values(multiImageData).forEach(imageData => {
      if (!imageData.hasError && imageData.extractedData) {
        Object.keys(imageData.extractedData).forEach(fieldId => {
          const value = imageData.extractedData[fieldId];
          if (value && value.trim() && (!mergedData[fieldId] || !mergedData[fieldId].trim())) {
            mergedData[fieldId] = value;
          }
        });
      }
    });
    
    setUnifiedFormData(mergedData);
  }, [multiImageData]);

  if (!multiImageData || Object.keys(multiImageData).length === 0) {
    return null;
  }

  // Calculate summary statistics
  const successfulImages = Object.values(multiImageData).filter(img => !img.hasError).length;
  const failedImages = Object.values(multiImageData).filter(img => img.hasError).length;
  const successRate = Math.round((successfulImages / totalImages) * 100);

  const handleUnifiedFieldChange = (fieldId, value) => {
    setUnifiedFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // Also notify parent component
    if (onFieldChange) {
      onFieldChange(fieldId, value);
    }
  };

  const exportResults = () => {
    const exportData = {
      type: 'multi-image-unified',
      processed_images: totalImages,
      successful_images: successfulImages,
      failed_images: failedImages,
      success_rate: successRate,
      unified_form_data: unifiedFormData,
      source_data: multiImageData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unified_multi_image_results_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, ...styles.greenIcon }}>
            <Edit3 style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
          </div>
          <h2 style={styles.cardTitle}>Unified Form Data (Merged from All Images)</h2>
        </div>
        
        <button
          onClick={exportResults}
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          <Download size={16} />
          Export Results
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ ...styles.grid, ...styles.grid3, marginBottom: '2rem' }}>
        <div style={{ ...styles.statsCard, ...styles.statsGreen }}>
          <div style={{ ...styles.statsNumber, color: '#16a34a' }}>
            {successfulImages}
          </div>
          <div style={{ ...styles.statsLabel, color: '#15803d' }}>
            Successfully Processed
          </div>
        </div>
        <div style={{ ...styles.statsCard, ...styles.statsRed }}>
          <div style={{ ...styles.statsNumber, color: '#dc2626' }}>
            {failedImages}
          </div>
          <div style={{ ...styles.statsLabel, color: '#991b1b' }}>
            Failed to Process
          </div>
        </div>
        <div style={{ ...styles.statsCard, ...styles.statsBlue }}>
          <div style={{ ...styles.statsNumber, color: '#2563eb' }}>
            {successRate}%
          </div>
          <div style={{ ...styles.statsLabel, color: '#1d4ed8' }}>
            Success Rate
          </div>
        </div>
      </div>

      {/* Field summary */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem'
        }}>
          <CheckCircle size={14} />
          <span>
            <strong>{Object.values(unifiedFormData).filter(v => v && v.trim()).length}</strong> of{' '}
            <strong>{fields.length}</strong> fields populated from {successfulImages} processed images
          </span>
        </div>
      </div>

      {/* Unified form fields */}
      <div style={{ ...styles.grid, ...styles.grid2, gap: '1rem', marginBottom: '2rem' }}>
        {fields.map(field => (
          <FormField
            key={field.id}
            field={field}
            value={unifiedFormData[field.id] || ''}
            confidence={null} // We lose individual confidence scores in merged data
            onChange={handleUnifiedFieldChange}
          />
        ))}
      </div>

      {/* Toggle to show all images overview */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => setShowAllImages(!showAllImages)}
          style={{
            ...styles.button,
            ...styles.secondaryButton,
            width: '100%',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}
        >
          <ImageIcon size={16} />
          {showAllImages ? 'Hide Source Images Overview' : 'Show Source Images Overview'}
        </button>

        {showAllImages && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-light)'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '500',
              color: 'var(--text-primary)',
              marginBottom: '1rem'
            }}>
              Source Images Overview
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              fontStyle: 'italic'
            }}>
              The form above contains merged data from all these source images. Fields are auto-populated with the best available data.
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '0.75rem' 
            }}>
              {Object.keys(multiImageData).map((imageKey, index) => {
                const imageData = multiImageData[imageKey];
                const fieldsCount = imageData.hasError 
                  ? 0 
                  : Object.values(imageData.extractedData || {}).filter(v => v).length;
                
                return (
                  <div
                    key={imageKey}
                    style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '0.25rem',
                      backgroundColor: imageData.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      border: `1px solid ${imageData.hasError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                      borderRadius: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                      <span style={{ fontWeight: '500', flex: 1 }}>
                        Image {index + 1}
                      </span>
                      {imageData.hasError ? (
                        <AlertTriangle size={12} style={{ color: '#dc2626' }} />
                      ) : (
                        <CheckCircle size={12} style={{ color: '#16a34a' }} />
                      )}
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      opacity: 0.8,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      color: imageData.hasError ? '#991b1b' : '#15803d'
                    }}>
                      {imageData.hasError 
                        ? `Processing failed: ${imageData.error}`
                        : `${fieldsCount} fields extracted • ${imageData.fileName}`
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiImageResults;