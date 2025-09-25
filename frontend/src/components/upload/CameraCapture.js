import React from 'react';
import { Camera } from 'lucide-react';
import { styles } from '../../constants/styles';

const CameraCapture = ({ 
  isCameraActive, 
  videoRef, 
  canvasRef, 
  onCapture, 
  onCancel 
}) => {
  if (!isCameraActive) return null;

  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      /* backgroundColor: '#f9fafb', */
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            borderRadius: '0.5rem',
            backgroundColor: '#000'
          }}
        />
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          onClick={onCapture}
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          <Camera size={16} />
          Capture
        </button>
        <button
          onClick={onCancel}
          style={{ ...styles.button, ...styles.secondaryButton }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
