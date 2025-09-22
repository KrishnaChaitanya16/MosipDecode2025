import { useState } from 'react';
import { extractMultipagePdfData } from '../utils/apiService';
import { parseErrorMessage } from '../utils/errorHandling';

export const useMultipagePdf = () => {
    const [multipageResults, setMultipageResults] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState(null);

    const processMultipagePdf = async (file, language) => {
        if (!file) return;

        setIsProcessing(true);
        setError('');
        setErrorDetails(null);
        setMultipageResults(null);

        try {
            const result = await extractMultipagePdfData(file, language);

            if (result.error) {
                setError(result.error);
                setErrorDetails(parseErrorMessage(result.error));
                return;
            }

            // Unpack nested data for easier frontend consumption
            const pages = {};
            if (result.pages) {
                Object.keys(result.pages).forEach(pageNum => {
                    const pageData = result.pages[pageNum];
                    if (pageData.error) {
                        pages[pageNum] = { error: pageData.error };
                        return;
                    }

                    const mapped = pageData.mapped_fields || {};
                    const unwrapped = {};
                    const confidence = {};

                    Object.keys(mapped).forEach((key) => {
                        unwrapped[key] = mapped[key]?.value ?? null;
                        confidence[key] = mapped[key]?.confidence ?? null;
                    });
                    pages[pageNum] = { data: unwrapped, confidence };
                });
            }
            
            setMultipageResults({ totalPages: result.total_pages, pages });

        } catch (err) {
            const errorMsg = err.message || 'Failed to process multipage PDF.';
            setError(errorMsg);
            setErrorDetails(parseErrorMessage(errorMsg));
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const clearResults = () => {
        setMultipageResults(null);
        setError('');
        setErrorDetails(null);
    };

    const handleDismissError = () => {
        setError('');
        setErrorDetails(null);
    };

    return {
        multipageResults,
        isProcessing,
        error,
        errorDetails,
        processMultipagePdf,
        clearResults,
        handleDismissError,
    };
};
