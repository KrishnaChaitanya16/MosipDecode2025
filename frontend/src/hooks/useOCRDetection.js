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

  const extractWithDetection = async (file, language, fields) => {
    if (!file) return;

    setIsExtracting(true);
    setError('');
    setErrorDetails(null);
    
    try {
      const result = await extractOCRDataWithDetection(file, language, fields);
      
      if (result.error) {
        const errorMsg = result.error;
        setError(errorMsg);
        setErrorDetails(parseErrorMessage(errorMsg));
        return;
      }
      
      // Handle new format where mapped_fields contains direct values
      const mapped = result.mapped_fields || {};
      const unwrapped = {};
      const confidence = {};
      
      // Since mapped_fields now contains direct values, just use them as is
      Object.keys(mapped).forEach((key) => {
        unwrapped[key] = mapped[key]; // Direct value, no .value property
      });

      // Extract confidence data from detections array
      // Match field names with detection text to get confidence scores
      if (Array.isArray(result.detections)) {
        result.detections.forEach((detection) => {
          // Try to match detection text with field values to assign confidence
          Object.keys(unwrapped).forEach((fieldKey) => {
            if (unwrapped[fieldKey] === detection.text) {
              confidence[fieldKey] = detection.confidence;
            }
          });
        });
      }

      setExtractedData(unwrapped);
      setConfidenceData(confidence);
      setOverlayImage(result.confidence_overlay);
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
