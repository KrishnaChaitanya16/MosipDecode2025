import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Home, Menu, X, Sun, Moon, Zap, Shield, Target, Layers, Globe, Camera, Upload, Edit3, AlertCircle, RefreshCw } from 'lucide-react';
import { useFileUpload } from './hooks/useFileUpload';
import { useOCRDetection } from './hooks/useOCRDetection';
import { useMultipagePdf } from './hooks/useMultipagePdf';
import { useFormData } from './hooks/useFormData';
import { useVerification } from './hooks/useVerification';
import ExtractionTab from './components/tabs/ExtractionTab';
import VerificationTab from './components/tabs/VerificationTab';
// Inline CSS styles
const injectStyles = () => {
  if (document.getElementById('ocr-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'ocr-styles';
  style.textContent = `
    /* CSS Variables for Theme System */
    :root {
      --primary: #007AFF;
      --primary-dark: #0056CC;
      --primary-light: #CCE7FF;
      --secondary: #5856D6;
      --accent: #FF9F0A;
      --success: #32D74B;
      --warning: #FF9F0A;
      --error: #FF453A;
      
      --bg-primary: #FFFFFF;
      --bg-secondary: #F8F9FA;
      --bg-tertiary: #E5E7EB;
      --bg-card: rgba(255, 255, 255, 0.8);
      --bg-sidebar: rgba(255, 255, 255, 0.95);
      --bg-overlay: rgba(0, 0, 0, 0.1);
      
      --text-primary: #1D1D1F;
      --text-secondary: #6E6E73;
      --text-tertiary: #8E8E93;
      --text-inverse: #FFFFFF;
      
      --border-light: rgba(0, 0, 0, 0.08);
      --border-medium: rgba(0, 0, 0, 0.12);
      --border-heavy: rgba(0, 0, 0, 0.2);
      
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
      --shadow-xl: 0 16px 64px rgba(0, 0, 0, 0.15);
      
      --space-xs: 0.5rem;
      --space-sm: 0.75rem;
      --space-md: 1rem;
      --space-lg: 1.5rem;
      --space-xl: 2rem;
      --space-2xl: 3rem;
      
      --radius-sm: 0.5rem;
      --radius-md: 0.75rem;
      --radius-lg: 1rem;
      --radius-xl: 1.5rem;
      
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --sidebar-width: 240px;
      --sidebar-width-collapsed: 60px;
      
      --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      
      --glass-bg: rgba(255, 255, 255, 0.1);
      --glass-border: rgba(255, 255, 255, 0.2);
      --glass-blur: blur(20px);
    }

    [data-theme="dark"] {
      --bg-primary: #000000;
      --bg-secondary: #1C1C1E;
      --bg-tertiary: #2C2C2E;
      --bg-card: rgba(28, 28, 30, 0.8);
      --bg-sidebar: rgba(28, 28, 30, 0.95);
      --bg-overlay: rgba(255, 255, 255, 0.1);
      
      --text-primary: #FFFFFF;
      --text-secondary: #EBEBF5;
      --text-tertiary: #EBEBF599;
      
      --border-light: rgba(255, 255, 255, 0.08);
      --border-medium: rgba(255, 255, 255, 0.12);
      --border-heavy: rgba(255, 255, 255, 0.2);
      
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
      --shadow-xl: 0 16px 64px rgba(0, 0, 0, 0.5);
      
      --glass-bg: rgba(0, 0, 0, 0.3);
      --glass-border: rgba(255, 255, 255, 0.1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-family);
      color: var(--text-primary);
      background: var(--bg-primary);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
    }

    .app-container {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      transition: all var(--transition-normal);
      position: relative;
    }

    .background-elements {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    }

    .bg-gradient-1 {
      position: absolute;
      top: 20%;
      left: 10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(0, 122, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      animation: float-slow 20s ease-in-out infinite;
    }

    .bg-gradient-2 {
      position: absolute;
      top: 60%;
      right: 10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(88, 86, 214, 0.08) 0%, transparent 70%);
      border-radius: 50%;
      animation: float-slow 25s ease-in-out infinite reverse;
    }

    .bg-gradient-3 {
      position: absolute;
      bottom: 10%;
      left: 50%;
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(255, 159, 10, 0.06) 0%, transparent 70%);
      border-radius: 50%;
      animation: float-slow 30s ease-in-out infinite;
      transform: translateX(-50%);
    }

    .sidebar {
      width: var(--sidebar-width);
      background: var(--bg-sidebar);
      backdrop-filter: var(--glass-blur);
      border-right: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-normal);
      position: relative;
      z-index: 100;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
    }

    .sidebar-closed {
      width: var(--sidebar-width-collapsed);
    }

    .sidebar-header {
      padding: var(--space-lg);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--primary);
    }

    .logo-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .logo-text {
      opacity: 1;
      transition: opacity var(--transition-normal);
    }

    .sidebar-closed .logo-text {
      opacity: 0;
      width: 0;
    }

    .sidebar-nav {
      padding: var(--space-lg) 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-lg);
      margin: 0 var(--space-sm);
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
      overflow: hidden;
    }

    .nav-item:hover {
      background: var(--bg-overlay);
      color: var(--text-primary);
      transform: translateX(2px);
    }

    .nav-item-active {
      background: var(--primary);
      color: var(--text-inverse);
      box-shadow: var(--shadow-md);
    }

    .nav-item-active:hover {
      background: var(--primary-dark);
      transform: translateX(0);
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .nav-label {
      opacity: 1;
      transition: opacity var(--transition-normal);
      white-space: nowrap;
    }

    .sidebar-closed .nav-label {
      opacity: 0;
      width: 0;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: var(--sidebar-width);
      transition: margin-left var(--transition-normal);
    }

    .sidebar-closed ~ .main-content {
      margin-left: var(--sidebar-width-collapsed);
    }

    .main-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg) var(--space-xl);
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      border-bottom: 1px solid var(--border-light);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
    }

    .sidebar-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: var(--bg-overlay);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .sidebar-toggle:hover {
      background: var(--border-medium);
      color: var(--text-primary);
      transform: scale(1.05);
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: var(--bg-overlay);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .theme-toggle:hover {
      background: var(--border-medium);
      color: var(--text-primary);
      transform: rotate(10deg) scale(1.05);
    }

    .page-content {
      flex: 1;
      padding: var(--space-xl);
      overflow-y: auto;
    }

    .home-page {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2xl);
      align-items: center;
      min-height: 70vh;
      padding: var(--space-2xl) 0;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }

    .hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.1;
      color: var(--text-primary);
      margin: 0;
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 500px;
    }

    .hero-stats {
      display: flex;
      gap: var(--space-xl);
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.95rem;
      color: var(--text-tertiary);
      margin-top: var(--space-xs);
    }

    .hero-visual {
      position: relative;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .floating-card {
      position: absolute;
      padding: var(--space-lg);
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      backdrop-filter: var(--glass-blur);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      color: var(--text-primary);
      font-weight: 500;
    }

    .card-1 {
      top: 10%;
      left: 20%;
      animation: float 6s ease-in-out infinite;
    }

    .card-2 {
      top: 60%;
      right: 10%;
      animation: float 8s ease-in-out infinite reverse;
    }

    .card-3 {
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%);
      animation: float 7s ease-in-out infinite;
    }

    .features-section {
      padding: var(--space-2xl) 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
    }

    .section-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--space-md);
    }

    .section-header p {
      font-size: 1.125rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-xl);
      margin-top: var(--space-2xl);
    }

    .feature-card {
      padding: var(--space-xl);
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      backdrop-filter: var(--glass-blur);
      transition: all var(--transition-normal);
      position: relative;
      overflow: hidden;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl);
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      opacity: 0;
      transition: opacity var(--transition-normal);
    }

    .feature-card:hover::before {
      opacity: 1;
    }

    .feature-icon {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-lg);
      position: relative;
      overflow: hidden;
    }

    .feature-icon::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, currentColor 0%, transparent 100%);
      opacity: 0.1;
    }

    .feature-icon.extraction {
      color: var(--primary);
    }

    .feature-icon.verification {
      color: var(--success);
    }

    .feature-icon.multilang {
      color: var(--secondary);
    }

    .feature-icon.batch {
      color: var(--accent);
    }

    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-md);
    }

    .feature-card p {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: var(--space-lg);
    }

    .feature-card ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .feature-card li {
      color: var(--text-tertiary);
      font-size: 0.9rem;
      position: relative;
      padding-left: var(--space-lg);
    }

    .feature-card li::before {
      content: 'âœ“';
      position: absolute;
      left: 0;
      color: var(--success);
      font-weight: 600;
    }

    .how-it-works-section {
      padding: var(--space-2xl) 0;
      background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
      border-radius: var(--radius-xl);
      margin: var(--space-2xl) 0;
    }

    .process-steps {
      display: flex;
      flex-direction: column;
      gap: var(--space-2xl);
      max-width: 800px;
      margin: 0 auto;
    }

    .process-step {
      display: flex;
      align-items: flex-start;
      gap: var(--space-xl);
      padding: var(--space-xl);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-light);
      transition: all var(--transition-normal);
      position: relative;
    }

    .process-step:hover {
      transform: translateX(8px);
      box-shadow: var(--shadow-lg);
    }

    .step-number {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: var(--text-inverse);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      flex-shrink: 0;
      box-shadow: var(--shadow-md);
    }

    .step-content h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-sm);
    }

    .step-content p {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes float-slow {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-slide-up {
      animation: slide-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      opacity: 0;
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: var(--sidebar-width);
      }
      
      .sidebar-open {
        transform: translateX(0);
      }
      
      .main-content {
        margin-left: 0;
      }
      
      .hero-section {
        grid-template-columns: 1fr;
        text-align: center;
      }
      
      .hero-stats {
        justify-content: center;
      }
      
      .process-steps {
        gap: var(--space-lg);
      }
      
      .process-step {
        flex-direction: column;
        text-align: center;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  
  document.head.appendChild(style);
};

const HomePage = ({ darkMode }) => (
  <div className="home-page">
    {/* Hero Section */}
    <div className="hero-section">
      <div className="hero-content animate-slide-up">
        <h1 className="hero-title">
          Intelligent Document
          <span className="gradient-text"> Processing</span>
        </h1>
        <p className="hero-subtitle">
          Advanced OCR technology with multilingual support, confidence zones, and intelligent verification.
          Transform any document into structured, actionable data.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Languages</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10x</div>
            <div className="stat-label">Faster</div>
          </div>
        </div>
      </div>
      <div className="hero-visual animate-float">
        <div className="floating-card card-1">
          <FileText size={24} />
          <span>PDF Processing</span>
        </div>
        <div className="floating-card card-2">
          <Globe size={24} />
          <span>Multi-language</span>
        </div>
        <div className="floating-card card-3">
          <Shield size={24} />
          <span>Verification</span>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div className="features-section">
      <div className="section-header animate-slide-up">
        <h2>Powerful Features</h2>
        <p>Everything you need for intelligent document processing</p>
      </div>
      
      <div className="features-grid">
        <div className="feature-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="feature-icon extraction">
            <Target size={32} />
          </div>
          <h3>Smart Extraction</h3>
          <p>AI-powered OCR that understands document structure and extracts data with pixel-perfect accuracy and confidence scores.</p>
          <ul>
            <li>Confidence zones visualization</li>
            <li>Field-level accuracy scoring</li>
            <li>Intelligent text recognition</li>
          </ul>
        </div>

        <div className="feature-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="feature-icon verification">
            <CheckCircle size={32} />
          </div>
          <h3>Data Verification</h3>
          <p>Cross-reference extracted data with original documents to ensure 100% accuracy and compliance.</p>
          <ul>
            <li>Real-time validation</li>
            <li>Error detection & correction</li>
            <li>Audit trail generation</li>
          </ul>
        </div>

        <div className="feature-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="feature-icon multilang">
            <Globe size={32} />
          </div>
          <h3>Multilingual Support</h3>
          <p>Process documents in 50+ languages with native understanding of regional formats and layouts.</p>
          <ul>
            <li>50+ supported languages</li>
            <li>Regional format recognition</li>
            <li>Cultural context awareness</li>
          </ul>
        </div>

        <div className="feature-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="feature-icon batch">
            <Layers size={32} />
          </div>
          <h3>Batch Processing</h3>
          <p>Handle multiple documents and pages simultaneously with intelligent batching and parallel processing.</p>
          <ul>
            <li>Multi-page PDF support</li>
            <li>Parallel processing engine</li>
            <li>Bulk data export</li>
          </ul>
        </div>
      </div>
    </div>

    {/* How It Works Section */}
    <div className="how-it-works-section">
      <div className="section-header animate-slide-up">
        <h2>How It Works</h2>
        <p>Simple, powerful, intelligent - three steps to perfect data</p>
      </div>
      
      <div className="process-steps">
        <div className="process-step animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="step-number">01</div>
          <div className="step-content">
            <h3>Upload & Configure</h3>
            <p>Upload your documents via drag-and-drop, file browser, or camera capture. Select the document language for optimal recognition.</p>
          </div>
        </div>
        
        <div className="process-step animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="step-number">02</div>
          <div className="step-content">
            <h3>Extract & Analyze</h3>
            <p>Our AI analyzes document structure, extracts text with confidence scores, and provides visual overlay for verification.</p>
          </div>
        </div>
        
        <div className="process-step animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="step-number">03</div>
          <div className="step-content">
            <h3>Verify & Export</h3>
            <p>Review extracted data, make corrections if needed, and export structured data in your preferred format.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OCRProjectUI = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('en');

  // File upload hook
  const { uploadedFiles, handleFileUpload, removeFile, clearFiles } = useFileUpload(false);

  // Single page extraction hook
  const {
    extractedData, confidenceData, overlayImage, isExtracting, error,
    errorDetails, extractWithDetection, clearExtraction, handleDismissError
  } = useOCRDetection();

  // Multipage PDF hook
  const {
    multipageResults, isProcessing: isProcessingMultipage, error: multipageError,
    errorDetails: multipageErrorDetails, processMultipagePdf, clearResults: clearMultipage,
    handleDismissError: handleDismissMultipageError
  } = useMultipagePdf();

  // Form data for verification tab
  const { verificationData, updateField, populateForm, clearForm } = useFormData();
  const { verificationResult, isVerifying, verificationError, handleVerification, clearVerificationResult } = useVerification();

  // Inject styles on component mount
  useEffect(() => {
    injectStyles();
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      setDarkMode(prefersDark);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const clearAllExtractions = () => {
    clearExtraction();
    clearMultipage();
    clearVerificationResult();
  };

  const handleFileChange = (files) => {
    handleFileUpload(files);
    clearAllExtractions();
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    clearAllExtractions();
  };

  const handleFieldChange = (fieldId, value) => {
    console.log(`Field ${fieldId} changed to: ${value}`);
  };

  const singlePageData = extractedData ? {
    extractedData,
    confidenceData,
    overlayImage,
  } : null;

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'extraction', label: 'Text Extraction', icon: FileText },
    { id: 'verification', label: 'Data Verification', icon: CheckCircle }
  ];

  const getPageTitle = () => {
    switch(activeTab) {
      case 'extraction': return 'Text Extraction';
      case 'verification': return 'Data Verification';
      default: return 'OCR Pro Dashboard';
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Background Elements */}
      <div className="background-elements">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
        <div className="bg-gradient-3"></div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Zap className="logo-icon" />
            {sidebarOpen && <span className="logo-text">OCR Pro</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`}
              >
                <IconComponent className="nav-icon" />
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sidebar-toggle"
            >
              <Menu size={20} />
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>

          <div className="header-right">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="page-content">
          {activeTab === 'home' && <HomePage darkMode={darkMode} />}

          {activeTab === 'extraction' && (
            <ExtractionTab
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileChange}
              onRemoveFile={removeFile}
              onCameraCapture={handleFileChange}
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
              onExtractSinglePage={extractWithDetection}
              singlePageData={singlePageData}
              isExtractingSingle={isExtracting}
              singlePageError={error}
              singlePageErrorDetails={errorDetails}
              onDismissSinglePageError={handleDismissError}
              onExtractMultipage={processMultipagePdf}
              multipageData={multipageResults}
              isExtractingMultipage={isProcessingMultipage}
              multipageError={multipageError}
              multipageErrorDetails={multipageErrorDetails}
              onDismissMultipageError={handleDismissMultipageError}
              onFieldChange={handleFieldChange}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationTab
              uploadedFile={uploadedFiles[0]}
              onFileUpload={(files) => handleFileChange(files)}
              verificationData={verificationData}
              onVerificationFieldChange={updateField}
              onClearVerificationForm={clearForm}
              onUseExtractedData={populateForm}
              extractedData={extractedData}
              selectedTemplate={selectedTemplate}
              verificationResult={verificationResult}
              isVerifying={isVerifying}
              verificationError={verificationError}
              onStartVerification={handleVerification}
              onClearVerificationResult={clearVerificationResult}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default OCRProjectUI;