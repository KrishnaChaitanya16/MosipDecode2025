import { useState } from 'react';
import { extractOCRDataWithDetection } from '../utils/apiService';
import { parseErrorMessage } from '../utils/errorHandling';

export const useOCRDetection = () => {
  const [extractedData, setExtractedData] = useState(null);
  const [confidenceData, setConfidenceData] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);

  const extractWithDetection = async (file, language) => {
    if (!file) return;

    setIsExtracting(true);
    setError('');
    setErrorDetails(null);
    
    try {
      const result = await extractOCRDataWithDetection(file, language);
      
      if (result.error) {
        const errorMsg = result.error;
        setError(errorMsg);
        setErrorDetails(parseErrorMessage(errorMsg));
        return;
      }
      
      const mapped = result.mapped_fields.mapped_fields || {};
      const unwrapped = {};
      const confidence = {};
      
      Object.keys(mapped).forEach((key) => {
        unwrapped[key] = mapped[key]?.value ?? null;
        confidence[key] = mapped[key]?.confidence ?? null;
      });

      setExtractedData(unwrapped);
      setConfidenceData(confidence);
      setOverlayImage(result.confidence_overlay);
      // More robust check to ensure detections is always an array
      setDetections(Array.isArray(result.detections) ? result.detections : []);

    } catch (err) {
      const errorMsg = err.message || 'Extraction with detection failed.';
      setError(errorMsg);
      setErrorDetails(parseErrorMessage(errorMsg));
      console.error('Extraction with detection error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const clearExtraction = () => {
    setExtractedData(null);
    setConfidenceData(null);
    setOverlayImage(null);
    setDetections([]);
    setError('');
    setErrorDetails(null);
  };

  const handleDismissError = () => {
    setError('');
    setErrorDetails(null);
  };

  return {
    extractedData,
    confidenceData,
    overlayImage,
    detections,
    isExtracting,
    error,
    errorDetails,
    extractWithDetection,
    clearExtraction,
    handleDismissError,
  };
};

