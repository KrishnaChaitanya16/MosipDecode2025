import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, AlertTriangle, CheckCircle, Edit3, Download, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { styles } from '../../constants/styles';
import FormField from '../common/FormField';

const UnifiedResultsComponent = ({ 
  // Single image data
  singlePageData = null,
  // Multi-image data
  multiImageData = null, 
  currentImageIndex = 0, 
  totalImages = 0,
  onNavigateToImage = () => {},
  onNextImage = () => {},
  onPrevImage = () => {},
  // PDF data
  multipageData = null,
  // Common props
  fields = [],
  onFieldChange = () => {},
  type = 'single' // 'single', 'multi-image', 'pdf'
}) => {
  const [unifiedFormData, setUnifiedFormData] = useState({});
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  // Merge all extracted data into a single form
  useEffect(() => {
    let mergedData = {};
    
    if (type === 'single' && singlePageData?.extractedData) {
      mergedData = { ...singlePageData.extractedData };
    } else if (type === 'multi-image' && multiImageData) {
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
    } else if (type === 'pdf' && multipageData) {
      // Similar logic for PDF pages
      if (multipageData.pages) {
        Object.values(multipageData.pages).forEach(pageData => {
          if (pageData.data) {
            Object.keys(pageData.data).forEach(fieldId => {
              const value = pageData.data[fieldId];
              if (value && value.trim() && (!mergedData[fieldId] || !mergedData[fieldId].trim())) {
                mergedData[fieldId] = value;
              }
            });
          }
        });
      }
    }
    
    setUnifiedFormData(mergedData);
  }, [singlePageData, multiImageData, multipageData, type]);

  // Get current overlay image based on type and index
  const getCurrentOverlayData = () => {
    if (type === 'single' && singlePageData) {
      return {
        overlayImage: singlePageData.overlayImage,
        fileName: 'Uploaded Image',
        detectionCount: singlePageData.detections?.length || 0
      };
    } else if (type === 'multi-image' && multiImageData) {
      // For multi-image, use the key format that matches how data is stored
      const imageKeys = Object.keys(multiImageData).sort();
      if (currentViewIndex < imageKeys.length) {
        const imageKey = imageKeys[currentViewIndex];
        const imageData = multiImageData[imageKey];
        if (imageData && !imageData.hasError) {
          return {
            overlayImage: imageData.overlayImage,
            fileName: imageData.fileName,
            detectionCount: imageData.detections?.length || 0
          };
        }
      }
    } else if (type === 'pdf' && multipageData) {
      // For PDF processed as images, check if data is stored in multiImageData format
      // This happens when processMultipagePdfAsImages stores results in multiImageData
      if (multiImageData) {
        const pageKeys = Object.keys(multiImageData).sort();
        if (currentViewIndex < pageKeys.length) {
          const pageKey = pageKeys[currentViewIndex];
          const pageData = multiImageData[pageKey];
          if (pageData && !pageData.hasError) {
            return {
              overlayImage: pageData.overlayImage,
              fileName: pageData.fileName,
              detectionCount: pageData.detections?.length || 0
            };
          }
        }
      }
    }
    return null;
  };

  const handleFieldChange = (fieldId, value) => {
    setUnifiedFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    onFieldChange(fieldId, value);
  };

  const exportResults = () => {
    const exportData = {
      type,
      unified_form_data: unifiedFormData,
      timestamp: new Date().toISOString()
    };
    
    if (type === 'multi-image') {
      exportData.source_images = Object.values(multiImageData || {}).map(img => ({
        fileName: img.fileName,
        hasError: img.hasError,
        extractedData: img.extractedData
      }));
    } else if (type === 'pdf' && multiImageData) {
      // For PDF processed as images
      exportData.source_pages = Object.values(multiImageData || {}).map(page => ({
        fileName: page.fileName,
        hasError: page.hasError,
        extractedData: page.extractedData
      }));
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_results_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentOverlayData = getCurrentOverlayData();
  const hasOverlay = currentOverlayData?.overlayImage;

  // Calculate stats for multi-image or PDF
  const getStats = () => {
    let dataSource = null;
    let total = 0;
    let successful = 0;
    let failed = 0;

    if (type === 'multi-image' && multiImageData) {
      dataSource = multiImageData;
    } else if (type === 'pdf' && multiImageData) {
      // For PDF processed as images
      dataSource = multiImageData;
    }

    if (dataSource) {
      total = Object.keys(dataSource).length;
      successful = Object.values(dataSource).filter(item => !item.hasError).length;
      failed = total - successful;
    }
    
    return total > 0 ? { 
      total, 
      successful, 
      failed, 
      successRate: Math.round((successful / total) * 100) 
    } : null;
  };

  const stats = getStats();

  // Get total items for navigation
  const getTotalItems = () => {
    if (type === 'single') return 1;
    if (type === 'multi-image' && multiImageData) return Object.keys(multiImageData).length;
    if (type === 'pdf' && multiImageData) return Object.keys(multiImageData).length;
    return 0;
  };

  const totalItems = getTotalItems();
  const showNavigation = totalItems > 1;

  return (
    <div style={styles.resultsGrid}>
      {/* Confidence Overlay Panel */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
            {type === 'multi-image' ? <ImageIcon style={{ color: '#7c3aed' }} /> : <Eye style={{ color: '#7c3aed' }} />}
          </div>
          <h2 style={styles.cardTitle}>
            {type === 'multi-image' 
              ? 'OCR Confidence Zones - Multi Image' 
              : type === 'pdf' 
                ? 'OCR Confidence Zones - PDF Pages'
                : 'OCR Confidence Zones'}
          </h2>
          
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              marginLeft: 'auto',
              fontSize: '0.875rem',
              padding: '0.5rem 1rem'
            }}
          >
            {showOverlay ? <EyeOff size={16} /> : <Eye size={16} />}
            {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
          </button>
        </div>

        {/* Stats for multi-image or PDF */}
        {stats && (
          <div style={{ ...styles.grid, ...styles.grid3, marginBottom: '1rem' }}>
            <div style={{ ...styles.statsCard, ...styles.statsGreen }}>
              <div style={{ ...styles.statsNumber, color: '#16a34a', fontSize: '1.5rem' }}>
                {stats.successful}
              </div>
              <div style={{ ...styles.statsLabel, color: '#15803d', fontSize: '0.75rem' }}>
                Successful
              </div>
            </div>
            <div style={{ ...styles.statsCard, ...styles.statsRed }}>
              <div style={{ ...styles.statsNumber, color: '#dc2626', fontSize: '1.5rem' }}>
                {stats.failed}
              </div>
              <div style={{ ...styles.statsLabel, color: '#991b1b', fontSize: '0.75rem' }}>
                Failed
              </div>
            </div>
            <div style={{ ...styles.statsCard, ...styles.statsBlue }}>
              <div style={{ ...styles.statsNumber, color: '#2563eb', fontSize: '1.5rem' }}>
                {stats.successRate}%
              </div>
              <div style={{ ...styles.statsLabel, color: '#1d4ed8', fontSize: '0.75rem' }}>
                Success Rate
              </div>
            </div>
          </div>
        )}

        {/* Navigation for multi-image or PDF */}
        {showNavigation && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-light)'
          }}>
            <button
              onClick={() => {
                const newIndex = Math.max(0, currentViewIndex - 1);
                setCurrentViewIndex(newIndex);
                onNavigateToImage(newIndex);
              }}
              disabled={currentViewIndex === 0}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                padding: '0.5rem',
                opacity: currentViewIndex === 0 ? 0.5 : 1,
                cursor: currentViewIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ 
                color: 'var(--text-primary)', 
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {type === 'pdf' 
                  ? `Viewing Page ${currentViewIndex + 1} of ${totalItems}`
                  : `Viewing Image ${currentViewIndex + 1} of ${totalItems}`
                }
              </span>
              <span style={{ 
                color: 'var(--text-tertiary)', 
                fontSize: '0.75rem'
              }}>
                {currentOverlayData?.fileName || 'Unknown'}
              </span>
            </div>
            
            <button
              onClick={() => {
                const newIndex = Math.min(totalItems - 1, currentViewIndex + 1);
                setCurrentViewIndex(newIndex);
                onNavigateToImage(newIndex);
              }}
              disabled={currentViewIndex === totalItems - 1}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                padding: '0.5rem',
                opacity: currentViewIndex === totalItems - 1 ? 0.5 : 1,
                cursor: currentViewIndex === totalItems - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Current image info */}
        {currentOverlayData && (
          <div style={{
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} style={{ color: '#7c3aed' }} />
              <span style={{ color: '#6b46c1', fontWeight: '500', fontSize: '0.875rem' }}>
                {currentOverlayData.fileName}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#6b46c1', fontSize: '0.75rem' }}>
                {currentOverlayData.detectionCount} detections
              </span>
              {hasOverlay ? (
                <CheckCircle size={14} style={{ color: '#16a34a' }} />
              ) : (
                <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
              )}
            </div>
          </div>
        )}

        {/* Image display area */}
        <div style={{
          position: 'relative',
          maxWidth: '100%',
          maxHeight: '600px',
          overflow: 'hidden',
          borderRadius: '0.5rem',
          border: '1px solid var(--border-medium)',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          {hasOverlay && showOverlay ? (
            <img
              src={`data:image/jpeg;base64,${currentOverlayData.overlayImage}`}
              alt={`OCR confidence overlay`}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                maxHeight: '600px',
                objectFit: 'contain'
              }}
            />
          ) : (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'var(--text-tertiary)'
            }}>
              <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {hasOverlay 
                  ? 'Confidence overlay hidden - click "Show Overlay" to view'
                  : 'No confidence overlay available'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Unified Form Panel */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconWrapper, ...styles.greenIcon }}>
              <Edit3 style={{ width: '1.25rem', height: '1.25rem', color: '#16a34a' }} />
            </div>
            <h2 style={styles.cardTitle}>
              {type === 'multi-image' 
                ? 'Unified Form Data (Merged from All Images)' 
                : type === 'pdf'
                  ? 'Unified Form Data (Merged from All Pages)'
                  : 'Extracted Form Data'}
            </h2>
          </div>
          
          <button
            onClick={exportResults}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            <Download size={16} />
            Export Results
          </button>
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
              <strong>{fields.length}</strong> fields populated
              {type === 'multi-image' && ' (merged from multiple images)'}
              {type === 'pdf' && ' (merged from multiple pages)'}
            </span>
          </div>
        </div>

        {/* Unified form fields */}
        <div style={{ ...styles.grid, ...styles.grid2, gap: '1rem' }}>
          {fields.map(field => (
            <FormField
              key={field.id}
              field={field}
              value={unifiedFormData[field.id] || ''}
              confidence={null} // We lose individual confidence scores in merged data
              onChange={handleFieldChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnifiedResultsComponent;