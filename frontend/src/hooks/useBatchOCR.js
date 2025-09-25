import { useState } from 'react';
import { extractOCRData, extractMultipageOCRData } from '../utils/apiService';
import { parseErrorMessage } from '../utils/errorHandling';
import { englishToChineseKey } from '../constants/fields';

export const useBatchOCR = (selectedTemplate) => {
  const [batchResults, setBatchResults] = useState({});
  const [batchProgress, setBatchProgress] = useState({ processed: 0, total: 0 });
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchErrors, setBatchErrors] = useState({});
  const [currentlyProcessing, setCurrentlyProcessing] = useState(null);

  const processBatch = async (files, isMultipage = false) => {
    if (!files || files.length === 0) return;

    setIsBatchProcessing(true);
    setBatchResults({});
    setBatchErrors({});
    setBatchProgress({ processed: 0, total: files.length });
    
    const results = {};
    const errors = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileKey = `${file.name}_${i}`;
      
      setCurrentlyProcessing(file.name);
      setBatchProgress(prev => ({ ...prev, processed: i }));

      try {
        let data;
        if (isMultipage) {
          data = await extractMultipageOCRData(file);
        } else {
          data = await extractOCRData(file);
        }

        if (data.error) {
          errors[fileKey] = {
            fileName: file.name,
            error: data.error,
            errorDetails: parseErrorMessage(data.error)
          };
          continue;
        }

        // Process the results based on single page or multipage
        if (isMultipage && data.pages) {
          const processedPages = {};
          Object.keys(data.pages).forEach(pageNum => {
            const pageData = data.pages[pageNum];
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
                } else {
                  transformed[key] = unwrapped[key];
                  transformedConfidence[key] = confidence[key];
                }
              });
              processedPages[pageNum] = { data: transformed, confidence: transformedConfidence };
            } else {
              processedPages[pageNum] = { data: unwrapped, confidence: confidence };
            }
          });

          results[fileKey] = {
            fileName: file.name,
            type: 'multipage',
            totalPages: data.total_pages,
            pages: processedPages
          };
        } else {
          // Single page processing
          const mapped = data.mapped_fields.mapped_fields || {};
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
              } else {
                transformed[key] = unwrapped[key];
                transformedConfidence[key] = confidence[key];
              }
            });
            results[fileKey] = {
              fileName: file.name,
              type: 'single',
              data: transformed,
              confidence: transformedConfidence
            };
          } else {
            results[fileKey] = {
              fileName: file.name,
              type: 'single',
              data: unwrapped,
              confidence: confidence
            };
          }
        }

      } catch (error) {
        errors[fileKey] = {
          fileName: file.name,
          error: `Processing failed: ${error.message}`,
          errorDetails: { message: error.message }
        };
      }
    }

    setBatchResults(results);
    setBatchErrors(errors);
    setBatchProgress({ processed: files.length, total: files.length });
    setCurrentlyProcessing(null);
    setIsBatchProcessing(false);
  };

  const clearBatchResults = () => {
    setBatchResults({});
    setBatchErrors({});
    setBatchProgress({ processed: 0, total: 0 });
    setCurrentlyProcessing(null);
  };

  return {
    batchResults,
    batchProgress,
    isBatchProcessing,
    batchErrors,
    currentlyProcessing,
    processBatch,
    clearBatchResults
  };
};
