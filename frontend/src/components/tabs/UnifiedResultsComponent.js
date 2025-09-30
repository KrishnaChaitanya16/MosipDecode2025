import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, AlertTriangle, CheckCircle, Edit3, Download, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { styles } from '../../constants/styles';
import FormField from '../common/FormField';
import * as XLSX from 'xlsx';

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
    // Prepare data for Excel export
    const exportData = [];
    
    // Add header and data rows
    fields.forEach(field => {
      exportData.push({
        'Field Name': field.label || field.id,
        'Extracted Value': unifiedFormData[field.id] || ''
      });
    });

    // Add metadata sheet data
    const metadataSheet = [{
      'Export Type': type,
      'Export Date': new Date().toISOString(),
      'Total Fields': fields.length,
      'Filled Fields': Object.values(unifiedFormData).filter(v => v && v.trim()).length
    }];

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add main data sheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
    
    // Add metadata sheet
    const wsMetadata = XLSX.utils.json_to_sheet(metadataSheet);
    XLSX.utils.book_append_sheet(wb, wsMetadata, 'Metadata');

    // If multi-image or PDF, add source information
    if (type === 'multi-image' && multiImageData) {
      const sourceData = Object.values(multiImageData).map((img, idx) => ({
        'Image #': idx + 1,
        'File Name': img.fileName,
        'Status': img.hasError ? 'Failed' : 'Success',
        'Fields Extracted': img.extractedData ? Object.keys(img.extractedData).length : 0
      }));
      const wsSource = XLSX.utils.json_to_sheet(sourceData);
      XLSX.utils.book_append_sheet(wb, wsSource, 'Source Images');
    } else if (type === 'pdf' && multiImageData) {
      const sourceData = Object.values(multiImageData).map((page, idx) => ({
        'Page #': idx + 1,
        'File Name': page.fileName,
        'Status': page.hasError ? 'Failed' : 'Success',
        'Fields Extracted': page.extractedData ? Object.keys(page.extractedData).length : 0
      }));
      const wsSource = XLSX.utils.json_to_sheet(sourceData);
      XLSX.utils.book_append_sheet(wb, wsSource, 'Source Pages');
    }

    // Generate Excel file
    XLSX.writeFile(wb, `ocr_results_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          <h3 style={styles.cardTitle}>
            {type === 'multi-image' 
              ? 'OCR Confidence Zones - Multi Image' 
              : type === 'pdf' 
                ? 'OCR Confidence Zones - PDF Pages'
                : 'OCR Confidence Zones'}
          </h3>
        </div>

        {/* Navigation for multi-image or PDF */}
        {showNavigation && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '0.75rem',
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <h3 style={styles.cardTitle}>
            Extracted Data
          </h3>
          
          <button
            onClick={exportResults}
            style={{ 
              ...styles.button, 
              ...styles.primaryButton,
              marginLeft: '1rem',
              flexShrink: 0
            }}
          >
            <Download size={16} />
            Export to Excel
          </button>
        </div>

        {/* Unified form fields - Inline Layout */}
        {/* Unified form fields - Horizontal Layout matching DataEntryForm */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-xs)' 
        }}>
          {fields.map(field => (
            <div key={field.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              marginBottom: 'var(--space-sm)',
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                minWidth: '80px',
                textAlign: 'left',
                marginBottom: 0
              }}>
                {field.label || field.id}:
              </label>
              <input
                type={field.type || 'text'}
                value={unifiedFormData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={`Enter ${field.label || field.id}`}
                style={{
                  flex: 1,
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-family)',
                  transition: 'all var(--transition-fast)',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-medium)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnifiedResultsComponent;