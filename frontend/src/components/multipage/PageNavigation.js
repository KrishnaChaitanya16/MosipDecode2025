import React from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { styles } from '../../constants/styles';

const PageNavigation = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onNextPage, 
  onPrevPage 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      marginBottom: '1rem'
    }}>
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        style={{
          ...styles.button,
          ...styles.secondaryButton,
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#374151'
      }}>
        <FileText size={16} />
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Page Number Buttons */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            style={{
              ...styles.button,
              ...(pageNum === currentPage ? styles.primaryButton : styles.secondaryButton),
              padding: '0.5rem 0.75rem',
              minWidth: '2.5rem'
            }}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        style={{
          ...styles.button,
          ...styles.secondaryButton,
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default PageNavigation;
