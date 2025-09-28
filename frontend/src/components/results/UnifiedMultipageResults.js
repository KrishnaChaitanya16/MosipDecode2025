import React, { useState } from 'react';
import { Layers, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { styles } from '../../constants/styles';
import FormField from '../common/FormField';
import ConfidenceOverlay from '../detection/ConfidenceOverlay';

const UnifiedMultipageResults = ({ unifiedData, template, onFieldChange }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  if (!unifiedData || !unifiedData.pages || unifiedData.pages.length === 0) {
    return null;
  }

  const { pages, unifiedData: extractedData, unifiedConfidence } = unifiedData;
  const activeFields = template.fields;
  const currentPage = pages[currentPageIndex];
  const totalPages = pages.length;

  const goToNextPage = () => {
    setCurrentPageIndex(prev => Math.min(prev + 1, totalPages - 1));
  };

  const goToPrevPage = () => {
    setCurrentPageIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div style={{ ...styles.card, marginTop: '2rem' }}>
      <div style={styles.cardHeader}>
        <div style={{ ...styles.iconWrapper, ...styles.purpleIcon }}>
          <Layers style={{ color: '#7c3aed' }} />
        </div>
        <h2 style={styles.cardTitle}>Unified Extraction Results</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Left Side: Image Viewer */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Document Viewer</h3>
          {/* Viewer Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <button 
              onClick={goToPrevPage} 
              disabled={currentPageIndex === 0} 
              style={{ ...styles.button, ...styles.secondaryButton, opacity: currentPageIndex === 0 ? 0.6 : 1 }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>
              Page {currentPage.pageNum} of {totalPages}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={currentPageIndex === totalPages - 1} 
              style={{ ...styles.button, ...styles.secondaryButton, opacity: currentPageIndex === totalPages - 1 ? 0.6 : 1 }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
          
          {/* ConfidenceOverlay */}
          <ConfidenceOverlay
            originalImage={currentPage.originalImage}
            overlayImage={currentPage.overlayImage}
            detections={currentPage.detections}
          />
        </div>

        {/* Right Side: Unified Form */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
             <FileText size={20} style={{ color: 'var(--success)' }} />
             Consolidated Data Form
          </h3>
          <div style={{ ...styles.grid, ...styles.grid2, maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
            {activeFields.map(field => (
              <FormField
                key={field.id}
                field={field}
                value={extractedData[field.id] || ''}
                confidence={unifiedConfidence[field.id] || null}
                onChange={onFieldChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedMultipageResults;