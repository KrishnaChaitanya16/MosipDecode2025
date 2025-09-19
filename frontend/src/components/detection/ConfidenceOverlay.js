import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Download, RotateCcw, ZoomIn, ZoomOut, Target } from 'lucide-react';
import { styles } from '../../constants/styles';

const ConfidenceOverlay = ({ 
  originalImage, 
  overlayImage, 
  detections = [], 
  onRetryDetection,
  isDetecting = false 
}) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const confidenceColors = {
    high: '#22c55e',
    medium: '#f59e0b', 
    low: '#ef4444',
    very_low: '#6b7280'
  };

  const confidenceLabels = {
    high: 'High Confidence (90%+)',
    medium: 'Medium Confidence (70-89%)',
    low: 'Low Confidence (50-69%)',
    very_low: 'Very Low Confidence (<50%)'
  };

  const downloadOverlay = () => {
    if (overlayImage) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${overlayImage}`;
      link.download = `ocr_confidence_overlay_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Create object URL from originalImage if it's a File
  const getImageSrc = () => {
    if (originalImage instanceof File) {
      return URL.createObjectURL(originalImage);
    } else if (typeof originalImage === 'string') {
      return originalImage;
    }
    return null;
  };

  const originalImageSrc = getImageSrc();

  useEffect(() => {
    // Cleanup object URLs when component unmounts
    return () => {
      if (originalImage instanceof File && originalImageSrc) {
        URL.revokeObjectURL(originalImageSrc);
      }
    };
  }, [originalImage, originalImageSrc]);

  if (!originalImageSrc && !overlayImage) {
    return (
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
            <Target style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} />
          </div>
          <h2 style={styles.cardTitle}>OCR Confidence Zones</h2>
        </div>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <Target size={48} style={{ margin: '0 auto 1rem', color: '#d1d5db' }} />
          <p>No confidence zone data available. Click "Show Confidence Zones Only" or "Extract with Confidence Zones" to see bounding boxes.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
          <Target style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} />
        </div>
        <h2 style={styles.cardTitle}>OCR Confidence Zones</h2>
        <div style={{
          marginLeft: 'auto',
          padding: '0.25rem 0.75rem',
          backgroundColor: '#fef3c7',
          color: '#92400e',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <Target size={12} />
          {detections.length} Detections
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            style={{
              ...styles.button,
              ...(showOverlay ? styles.primaryButton : styles.secondaryButton)
            }}
          >
            {showOverlay ? <EyeOff size={16} /> : <Eye size={16} />}
            {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
          </button>
          
          <button
            onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            <ZoomIn size={16} />
          </button>
          
          <button
            onClick={() => setZoom(Math.max(zoom - 0.25, 0.25))}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            <ZoomOut size={16} />
          </button>

          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onRetryDetection}
            disabled={isDetecting}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              opacity: isDetecting ? 0.6 : 1
            }}
          >
            <RotateCcw size={16} />
            {isDetecting ? 'Detecting...' : 'Retry Detection'}
          </button>
          
          <button
            onClick={downloadOverlay}
            style={{ ...styles.button, ...styles.primaryButton }}
            disabled={!overlayImage}
          >
            <Download size={16} />
            Download Overlay
          </button>
        </div>
      </div>

      {/* Confidence Legend */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {Object.entries(confidenceColors).map(([level, color]) => (
          <div key={level} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: color,
              borderRadius: '2px'
            }} />
            <span>{confidenceLabels[level]}</span>
          </div>
        ))}
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          overflow: 'auto',
          maxHeight: '600px',
          backgroundColor: '#f9fafb'
        }}
      >
        {overlayImage && showOverlay ? (
          <img
            src={`data:image/png;base64,${overlayImage}`}
            alt="OCR Confidence Overlay"
            style={{
              width: `${100 * zoom}%`,
              height: 'auto',
              display: 'block',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              // Calculate click position relative to image for detection selection
              const rect = e.target.getBoundingClientRect();
              const x = (e.clientX - rect.left) / zoom;
              const y = (e.clientY - rect.top) / zoom;
              
              // Find clicked detection
              const clicked = detections.find(detection => {
                const bbox = detection.bbox;
                return x >= bbox.x1 && x <= bbox.x2 && y >= bbox.y1 && y <= bbox.y2;
              });
              
              setSelectedDetection(clicked);
            }}
          />
        ) : originalImageSrc ? (
          <img
            src={originalImageSrc}
            alt="Original Document"
            style={{
              width: `${100 * zoom}%`,
              height: 'auto',
              display: 'block'
            }}
          />
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            No image to display
          </div>
        )}
      </div>

      {/* Detection Stats */}
      <div style={{
        marginTop: '1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '0.75rem'
      }}>
        {Object.entries(
          detections.reduce((acc, detection) => {
            acc[detection.confidence_level] = (acc[detection.confidence_level] || 0) + 1;
            return acc;
          }, {})
        ).map(([level, count]) => (
          <div key={level} style={{
            padding: '0.5rem',
            backgroundColor: '#ffffff',
            border: `2px solid ${confidenceColors[level]}`,
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: confidenceColors[level]
            }}>
              {count}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              textTransform: 'capitalize'
            }}>
              {level.replace('_', ' ')} Conf.
            </div>
          </div>
        ))}
      </div>

      {/* Selected Detection Details */}
      {selectedDetection && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem'
        }}>
          <h4 style={{
            margin: '0 0 0.5rem 0',
            color: '#1e40af',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            Selected Detection
          </h4>
          <div style={{ fontSize: '0.875rem' }}>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Text:</strong> "{selectedDetection.text}"
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Confidence:</strong> {Math.round(selectedDetection.confidence * 100)}%
            </p>
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Position:</strong> ({Math.round(selectedDetection.bbox.x1)}, {Math.round(selectedDetection.bbox.y1)}) 
              to ({Math.round(selectedDetection.bbox.x2)}, {Math.round(selectedDetection.bbox.y2)})
            </p>
          </div>
          <button
            onClick={() => setSelectedDetection(null)}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem'
            }}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default ConfidenceOverlay;
