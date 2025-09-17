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
    orangeIcon: { backgroundColor: '#fed7aa' },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937'
    },
    uploadArea: {
      border: '2px dashed #d1d5db',
      borderRadius: '0.75rem',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease'
    },
    uploadAreaHover: {
      borderColor: '#60a5fa'
    },
    uploadContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    },
    uploadIconWrapper: {
      padding: '1rem',
      backgroundColor: '#eff6ff',
      borderRadius: '50%'
    },
    uploadText: {
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#374151'
    },
    uploadSubtext: {
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    uploadSmallText: {
      fontSize: '0.875rem',
      color: '#9ca3af',
      marginTop: '0.5rem'
    },
    button: {
      padding: '0.5rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
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
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    purpleButton: {
      backgroundColor: 'rgb(37, 99, 235)',
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
    fileSize: {
      color: '#16a34a',
      fontSize: '0.875rem'
    },
    errorContainer: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px rgba(239, 68, 68, 0.1)'
    },
    errorHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    errorIconWrapper: {
      padding: '0.5rem',
      backgroundColor: '#fee2e2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    errorTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#991b1b'
    },
    errorMessage: {
      color: '#7f1d1d',
      fontSize: '1rem',
      marginBottom: '1rem',
      lineHeight: '1.5'
    },
    errorDetails: {
      backgroundColor: '#ffffff',
      border: '1px solid #fecaca',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginTop: '1rem'
    },
    errorDetailsHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#7f1d1d'
    },
    qualityScore: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0.75rem',
      backgroundColor: '#fee2e2',
      border: '1px solid #fca5a5',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#991b1b',
      marginBottom: '1rem'
    },
    suggestionsList: {
      margin: '0',
      paddingLeft: '1.25rem',
      color: '#7f1d1d'
    },
    suggestionItem: {
      marginBottom: '0.5rem',
      lineHeight: '1.4',
      fontSize: '0.875rem'
    },
    errorActions: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.25rem',
      flexWrap: 'wrap'
    },
    retryButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#dc2626',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    dismissButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    grid: {
      display: 'grid',
      gap: '1.5rem'
    },
    grid2: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
    },
    grid3: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
    },
    formField: {
      marginBottom: '1rem'
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
    inputError: {
      borderColor: '#fca5a5',
      backgroundColor: '#fef2f2'
    },
    confidenceHigh: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      marginLeft: '0.5rem'
    },
    confidenceMed: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      marginLeft: '0.5rem'
    },
    confidenceLow: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      marginLeft: '0.5rem'
    },
    summary: {
      marginTop: '2rem',
      padding: '1rem',
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '0.5rem'
    },
    summaryHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    summaryTitle: {
      fontWeight: '500',
      color: '#1e40af'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      fontSize: '0.875rem'
    },
    summaryLabel: {
      color: '#6b7280'
    },
    summaryValue: {
      marginLeft: '0.5rem',
      fontWeight: '500'
    },
    verificationField: {
      marginBottom: '1rem'
    },
    comparisonGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem'
    },
    originalData: {
      padding: '0.75rem',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '0.375rem'
    },
    matchData: {
      padding: '0.75rem',
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '0.375rem'
    },
    mismatchData: {
      padding: '0.75rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '0.375rem'
    },
    dataLabel: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    dataValue: {
      fontWeight: '500'
    },
    statusMatch: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      marginLeft: '0.5rem'
    },
    statusMismatch: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      marginLeft: '0.5rem'
    },
    statsCard: {
      padding: '1rem',
      border: '1px solid',
      borderRadius: '0.5rem',
      textAlign: 'center'
    },
    statsGreen: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0'
    },
    statsRed: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca'
    },
    statsBlue: {
      backgroundColor: '#eff6ff',
      borderColor: '#bfdbfe'
    },
    statsNumber: {
      fontSize: '2rem',
      fontWeight: '700'
    },
    statsLabel: {
      fontSize: '0.875rem'
    },
    footer: {
      marginTop: '4rem',
      textAlign: 'center',
      color: '#6b7280'
    }
  };
  