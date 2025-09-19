import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { styles } from '../../constants/styles';
import FileUploadArea from '../upload/FileUploadArea';
import DataEntryForm from '../verification/DataEntryForm';
import VerificationResults from '../verification/VerificationResults';

const VerificationTab = ({
  uploadedFile,
  onFileUpload,
  onCameraCapture,
  verificationData,
  onVerificationFieldChange,
  onClearVerificationForm,
  onUseExtractedData,
  extractedData,
  selectedTemplate,
  // New verification props
  verificationResult,
  isVerifying,
  verificationError,
  onStartVerification,
  onClearVerificationResult
}) => {
  const canStartVerification = uploadedFile && Object.keys(verificationData).length > 0;
  
  // Show results only when not verifying and has result
  const showResults = !isVerifying && verificationResult;

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
            <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} />
          </div>
          <h2 style={styles.cardTitle}>Data Verification Setup</h2>
        </div>
        
        <div style={{ ...styles.grid, ...styles.grid2, marginBottom: '1.5rem', alignItems: 'flex-start' }}>
          {/* File Upload Section */}
          <div>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '1rem',
              height: '1.75rem', // Fixed height for alignment
              display: 'flex',
              alignItems: 'center'
            }}>
              Original Document
            </h3>
            <FileUploadArea 
              onFileUpload={(files) => {
                // Handle single file for verification
                console.log('📁 Verification file upload:', files);
                if (Array.isArray(files) && files.length > 0) {
                  onFileUpload([files[0]]); // Only take the first file
                } else if (files && files.length > 0) {
                  onFileUpload([files[0]]);
                }
              }}
              uploadedFiles={uploadedFile ? [uploadedFile] : []} 
              onCameraCapture={onCameraCapture}
              allowMultiple={false}
            />
          </div>

          {/* Data Entry Section */}
          <div>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '1rem',
              height: '1.75rem', // Fixed height for alignment
              display: 'flex',
              alignItems: 'center'
            }}>
              Enter Verification Data
            </h3>
            <DataEntryForm
              verificationData={verificationData}
              onFieldChange={onVerificationFieldChange}
              onClear={onClearVerificationForm}
              onUseExtracted={onUseExtractedData}
              extractedData={extractedData}
            />
          </div>
        </div>

        {/* Verification Error Display */}
        {verificationError && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ color: '#dc2626' }} />
              <span style={{ color: '#dc2626', fontWeight: '500' }}>Verification Error</span>
            </div>
            <p style={{ color: '#991b1b', marginTop: '0.5rem', marginBottom: 0 }}>
              {verificationError}
            </p>
          </div>
        )}

        {/* Start Verification Button */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => onStartVerification(uploadedFile, verificationData)}
            disabled={!canStartVerification || isVerifying}
            style={{ 
              ...styles.button, 
              ...styles.purpleButton, 
              padding: '0.75rem 1.5rem',
              opacity: (!canStartVerification || isVerifying) ? 0.6 : 1
            }}
          >
            {isVerifying ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Verifying...
              </>
            ) : (
              'Start Verification'
            )}
          </button>

          {verificationResult && !isVerifying && (
            <button 
              onClick={onClearVerificationResult}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Clear Results
            </button>
          )}
        </div>

        {!canStartVerification && (
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem', 
            marginTop: '0.5rem',
            marginBottom: 0 
          }}>
            Please upload a document and enter verification data to proceed.
          </p>
        )}
      </div>

      {/* Verification Results with Smooth Transition - Hide when verifying */}
      <div style={{
        maxHeight: showResults ? '2000px' : '0px',
        opacity: showResults ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: showResults ? 'translateY(0)' : 'translateY(-20px)',
        marginTop: showResults ? '2rem' : '0'
      }}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconWrapper, ...styles.orangeIcon }}>
              <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#ea580c' }} />
            </div>
            <h2 style={styles.cardTitle}>Verification Results</h2>
          </div>

          <VerificationResults verificationResult={verificationResult} />
        </div>
      </div>
    </div>
  );
};

export default VerificationTab;
