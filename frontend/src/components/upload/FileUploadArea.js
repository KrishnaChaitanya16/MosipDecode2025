import React from 'react';
import { Upload, Camera, X, FileText } from 'lucide-react';
import { styles } from '../../constants/styles';
import CameraCapture from './CameraCapture';
import { useCamera } from '../../hooks/useCamera';

const FileUploadArea = ({ onFileUpload, uploadedFiles = [], onCameraCapture, onRemoveFile, allowMultiple = false }) => {
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

  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
    // Clear input to allow selecting same files again
    event.target.value = '';
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  // Handle both single file (legacy) and multiple files
  const filesArray = Array.isArray(uploadedFiles) ? uploadedFiles : (uploadedFiles ? [uploadedFiles] : []);

  return (
    <div>
      <div style={styles.uploadArea}>
        <div style={styles.uploadContent}>
          <div style={styles.uploadIconWrapper}>
            <Upload style={{ width: '2rem', height: '2rem', color: '#2563eb' }} />
          </div>
          <div>
            <p style={styles.uploadText}>
              {allowMultiple ? 'Upload Multiple Documents' : 'Upload Document'}
            </p>
            <p style={styles.uploadSubtext}>
              {allowMultiple 
                ? 'Drag and drop, choose files, or use camera' 
                : 'Drag and drop, choose file, or use camera'
              }
            </p>
            <p style={styles.uploadSmallText}>
              Supports PDF, JPG, PNG{allowMultiple ? ' (Multiple files allowed)' : ''} (Max 10MB each)
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id={allowMultiple ? "multi-file-upload" : "file-upload"}
              multiple={allowMultiple}
            />
            <label
              htmlFor={allowMultiple ? "multi-file-upload" : "file-upload"}
              style={{ ...styles.button, ...styles.primaryButton, cursor: 'pointer' }}
            >
              {allowMultiple ? 'Choose Files' : 'Choose File'}
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
          
          {/* Display uploaded files */}
          {filesArray.length > 0 && (
            <div style={{ width: '100%', marginTop: '1rem' }}>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.75rem' 
              }}>
                {allowMultiple ? `Selected Files (${filesArray.length})` : 'Selected File'}:
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filesArray.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{
                      ...styles.fileInfo,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} style={{ color: '#15803d' }} />
                      <div>
                        <p style={{ ...styles.fileName, margin: 0 }}>{file.name}</p>
                        <p style={{ ...styles.fileSize, margin: 0 }}>{formatFileSize(file.size)} MB</p>
                      </div>
                    </div>
                    
                    {allowMultiple && onRemoveFile && (
                      <button
                        onClick={() => onRemoveFile(index)}
                        style={{
                          ...styles.button,
                          padding: '0.25rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #ef4444',
                          color: '#ef4444'
                        }}
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {allowMultiple && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  Total: {filesArray.length} file{filesArray.length !== 1 ? 's' : ''} 
                  ({filesArray.reduce((total, file) => total + file.size, 0) / 1024 / 1024 < 1 
                    ? `${(filesArray.reduce((total, file) => total + file.size, 0) / 1024).toFixed(0)} KB`
                    : `${(filesArray.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB`
                  })
                </div>
              )}
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
