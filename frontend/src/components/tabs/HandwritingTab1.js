import React, { useState } from 'react';
import { Edit, Sparkles } from 'lucide-react';
import { styles } from '../../constants/styles';
import DigitalBoard from '../handwriting/DigitalBoard1';
import { extractWithHandwriting } from '../../utils/apiService';

const HandwritingTab = ({
  selectedTemplate,
  onTemplateChange
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);

  const handleHandwritingCapture = async (blob, dataURL) => {
    setIsExtracting(true);
    setError(null);
    
    try {
      console.log('📝 Capturing handwriting for OCR processing...');
      
      // Create FormData to send image to backend
      const formData = new FormData();
      formData.append('document', blob, 'handwriting.png');
      formData.append('include_detection', 'false');
      
      // Call your existing /extract endpoint
      const result = await extractWithHandwriting(formData);
      
      console.log('✅ Handwriting extraction result:', result);
      setExtractedData(result);
      
    } catch (error) {
      console.error('❌ Handwriting extraction failed:', error);
      setError(error.message || 'Failed to extract text from handwriting');
      setExtractedData(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleClearResults = () => {
    setExtractedData(null);
    setError(null);
  };

  return (
    <div>
      {/* Header Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconWrapper, backgroundColor: '#f3e8ff' }}>
            <Edit style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} />
          </div>
          <h2 style={styles.cardTitle}>Digital Handwriting Board</h2>
          <div style={{
            marginLeft: 'auto',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Sparkles size={12} />
            AI-Powered
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#fef7ff', 
          border: '1px solid #e9d5ff',
          borderRadius: '8px', 
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#7c3aed',
            margin: '0 0 0.5rem 0'
          }}>
            ✨ How it works:
          </h3>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1.5rem',
            color: '#6b46c1',
            fontSize: '0.875rem'
          }}>
            <li>Write or draw on the digital board below</li>
            <li>Use the pen tool to write text naturally</li>
            <li>Click "Extract Text" to convert handwriting to digital text</li>
            <li>View extracted text and automatically detected form fields</li>
          </ul>
        </div>

        {/* Template Selection */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
            Template:
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => onTemplateChange(e.target.value)}
            style={{
              ...styles.input,
              width: 'auto',
              minWidth: '200px'
            }}
          >
            <option value="english">English Template</option>
            <option value="chinese">中文模板</option>
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px'
          }}>
            <h4 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#dc2626',
              margin: '0 0 0.25rem 0'
            }}>
              ⚠️ Extraction Error
            </h4>
            <p style={{ 
              margin: 0, 
              fontSize: '0.875rem', 
              color: '#991b1b'
            }}>
              {error}
            </p>
            <button
              onClick={handleClearResults}
              style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.75rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Digital Board */}
{/*       <div style={{ marginTop: '2rem' }}>
        <DigitalBoard
          onCapture={handleHandwritingCapture}
          isExtracting={isExtracting}
          extractedData={extractedData}
        />
      </div> */}
    </div>
  );
};

export default HandwritingTab;
