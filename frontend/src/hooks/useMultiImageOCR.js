import { useState } from 'react';
import { extractOCRDataWithDetection } from '../utils/apiService';
import { parseErrorMessage } from '../utils/errorHandling';

export const useMultiImageOCR = () => {
  const [multiImageResults, setMultiImageResults] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessingMultiImage, setIsProcessingMultiImage] = useState(false);
  const [multiImageError, setMultiImageError] = useState('');
  const [multiImageErrorDetails, setMultiImageErrorDetails] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);

  const processMultipleImages = async (files, language = 'en', fields = null) => {
    if (!files || files.length === 0) return;

    setIsProcessingMultiImage(true);
    setMultiImageError('');
    setMultiImageErrorDetails(null);
    setMultiImageResults({});
    setProcessedFiles([]);
    setCurrentImageIndex(0);

    const results = {};
    const processedFilesList = [];
    let hasErrors = false;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `image_${i}`;
        
        try {
          console.log(`Processing image ${i + 1}/${files.length}: ${file.name}`);
          
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
            // Process the extracted data
            const mapped = result.mapped_fields || {};
            const unwrapped = {};
            const confidence = {};
            
            Object.keys(mapped).forEach((key) => {
              unwrapped[key] = mapped[key];
            });

            // Extract confidence data from detections array
            if (Array.isArray(result.detections)) {
              result.detections.forEach((detection) => {
                Object.keys(unwrapped).forEach((fieldKey) => {
                  if (unwrapped[fieldKey] === detection.text) {
                    confidence[fieldKey] = detection.confidence;
                  }
                });
              });
            }

            results[fileKey] = {
              fileName: file.name,
              fileIndex: i,
              extractedData: unwrapped,
              confidenceData: confidence,
              overlayImage: result.confidence_overlay,
              detections: Array.isArray(result.detections) ? result.detections : [],
              hasError: false
            };
          }
          
          processedFilesList.push({
            name: file.name,
            index: i,
            processed: true,
            hasError: results[fileKey].hasError
          });
          
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          results[fileKey] = {
            fileName: file.name,
            fileIndex: i,
            error: error.message || 'Processing failed',
            hasError: true
          };
          hasErrors = true;
          
          processedFilesList.push({
            name: file.name,
            index: i,
            processed: false,
            hasError: true
          });
        }
      }

      setMultiImageResults(results);
      setProcessedFiles(processedFilesList);
      
      if (hasErrors) {
        const errorCount = Object.values(results).filter(r => r.hasError).length;
        const successCount = files.length - errorCount;
        setMultiImageError(`Processed ${successCount}/${files.length} images successfully. ${errorCount} images failed.`);
      }
      
    } catch (error) {
      const errorMsg = error.message || 'Multi-image processing failed';
      setMultiImageError(errorMsg);
      setMultiImageErrorDetails(parseErrorMessage(errorMsg));
      console.error('Multi-image processing error:', error);
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

  const getCurrentImageData = () => {
    const imageKey = `image_${currentImageIndex}`;
    return multiImageResults[imageKey] || null;
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
    setProcessedFiles([]);
  };

  const handleDismissError = () => {
    setMultiImageError('');
    setMultiImageErrorDetails(null);
  };

  return {
    multiImageResults,
    currentImageIndex,
    isProcessingMultiImage,
    multiImageError,
    multiImageErrorDetails,
    processedFiles,
    processMultipleImages,
    navigateToImage,
    nextImage,
    prevImage,
    getCurrentImageData,
    updateImageField,
    clearMultiImageResults,
    handleDismissError,
    totalImages: Object.keys(multiImageResults).length,
    hasResults: Object.keys(multiImageResults).length > 0
  };
};