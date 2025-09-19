import { useState } from 'react';
import { extractOCRData } from '../utils/apiService';
import { parseErrorMessage } from '../utils/errorHandling';
import { englishToChineseKey } from '../constants/fields';

export const useOCRExtraction = (selectedTemplate) => {
  const [extractedData, setExtractedData] = useState({});
  const [confidenceData, setConfidenceData] = useState({});
  const [hasExtractedData, setHasExtractedData] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);

  const handleExtract = async (file) => {
    if (!file) return;
    
    setIsExtracting(true);
    setExtractError('');
    setErrorDetails(null);
    
    try {
      const data = await extractOCRData(file);

      if (data.error) {
        console.warn("OCR Quality Issue:", data.error, data.quality);
        const errorMsg = `${data.error} (Quality Report: ${JSON.stringify(data.quality)})`;
        setExtractError(errorMsg);
        setErrorDetails(parseErrorMessage(errorMsg));
        return;
      }

      const mapped = data && data.mapped_fields ? data.mapped_fields : {};
      const unwrapped = {};
      const confidence = {};
      
      Object.keys(mapped).forEach((key) => {
        unwrapped[key] = mapped[key]?.value || null;
        confidence[key] = mapped[key]?.confidence || null;
      });

      const hasData = Object.values(unwrapped).some(value => 
        value !== null && value !== '' && value !== undefined
      );
      
      if (selectedTemplate === 'english') {
        setExtractedData(prev => ({ ...prev, ...unwrapped }));
        setConfidenceData(prev => ({ ...prev, ...confidence }));
      } else {
        const transformed = {};
        const transformedConfidence = {};
        Object.keys(unwrapped).forEach((key) => {
          const chineseKey = englishToChineseKey[key];
          if (chineseKey) {
            transformed[chineseKey] = unwrapped[key];
            transformedConfidence[chineseKey] = confidence[key];
          } else if (Object.prototype.hasOwnProperty.call(unwrapped, key)) {
            transformed[key] = unwrapped[key];
            transformedConfidence[key] = confidence[key];
          }
        });
        setExtractedData(prev => ({ ...prev, ...transformed }));
        setConfidenceData(prev => ({ ...prev, ...transformedConfidence }));
      }
      
      setHasExtractedData(hasData);

    } catch (err) {
      setExtractError('Failed to extract. Please try again.');
      setHasExtractedData(false);
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const clearExtraction = () => {
    setExtractedData({});
    setConfidenceData({});
    setHasExtractedData(false);
    setExtractError('');
    setErrorDetails(null);
  };

  const handleDismissError = () => {
    setExtractError('');
    setErrorDetails(null);
  };

  return {
    extractedData,
    confidenceData,
    hasExtractedData,
    isExtracting,
    extractError,
    errorDetails,
    handleExtract,
    clearExtraction,
    handleDismissError,
    setExtractedData,
    setConfidenceData // Add this line
  };
};
