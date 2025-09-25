export const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #faf5ff 100%)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
  },
  innerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#6b7280',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  // New Language Selector Styles
  templateSelector: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
  },
  templateLabel: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#374151',
  },
  templateSelect: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db',
      backgroundColor: '#ffffff',
      fontSize: '1rem',
      flexGrow: 1,
  },
  // Simplified action button container
  actionsContainer: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      marginTop: '1.5rem',
  },
  resultsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '2rem',
      marginTop: '2rem',
  },
  // Other styles remain the same...
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem'
  },
  tabWrapper: {
    display: 'flex',
    gap: '1rem',
    padding: '0.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeTab: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.25)'
  },
  inactiveTab: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginBottom: '2rem'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  },
  iconWrapper: {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  blueIcon: { backgroundColor: '#dbeafe' },
  greenIcon: { backgroundColor: '#dcfce7' },
  purpleIcon: { backgroundColor: '#f3e8ff' },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff'
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
    color: '#ffffff'
  },
  fileInfo: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '0.5rem'
  },
  fileName: {
    color: '#15803d',
    fontWeight: '500'
  },
  grid: {
    display: 'grid',
    gap: '1.5rem'
  },
  grid2: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },
  errorContainer: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '0.75rem',
  },
  errorMessage: {
    color: '#7f1d1d',
    fontSize: '1rem',
    marginBottom: '1rem',
    lineHeight: '1.5'
  },
  footer: {
    marginTop: '4rem',
    textAlign: 'center',
    color: '#6b7280'
  },
  container: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    fontFamily: 'var(--font-family)',
  },
  
  innerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'var(--space-xl) var(--space-md)',
  },
  
  // Header styles (deprecated)
  header: {
    textAlign: 'center',
    marginBottom: 'var(--space-2xl)',
  },
  
  title: {
    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: 'var(--space-md)',
  },
  
  subtitle: {
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  
  // Card styles (use .card CSS class instead)
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--border-light)',
    padding: 'var(--space-xl)',
    marginBottom: 'var(--space-xl)',
    backdropFilter: 'var(--glass-blur)',
  },
  
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-lg)',
    marginBottom: 'var(--space-xl)',
    paddingBottom: 'var(--space-lg)',
    borderBottom: '1px solid var(--border-light)',
  },
  
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  
  // Icon wrapper styles (use CSS classes instead)
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  
  blueIcon: {
    color: 'var(--primary)',
  },
  
  greenIcon: {
    color: 'var(--success)',
  },
  
  purpleIcon: {
    color: 'var(--secondary)',
  },
  
  orangeIcon: {
    color: 'var(--accent)',
  },
  
  // Button styles (use .button CSS classes instead)
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-lg)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-family)',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  
  primaryButton: {
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: 'var(--text-inverse)',
    boxShadow: 'var(--shadow-md)',
  },
  
  secondaryButton: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-medium)',
  },
  
  purpleButton: {
    background: 'linear-gradient(135deg, var(--secondary), #4C46CC)',
    color: 'var(--text-inverse)',
    boxShadow: 'var(--shadow-md)',
  },
  
  // Form styles (use CSS classes instead)
  templateSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-lg)',
    padding: 'var(--space-lg)',
    /* background: 'var(--bg-secondary)', */
    /* border: '1px solid var(--border-light)', */
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-xl)',
  },
  
  templateLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  
  templateSelect: {
    flex: '1',
    padding: 'var(--space-sm) var(--space-md)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    transition: 'all var(--transition-fast)',
  },
  
  input: {
    width: '100%',
    padding: 'var(--space-sm) var(--space-md)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontFamily: 'var(--font-family)',
    transition: 'all var(--transition-fast)',
    boxSizing: 'border-box',
  },
  
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: 'var(--space-xs)',
  },
  
  // Layout styles
  grid: {
    display: 'grid',
    gap: 'var(--space-lg)',
  },
  
  grid2: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  },
  
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 'var(--space-xl)',
    marginTop: 'var(--space-xl)',
  },
  
  actionsContainer: {
    display: 'flex',
    gap: 'var(--space-md)',
    flexWrap: 'wrap',
    marginTop: 'var(--space-xl)',
  },
  
  // File upload styles (use CSS classes instead)
  uploadArea: {
    /* border: '2px dashed var(--border-medium)', */
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-2xl)',
    textAlign: 'center',
    /* background: 'var(--bg-secondary)', */
    transition: 'all var(--transition-fast)',
    position: 'relative',
    overflow: 'hidden',
  },
  
  uploadContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-lg)',
  },
  
  uploadIconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  uploadText: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  
  uploadSubtext: {
    color: 'var(--text-secondary)',
    margin: 0,
  },
  
  uploadSmallText: {
    fontSize: '0.875rem',
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  
  fileInfo: {
    background: 'rgba(50, 215, 75, 0.1)',
    border: '1px solid rgba(50, 215, 75, 0.2)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-md)',
    marginTop: 'var(--space-md)',
  },
  
  fileName: {
    color: 'var(--success)',
    fontWeight: '500',
  },
  
  fileSize: {
    color: 'var(--text-tertiary)',
    fontSize: '0.875rem',
  },
  
  // Error styles
  errorContainer: {
    background: 'rgba(255, 69, 58, 0.1)',
    border: '1px solid rgba(255, 69, 58, 0.2)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-lg)',
    marginTop: 'var(--space-lg)',
  },
  
  errorMessage: {
    color: 'var(--error)',
    fontWeight: '500',
    marginBottom: 'var(--space-sm)',
    lineHeight: '1.5',
  },
  
  // Footer
  footer: {
    marginTop: 'var(--space-2xl)',
    textAlign: 'center',
    color: 'var(--text-tertiary)',
    fontSize: '0.9rem',
  },
  
  // Tab styles (deprecated - using new sidebar navigation)
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 'var(--space-xl)',
  },
  
  tabWrapper: {
    display: 'flex',
    gap: 'var(--space-md)',
    padding: 'var(--space-sm)',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--border-light)',
  },
  
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-lg)',
    borderRadius: 'var(--radius-md)',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  
  activeTab: {
    background: 'var(--primary)',
    color: 'var(--text-inverse)',
    boxShadow: 'var(--shadow-md)',
  },
  
  inactiveTab: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
  },
  cameraContainer: {
    marginTop: 'var(--space-lg)',
    padding: 'var(--space-lg)',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-light)',
  },
  
  cameraVideo: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    borderRadius: 'var(--radius-md)',
    backgroundColor: '#000',
    boxShadow: 'var(--shadow-md)',
  },
  
  cameraCanvas: {
    display: 'none',
  },
  
  cameraActions: {
    display: 'flex',
    gap: 'var(--space-md)',
    justifyContent: 'center',
    marginTop: 'var(--space-lg)',
  },
  
  // Verification Tab Specific Styles
  verificationTab: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  verificationSetup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xl)',
  },
  
  setupGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--space-xl)',
    alignItems: 'flex-start',
  },
  
  setupSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
  },
  
  sectionHeaderSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    marginBottom: 'var(--space-md)',
    fontSize: '1.125rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  
  verificationActions: {
    display: 'flex',
    gap: 'var(--space-md)',
    alignItems: 'center',
    marginTop: 'var(--space-lg)',
    flexWrap: 'wrap',
  },
  
  infoMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-md)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    marginTop: 'var(--space-md)',
    fontSize: '0.9rem',
    color: 'var(--text-tertiary)',
  },
  
  resultsBadge: {
    marginLeft: 'auto',
  },
  
  statusBadge: {
    padding: 'var(--space-xs) var(--space-md)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  
  statusBadgeSuccess: {
    background: 'rgba(50, 215, 75, 0.15)',
    color: 'var(--success)',
    border: '1px solid rgba(50, 215, 75, 0.3)',
  },
  
  statusBadgeWarning: {
    background: 'rgba(255, 159, 10, 0.15)',
    color: 'var(--accent)',
    border: '1px solid rgba(255, 159, 10, 0.3)',
  },
  
  verificationResultsContainer: {
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  },
  
  // File Upload Enhanced Styles
  fileUploadContainer: {
    width: '100%',
  },
  
  uploadTextContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
    textAlign: 'center',
  },
  
  uploadActions: {
    display: 'flex',
    gap: 'var(--space-md)',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  
  uploadButton: {
    minWidth: '140px',
  },
  
  uploadedFiles: {
    width: '100%',
    marginTop: 'var(--space-lg)',
    paddingTop: 'var(--space-lg)',
    borderTop: '1px solid var(--border-light)',
  },
  
  filesHeader: {
    marginBottom: 'var(--space-md)',
  },
  
  filesTitle: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
    margin: 0,
  },
  
  filesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  },
  
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-md)',
    background: 'rgba(50, 215, 75, 0.08)',
    border: '1px solid rgba(50, 215, 75, 0.2)',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
  },
  
  fileItemHover: {
    background: 'rgba(50, 215, 75, 0.12)',
    transform: 'translateX(2px)',
  },
  
  fileInfoContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    flex: 1,
  },
  
  fileIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(50, 215, 75, 0.2)',
    color: 'var(--success)',
    flexShrink: 0,
  },
  
  fileDetails: {
    flex: 1,
    minWidth: 0,
  },
  
  fileName: {
    fontWeight: '500',
    color: 'var(--success)',
    margin: 0,
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  
  fileSize: {
    color: 'var(--text-tertiary)',
    fontSize: '0.8rem',
    margin: '2px 0 0 0',
  },
  
  removeFileBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    border: '1px solid var(--error)',
    background: 'rgba(255, 69, 58, 0.1)',
    color: 'var(--error)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    flexShrink: 0,
  },
  
  removeFileBtnHover: {
    background: 'var(--error)',
    color: 'var(--text-inverse)',
    transform: 'scale(1.05)',
  },
  
  filesSummary: {
    marginTop: 'var(--space-md)',
    padding: 'var(--space-sm) var(--space-md)',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    color: 'var(--text-tertiary)',
    textAlign: 'center',
  },
  
  // Extraction Tab Styles
  extractionTab: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  extractionConfig: {
    marginTop: 'var(--space-xl)',
    paddingTop: 'var(--space-xl)',
    borderTop: '1px solid var(--border-light)',
  },
  
  resultsSection: {
    marginTop: 'var(--space-2xl)',
  },
  
  multipageSection: {
    marginTop: 'var(--space-2xl)',
  },
  
  // Loading and Animation Utilities
  loadingSpinner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  },
  
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid var(--border-light)',
    borderTop: '2px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  // Form Field Enhancements
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  },
  
  confidenceIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  
  confidenceHigh: {
    background: 'rgba(50, 215, 75, 0.15)',
    color: 'var(--success)',
  },
  
  confidenceMedium: {
    background: 'rgba(255, 159, 10, 0.15)',
    color: 'var(--accent)',
  },
  
  confidenceLow: {
    background: 'rgba(255, 69, 58, 0.15)',
    color: 'var(--error)',
  },

  confidenceLegend: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      padding: '0.75rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      flexWrap: 'wrap'
  }
};
