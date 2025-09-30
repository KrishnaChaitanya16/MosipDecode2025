import React, { useState, useEffect } from 'react';
import { Square, AlertTriangle, FileText, CheckCircle, Home, Menu, X, Sun, Moon, Zap, Shield, Target, Layers, Globe, Camera, Upload, Edit3, AlertCircle, RefreshCw } from 'lucide-react';
import { useFileUpload } from './hooks/useFileUpload';
import { useOCRDetection } from './hooks/useOCRDetection';
import { useFormData } from './hooks/useFormData';
import { useVerification } from './hooks/useVerification';
import { extractOCRDataWithDetection, extractMultipagePdfData } from './utils/apiService';
import { parseErrorMessage } from './utils/errorHandling';
import ExtractionTab from './components/tabs/ExtractionTab';
import VerificationTab from './components/tabs/VerificationTab';
import { api_base } from './utils/apiService';
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
      --header-height: 80px; /* Added consistent header height */
      
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
      height: var(--header-height);
      padding: 0 var(--space-lg);
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0; /* Prevent shrinking */
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
      padding: var(--space-lg) 0.5rem;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-sm);
      margin: var(--space-sm) 0;
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
      display: flex;
      align-items: center;
      justify-content: center;
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
      height: var(--header-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-xl);
      background: var(--bg-card);
      backdrop-filter: var(--glass-blur);
      border-bottom: 1px solid var(--border-light);
      position: sticky;
      top: 0;
      z-index: 50;
      flex-shrink: 0; /* Prevent shrinking */
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
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      padding: var(--space-2xl) 0;
      overflow: hidden;
    }

    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
    }

    .hero-title {
      font-size: clamp(3rem, 6vw, 5rem);
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
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      pointer-events: none;
    }

    .floating-card {
      position: absolute;
      padding: var(--space-lg);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-lg);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      backdrop-filter: blur(5px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      color: var(--text-primary);
      font-weight: 500;
      opacity: 0.25;
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      backface-visibility: hidden;
      perspective: 1000px;
    }

    [data-theme="dark"] .floating-card {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .card-1 {
      bottom: 25%;
      left: 20%;
      animation: cardFlipCycle 10s infinite;
    }

    .card-2 {
      bottom: 30%;
      right: 20%;
      animation: cardFlipCycle 10s infinite;
    }

    .card-3 {
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%);
      animation: cardFlipCycleTranslate 10s infinite;
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
      content: '✓';
      position: absolute;
      left: 0;
      color: #007AFF;
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

    @keyframes cardFlipCycle {
      0%, 40% {
        transform: rotateY(0deg);
        opacity: 0.25;
      }
      45% {
        transform: rotateY(90deg);
        opacity: 0.1;
      }
      50%, 90% {
        transform: rotateY(90deg);
        opacity: 0.05;
      }
      95% {
        transform: rotateY(90deg);
        opacity: 0.1;
      }
      100% {
        transform: rotateY(0deg);
        opacity: 0.25;
      }
    }

    @keyframes cardFlipCycleTranslate {
      0%, 40% {
        transform: translateX(-50%) rotateY(0deg);
        opacity: 0.25;
      }
      45% {
        transform: translateX(-50%) rotateY(90deg);
        opacity: 0.1;
      }
      50%, 90% {
        transform: translateX(-50%) rotateY(90deg);
        opacity: 0.05;
      }
      95% {
        transform: translateX(-50%) rotateY(90deg);
        opacity: 0.1;
      }
      100% {
        transform: translateX(-50%) rotateY(0deg);
        opacity: 0.25;
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
        padding: var(--space-xl) var(--space-md);
      }

      .hero-title {
        font-size: clamp(2rem, 8vw, 3rem);
      }

      .floating-card {
        padding: var(--space-md);
        font-size: 0.8rem;
      }

      .card-1 {
        bottom: 15%;
        left: 10%;
      }

      .card-2 {
        bottom: 20%;
        right: 10%;
      }

      .card-3 {
        bottom: 10%;
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
        <h3>
          AI-powered OCR platform that transforms documents into actionable data.
        </h3>
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
          
          <h3>Smart Extraction</h3>
          <p>AI-powered OCR that understands document structure and extracts data with pixel-perfect accuracy and confidence scores.</p>
          <ul>
            <li>Confidence zones visualization</li>
            <li>Field-level accuracy scoring</li>
            <li>Intelligent text recognition</li>
          </ul>
        </div>

        <div className="feature-card animate-slide-up" style={{ animationDelay: '0.2s' }}>

          <h3>Data Verification</h3>
          <p>Cross-reference extracted data with original documents to ensure 100% accuracy and compliance.</p>
          <ul>
            <li>Real-time validation</li>
            <li>Error detection & correction</li>
            <li>Audit trail generation</li>
          </ul>
        </div>

        <div className="feature-card animate-slide-up" style={{ animationDelay: '0.3s' }}>

          <h3>Multilingual Support</h3>
          <p>Process documents in 50+ languages with native understanding of regional formats and layouts.</p>
          <ul>
            <li>50+ supported languages</li>
            <li>Regional format recognition</li>
            <li>Cultural context awareness</li>
          </ul>
        </div>

        <div className="feature-card animate-slide-up" style={{ animationDelay: '0.4s' }}>

          <h3>Batch Processing</h3>
          <p>Handle multiple documents and pages simultaneously with intelligent batching and parallel processing.</p>
          <ul>
            <li>Multi-page PDF support</li>
            <li>Parallel processing engine</li>
            <li>Bulk data export</li>
          </ul>
        </div>

        <div className="feature-card animate-slide-up" style={{ animationDelay: '0.5s' }}>

          <h3>Bounding Box Analysis</h3>
          <p>Visual confidence mapping with precise text boundaries and detailed accuracy metrics for each detected element.</p>
          <ul>
            <li>Visual text boundary detection</li>
            <li>Per-element confidence scoring</li>
            <li>Interactive region highlighting</li>
          </ul>
        </div>

        <div className="feature-card animate-slide-up" style={{ animationDelay: '0.6s' }}>

          <h3>Quality Assessment</h3>
          <p>Advanced image quality analysis that identifies poor document conditions and provides actionable improvement suggestions.</p>
          <ul>
            <li>Blur and noise detection</li>
            <li>Resolution quality analysis</li>
            <li>Lighting condition assessment</li>
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
  const { uploadedFiles, handleFileUpload, removeFile, clearFiles } = useFileUpload(true);

  // Single page extraction hook
  const {
    extractedData, confidenceData, overlayImage, isExtracting, error,
    errorDetails, extractWithDetection, clearExtraction, handleDismissError
  } = useOCRDetection();

  // Multipage PDF hook


  // Multi-image extraction state
  const [multiImageResults, setMultiImageResults] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessingMultiImage, setIsProcessingMultiImage] = useState(false);
  const [multiImageError, setMultiImageError] = useState('');
  const [multiImageErrorDetails, setMultiImageErrorDetails] = useState(null);

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

// Convert PDF pages to images and then process as regular multi-image
const convertPdfPagesToImages = async (pdfFile) => {
  
  try {
    console.log(`Converting PDF pages to images: ${pdfFile.name}`);
    
    const formData = new FormData();
    formData.append('file', pdfFile);
    
    const response = await fetch(`${api_base}/pdf/convert-to-images`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to convert PDF to images: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Convert base64 images to File objects
    const imageFiles = [];
    if (result.images && Array.isArray(result.images)) {
      for (let i = 0; i < result.images.length; i++) {
        const imageData = result.images[i];
        try {
          // Convert base64 to blob
          const base64Data = imageData.replace(/^data:image\/[^;]+;base64,/, '');
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j);
          }
          const blob = new Blob([bytes], { type: 'image/png' });
          const fileName = `${pdfFile.name.replace(/\.pdf$/i, '')}_page_${i + 1}.png`;
          const file = new File([blob], fileName, { type: 'image/png' });
          imageFiles.push(file);
        } catch (error) {
          console.error(`Error converting page ${i + 1} to file:`, error);
          throw new Error(`Failed to convert page ${i + 1} to image file`);
        }
      }
    }
    
    console.log(`Successfully converted ${imageFiles.length} pages to images`);
    return imageFiles;
    
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw error;
  }
};

// Enhanced multi-image processing that handles both regular images and PDF pages
const processMultipleImages = async (files, language, fields, isPdf = false) => {
  console.log("Entered");
  if (!files || files.length === 0) return;

  setIsProcessingMultiImage(true);
  setMultiImageError('');
  setMultiImageErrorDetails(null);
  setMultiImageResults({});
  setCurrentImageIndex(0);

  const results = {};
  let hasErrors = false;

  // Helper to normalize/process a successful result
  const processSuccessResult = (key, fileName, fileIndex, resultObj) => {
    const mapped = resultObj.mapped_fields || {};
    const unwrapped = {};
    const confidence = {};

    Object.keys(mapped).forEach((k) => {
      unwrapped[k] = mapped[k];
    });

    if (Array.isArray(resultObj.detections)) {
      resultObj.detections.forEach((detection) => {
        Object.keys(unwrapped).forEach((fieldKey) => {
          // match detected text with extracted value to attach confidence
          if (unwrapped[fieldKey] === detection.text) {
            confidence[fieldKey] = detection.confidence;
          }
        });
      });
    }

    results[key] = {
      fileName,
      fileIndex,
      extractedData: unwrapped,
      confidenceData: confidence,
      overlayImage: resultObj.confidence_overlay,
      detections: Array.isArray(resultObj.detections) ? resultObj.detections : [],
      hasError: false
    };
  };

  try {
    let filesToProcess = files;
    let keyPrefix = 'image';
    
    // If it's a PDF, convert pages to images first
    if (isPdf && files.length === 1) {
      const pdfFile = files[0];
      console.log(`Processing PDF: ${pdfFile.name} - Converting pages to images first`);
      
      try {
        filesToProcess = await convertPdfPagesToImages(pdfFile);
        keyPrefix = 'image';
        console.log(`PDF converted to ${filesToProcess.length} image files`);
      } catch (error) {
        throw new Error(`PDF conversion failed: ${error.message}`);
      }
    }
    // Now process all files (either original images or converted PDF pages) as regular images
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const fileKey = `${keyPrefix}_${i + 1}`;

      try {
        console.log(`Processing ${keyPrefix} ${i + 1}/${filesToProcess.length}: ${file.name}`);

        const result = await extractOCRDataWithDetection(file, language, fields);

        if (result.error) {
          results[fileKey] = {
            fileName: file.name,
            fileIndex: i,
            error: result.error,
            hasError: true
          };
          hasErrors = true;
        } else {
          processSuccessResult(fileKey, file.name, i, result);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results[fileKey] = {
          fileName: file.name,
          fileIndex: i,
          error: error.message || 'Processing failed',
          hasError: true
        };
        hasErrors = true;
      }
    }

    setMultiImageResults(results);
    console.log("Results");
    console.log(results);

    if (hasErrors) {
      const errorCount = Object.values(results).filter(r => r.hasError).length;
      const successCount = Object.keys(results).length - errorCount;
      const itemType = isPdf ? 'pages' : 'images';
      const total = Object.keys(results).length;
      setMultiImageError(`Processed ${successCount}/${total} ${itemType} successfully. ${errorCount} ${itemType} failed.`);
    }

  } catch (error) {
    const errorMsg = error.message || (isPdf ? 'PDF processing failed' : 'Multi-image processing failed');
    setMultiImageError(errorMsg);
    setMultiImageErrorDetails(parseErrorMessage(errorMsg));
  } finally {
    setIsProcessingMultiImage(false);
  }
};

  const navigateToImage = (index) => {
    const totalImages = Object.keys(multiImageResults).length;
    if (index >= 0 && index < totalImages) {
      setCurrentImageIndex(index);
    }
  };

  const nextImage = () => {
    const totalImages = Object.keys(multiImageResults).length;
    if (currentImageIndex < totalImages - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const updateImageField = (imageIndex, fieldId, value) => {
    const imageKey = `image_${imageIndex}`;
    setMultiImageResults(prev => ({
      ...prev,
      [imageKey]: {
        ...prev[imageKey],
        extractedData: {
          ...prev[imageKey]?.extractedData,
          [fieldId]: value
        }
      }
    }));
  };

  const clearMultiImageResults = () => {
    setMultiImageResults({});
    setCurrentImageIndex(0);
    setMultiImageError('');
    setMultiImageErrorDetails(null);
  };

  const handleDismissMultiImageError = () => {
    setMultiImageError('');
    setMultiImageErrorDetails(null);
  };

  const clearAllExtractions = () => {
    clearExtraction();
    clearVerificationResult();
    clearMultiImageResults();
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
      default: return 'Dashboard';
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
              multiImageData={multiImageResults}
              currentImageIndex={currentImageIndex}
              isProcessingMultiImage={isProcessingMultiImage}
              multiImageError={multiImageError}
              multiImageErrorDetails={multiImageErrorDetails}
              onProcessMultipleImages={processMultipleImages}
              onNavigateToImage={navigateToImage}
              onNextImage={nextImage}
              onPrevImage={prevImage}
              onDismissMultiImageError={handleDismissMultiImageError}
              onUpdateImageField={updateImageField}
              onClearMultiImageResults={clearMultiImageResults}
              onFieldChange={handleFieldChange}
            />
          )}

          {activeTab === 'verification' && (
            <VerificationTab
              onRemoveFile={removeFile}
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