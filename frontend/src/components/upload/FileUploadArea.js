import React from 'react';
import { Upload, Camera, X, FileText, Image } from 'lucide-react';
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
    console.log('📁 FileUploadArea: handleFileInputChange called');
    console.log('📁 Event target:', event.target);
    console.log('📁 Files:', event.target.files);
    
    if (!event || !event.target || !event.target.files) {
      console.error('❌ Invalid event or files in handleFileInputChange');
      return;
    }

    const files = Array.from(event.target.files);
    console.log('📁 Processed files:', files.length);
    
    if (files.length > 0) {
      if (allowMultiple) {
        onFileUpload(files);
      } else {
        onFileUpload([files[0]]); // Single file mode
      }
    }
    
    // Clear input to allow selecting same files again
    event.target.value = '';
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <Image size={16} />;
    }
    return <FileText size={16} />;
  };

  // Handle both single file (legacy) and multiple files
  const filesArray = Array.isArray(uploadedFiles) ? uploadedFiles : (uploadedFiles ? [uploadedFiles] : []);

  return (
    <div style={styles.fileUploadContainer}>
      <div style={styles.uploadArea}>
        <div style={styles.uploadContent}>
          <div style={styles.uploadIconWrapper}>
            <Upload size={32} />
          </div>
          <div style={styles.uploadTextContent}>
            <h3 style={styles.uploadText}>
              {allowMultiple ? 'Upload Multiple Documents' : 'Upload Document'}
            </h3>
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
          
          <div style={styles.uploadActions}>
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
              style={{ ...styles.button, ...styles.primaryButton, ...styles.uploadButton, cursor: 'pointer' }}
            >
              <Upload size={16} />
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
            <div style={styles.uploadedFiles}>
              <div style={styles.filesHeader}>
                <h4 style={styles.filesTitle}>
                  {allowMultiple ? `Selected Files (${filesArray.length})` : 'Selected File'}:
                </h4>
              </div>
              
              <div style={styles.filesList}>
                {filesArray.map((file, index) => (
                  <div key={`${file.name}-${index}`} style={styles.fileItem}>
                    <div style={styles.fileInfoContent}>
                      <div style={styles.fileIcon}>
                        {getFileIcon(file.name)}
                      </div>
                      <div style={styles.fileDetails}>
                        <p style={styles.fileName}>{file.name}</p>
                        <p style={styles.fileSize}>{formatFileSize(file.size)} MB</p>
                      </div>
                    </div>
                    
                    {allowMultiple && onRemoveFile && (
                      <button
                        onClick={() => onRemoveFile(index)}
                        style={styles.removeFileBtn}
                        title="Remove file"
                        onMouseEnter={(e) => {
                          Object.assign(e.target.style, styles.removeFileBtnHover);
                        }}
                        onMouseLeave={(e) => {
                          Object.assign(e.target.style, styles.removeFileBtn);
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {allowMultiple && filesArray.length > 1 && (
                <div style={styles.filesSummary}>
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