export const parseErrorMessage = (errorMsg) => {
    try {
      const qualityReportMatch = errorMsg.match(/\(Quality Report: ({.*?})\)/);
      if (qualityReportMatch) {
        const mainError = errorMsg.replace(/\s*\(Quality Report:.*?\)/, '');
        const qualityData = JSON.parse(qualityReportMatch[1]);
        return {
          message: mainError,
          quality: qualityData
        };
      }
      return { message: errorMsg };
    } catch (e) {
      return { message: errorMsg };
    }
  };
  