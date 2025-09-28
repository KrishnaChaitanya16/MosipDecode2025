import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, FileText, AlertTriangle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { styles } from '../../constants/styles';

const EnhancedConfidenceOverlay = ({ 
  imageData = null, // Single image data
  multiImageData = null, // Multi-image data
  currentIndex = 0, 
  onNavigate = () => {}, 
  totalImages = 1,
  type = 'single' // 'single', 'multi-image', 'pdf'
}) => {
  const [showOverlay, setShowOverlay] = useState(true);
  
  // Determine current data based on type
  let currentData = null;
  let hasOverlay = false;
  let detectionCount = 0;
  let fileName = '';
  
  if (type === 'single' && imageData) {
    currentData = imageData;
    hasOverlay = !!imageData.overlayImage;
    detectionCount = imageData.detections ? imageData.detections.length : 0;
    fileName = 'Uploaded Image';
  } else if (type === 'multi-image' && multiImageData) {
    const imageKey = `image_${currentIndex}`;
    currentData = multiImageData[imageKey];
    if (currentData && !currentData.hasError) {
      hasOverlay = !!currentData.overlayImage;
      detectionCount = currentData.detections ? currentData.detections.length : 0;
      fileName = currentData.fileName || `Image ${currentIndex + 1}`;
    }
  }

  if (!currentData) {
    return (
      <div style={styles.card}>
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: 'var(--text-tertiary)' 
        }}>
          No image data available
        </div>
      </div>
    );
  }

  // Handle error state
  if (currentData.hasError) {
    return (
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, ...styles.redIcon }}>
            <AlertTriangle style={{ color: '#dc2626' }} />
          </div>
          <h2 style={styles.cardTitle}>Processing Error</h2>
        </div>
        
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <AlertTriangle size={16} style={{ color: '#dc2626' }} />
            <span style={{ fontWeight: '500', color: '#dc2626' }}>
              {fileName}
            </span>
          </div>
          <p style={{ color: '#991b1b', margin: 0, fontSize: '0.875rem' }}>
            {currentData.error}
          </p>
        </div>
        
        {/* Navigation for multi-image */}
        {type === 'multi-image' && totalImages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 0'
          }}>
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                padding: '0.5rem',
                opacity: currentIndex === 0 ? 0.5 : 1,
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.875rem',
              minWidth: '80px',
              textAlign: 'center'
            }}>
              {currentIndex + 1} of {totalImages}
            </span>
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === totalImages - 1}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                padding: '0.5rem',
                opacity: currentIndex === totalImages - 1 ? 0.5 : 1,
                cursor: currentIndex === totalImages - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
          {type === 'multi-image' ? <ImageIcon style={{ color: '#7c3aed' }} /> : <Eye style={{ color: '#7c3aed' }} />}
        </div>
        <h2 style={styles.cardTitle}>
          {type === 'multi-image' ? 'OCR Confidence Zones - Multi Image' : 'OCR Confidence Zones'}
        </h2>
        
        {/* Toggle overlay button */}
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

      {/* Current image info */}
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
            {fileName}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#6b46c1', fontSize: '0.75rem' }}>
            {detectionCount} detections
          </span>
          {hasOverlay ? (
            <CheckCircle size={14} style={{ color: '#16a34a' }} />
          ) : (
            <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
          )}
        </div>
      </div>

      {/* Navigation for multi-image */}
      {type === 'multi-image' && totalImages > 1 && (
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
            onClick={() => onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              padding: '0.5rem',
              opacity: currentIndex === 0 ? 0.5 : 1,
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
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
              Image {currentIndex + 1} of {totalImages}
            </span>
            <span style={{ 
              color: 'var(--text-tertiary)', 
              fontSize: '0.75rem'
            }}>
              {fileName}
            </span>
          </div>
          
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            disabled={currentIndex === totalImages - 1}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              padding: '0.5rem',
              opacity: currentIndex === totalImages - 1 ? 0.5 : 1,
              cursor: currentIndex === totalImages - 1 ? 'not-allowed' : 'pointer'
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
            src={`data:image/jpeg;base64,${currentData.overlayImage}`}
            alt={`OCR confidence overlay for ${fileName}`}
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
                : 'No confidence overlay available for this image'
              }
            </p>
          </div>
        )}
      </div>

      {/* Detection summary */}
      {detectionCount > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            <Eye size={14} />
            <span>
              Found <strong>{detectionCount}</strong> text regions with confidence mapping
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedConfidenceOverlay;