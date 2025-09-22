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
  }
};
