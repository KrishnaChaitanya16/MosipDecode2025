import React from 'react';
import { Upload, Camera } from 'lucide-react';
import { styles } from '../../constants/styles';
import CameraCapture from './CameraCapture';
import { useCamera } from '../../hooks/useCamera';

const FileUploadArea = ({ onFileUpload, uploadedFile, onCameraCapture }) => {
  const { 
    isCameraActive, 
    videoRef, 
    canvasRef, 
    startCamera, 
    captureImage, 
    stopCamera 
  } = useCamera();

  const handleCapture = async () => {
    const file = await captureImage();
    if (file && onCameraCapture) {
      onCameraCapture(file);
    }
    stopCamera();
  };

  return (
    <div>
      <div style={styles.uploadArea}>
        <div style={styles.uploadContent}>
          <div style={styles.uploadIconWrapper}>
            <Upload style={{ width: '2rem', height: '2rem', color: '#2563eb' }} />
          </div>
          <div>
            <p style={styles.uploadText}>Upload Document</p>
            <p style={styles.uploadSubtext}>Drag and drop, choose file, or use camera</p>
            <p style={styles.uploadSmallText}>Supports PDF, JPG, PNG (Max 10MB)</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="file"
              onChange={onFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              style={{ ...styles.button, ...styles.primaryButton, cursor: 'pointer' }}
            >
              Choose File
            </label>
            
            <button
              onClick={startCamera}
              style={{ ...styles.button, ...styles.secondaryButton }}
              disabled={isCameraActive}
            >
              <Camera size={16} />
              Camera
            </button>
          </div>
          
          {uploadedFile && (
            <div style={styles.fileInfo}>
              <p style={styles.fileName}>{uploadedFile.name}</p>
              <p style={styles.fileSize}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </div>
      
      <CameraCapture
        isCameraActive={isCameraActive}
        videoRef={videoRef}
        canvasRef={canvasRef}
        onCapture={handleCapture}
        onCancel={stopCamera}
      />
    </div>
  );
};

export default FileUploadArea;
