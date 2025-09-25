import { useState } from 'react';
import { extractMultipageOCRData } from '../utils/apiService';
import { parseErrorMessage } from '../utils/errorHandling';
import { englishToChineseKey } from '../constants/fields';

export const useMultipageOCR = (selectedTemplate) => {
  const [multipageData, setMultipageData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageConfidenceData, setPageConfidenceData] = useState({});
  const [isExtractingMultipage, setIsExtractingMultipage] = useState(false);
  const [multipageError, setMultipageError] = useState('');
  const [multipageErrorDetails, setMultipageErrorDetails] = useState(null);

  const handleMultipageExtract = async (file) => {
    if (!file) return;
    
    setIsExtractingMultipage(true);
    setMultipageError('');
    setMultipageErrorDetails(null);
    setMultipageData({});
    setPageConfidenceData({});
    
    try {
      const data = await extractMultipageOCRData(file);

      if (data.error) {
        console.warn("Multipage OCR Quality Issue:", data.error, data.quality);
        const errorMsg = `${data.error} (Quality Report: ${JSON.stringify(data.quality)})`;
        setMultipageError(errorMsg);
        setMultipageErrorDetails(parseErrorMessage(errorMsg));
        return;
      }

      // Expected response format:
      // {
      //   total_pages: 3,
      //   pages: {
      //     1: { mapped_fields: {...}, confidence: {...} },
      //     2: { mapped_fields: {...}, confidence: {...} },
      //     3: { mapped_fields: {...}, confidence: {...} }
      //   }
      // }

      const pages = data.pages || {};
      const processedPages = {};
      const confidencePages = {};

      Object.keys(pages).forEach(pageNum => {
        const pageData = pages[pageNum];
        const mapped = pageData?.mapped_fields.mapped_fields || {};
        
        const unwrapped = {};
        const confidence = {};
        
        Object.keys(mapped).forEach((key) => {
          unwrapped[key] = mapped[key]?.value || null;
          confidence[key] = mapped[key]?.confidence || null;
        });

        if (selectedTemplate === 'chinese') {
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
          processedPages[pageNum] = transformed;
          confidencePages[pageNum] = transformedConfidence;
        } else {
          processedPages[pageNum] = unwrapped;
          confidencePages[pageNum] = confidence;
        }
      });

      setMultipageData(processedPages);
      setPageConfidenceData(confidencePages);
      setTotalPages(data.total_pages || Object.keys(pages).length);
      setCurrentPage(1);

    } catch (err) {
      setMultipageError('Failed to extract multipage document. Please try again.');
      console.error(err);
    } finally {
      setIsExtractingMultipage(false);
    }
  };

  const clearMultipageExtraction = () => {
    setMultipageData({});
    setPageConfidenceData({});
    setCurrentPage(1);
    setTotalPages(0);
    setMultipageError('');
    setMultipageErrorDetails(null);
  };

  const handleDismissMultipageError = () => {
    setMultipageError('');
    setMultipageErrorDetails(null);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const updatePageField = (pageNum, fieldId, value) => {
    setMultipageData(prev => ({
      ...prev,
      [pageNum]: {
        ...prev[pageNum],
        [fieldId]: value
      }
    }));
  };

  return {
    multipageData,
    currentPage,
    totalPages,
    pageConfidenceData,
    isExtractingMultipage,
    multipageError,
    multipageErrorDetails,
    handleMultipageExtract,
    clearMultipageExtraction,
    handleDismissMultipageError,
    goToPage,
    nextPage,
    prevPage,
    updatePageField,
    getCurrentPageData: () => multipageData[currentPage] || {},
    getCurrentPageConfidence: () => pageConfidenceData[currentPage] || {}
  };
};
