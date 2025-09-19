import { useState } from 'react';
import { detectTextRegions, extractOCRDataWithDetection } from '../utils/apiService';

export const useOCRDetection = () => {
  const [detectionData, setDetectionData] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState('');

  const detectTextRegionsOnly = async (file) => {
    if (!file) return;

    setIsDetecting(true);
    setDetectionError('');
    
    try {
      const result = await detectTextRegions(file);
      setDetectionData(result.detections || []);
      setOverlayImage(result.confidence_overlay);

    } catch (error) {
      setDetectionError(error.message || 'Detection failed');
      console.error('Detection error:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const extractWithDetection = async (file) => {
    if (!file) return null;

    setIsDetecting(true);
    setDetectionError('');
    
    try {
      const result = await extractOCRDataWithDetection(file);
      
      if (result.has_detection_data) {
        setDetectionData(result.detections || []);
        setOverlayImage(result.confidence_overlay);
      }

      return result;

    } catch (error) {
      setDetectionError(error.message || 'Extraction with detection failed');
      console.error('Extraction with detection error:', error);
      throw error;
    } finally {
      setIsDetecting(false);
    }
  };

  const clearDetection = () => {
    setDetectionData(null);
    setOverlayImage(null);
    setDetectionError('');
  };

  return {
    detectionData,
    overlayImage,
    isDetecting,
    detectionError,
    detectTextRegions: detectTextRegionsOnly,
    extractWithDetection,
    clearDetection
  };
};
