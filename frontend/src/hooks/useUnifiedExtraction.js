import { useState } from 'react';
// Import both API functions we might need
import { extractMultipagePdfData, extractOCRDataWithDetection } from '../utils/apiService';

// Helper to convert a file to a Base64 data URL for display
const toDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
});

export const useUnifiedExtraction = () => {
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const clearResults = () => {
    setResults(null);
    setError(null);
    setProgress({ current: 0, total: 0 });
  };

  const processFiles = async (files, langCode, fieldNames) => {
    setIsProcessing(true);
    clearResults();

    try {
      let finalResult;

      // Case 1: A single PDF file is uploaded for multipage extraction
      if (files.length === 1 && files[0].type === 'application/pdf') {
        setProgress({ current: 1, total: 1 });
        const pdfFile = files[0];
        const apiResponse = await extractMultipagePdfData(pdfFile, langCode, fieldNames);
        
        // We need to structure this response to match the unified format
        finalResult = {
            unifiedData: apiResponse.all_pages_data || {},
            unifiedConfidence: apiResponse.all_pages_confidence || {},
            pages: apiResponse.pages.map(p => ({
                pageNum: p.page_number,
                originalImage: p.original_image, // Backend should return base64 images
                overlayImage: p.overlay_image,
                detections: p.detections || [],
            }))
        };
        setProgress({ current: 1, total: 1 });

      } else { // Case 2: Multiple image files are uploaded
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) throw new Error("No valid image files to process.");
        
        setProgress({ current: 0, total: imageFiles.length });
        const allPageResults = [];

        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          setProgress({ current: i + 1, total: imageFiles.length });

          const apiResult = await extractOCRDataWithDetection(imageFile, langCode, fieldNames);
          const originalImageSrc = await toDataURL(imageFile);

          allPageResults.push({
            pageNum: i + 1,
            originalImage: originalImageSrc,
            overlayImage: apiResult.overlay_image,
            data: apiResult.extracted_data,
            confidence: apiResult.confidence_scores,
            detections: apiResult.detections,
          });
        }
        
        // Aggregate the results from multiple single-page calls
        const unifiedData = {};
        const unifiedConfidence = {};
        const pages = allPageResults.map(p => {
            Object.assign(unifiedData, p.data);
            Object.assign(unifiedConfidence, p.confidence);
            return {
                pageNum: p.pageNum,
                originalImage: p.originalImage,
                overlayImage: p.overlayImage,
                detections: p.detections || [],
            };
        });
        finalResult = { unifiedData, unifiedConfidence, pages };
      }

      setResults(finalResult);

    } catch (err) {
      setError(err.message || 'An unknown error occurred during processing.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return { results, isProcessing, error, progress, processFiles, clearResults };
};