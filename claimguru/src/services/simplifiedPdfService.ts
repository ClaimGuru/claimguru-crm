import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
} catch (error) {
  console.warn('Failed to load PDF.js worker from CDN, using local fallback');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js';
}

export interface SimplifiedPdfResult {
  success: boolean;
  extractedText: string;
  pageCount: number;
  error?: string;
  processingTimeMs: number;
}

/**
 * Extracts text from a PDF file using PDF.js
 * This is a simplified version that works entirely client-side for maximum reliability
 */
export const extractTextFromPdf = async (file: File): Promise<SimplifiedPdfResult> => {
  const startTime = performance.now();
  let result: SimplifiedPdfResult = {
    success: false,
    extractedText: '',
    pageCount: 0,
    processingTimeMs: 0
  };
  
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // Load the PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    result.pageCount = pdf.numPages;
    
    // Extract text from each page
    let extractedText = '';
    const maxPages = Math.min(pdf.numPages, 20); // Limit to 20 pages for performance
    
    for (let i = 1; i <= maxPages; i++) {
      try {
        // Get the page
        const page = await pdf.getPage(i);
        
        // Get the text content
        const textContent = await page.getTextContent();
        
        // Join the text items
        const pageText = textContent.items
          .map(item => 'str' in item ? item.str : '')
          .join(' ');
        
        extractedText += pageText + '\n\n';
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i}:`, pageError);
      }
    }
    
    result.extractedText = extractedText;
    result.success = true;
  } catch (error) {
    console.error('Error in PDF extraction:', error);
    result.error = error instanceof Error ? error.message : 'Unknown error occurred';
  } finally {
    result.processingTimeMs = performance.now() - startTime;
  }
  
  return result;
};

/**
 * Extracts policy information from extracted text
 */
export const extractPolicyInfo = (text: string) => {
  return {
    policyNumber: extractPolicyNumber(text) || "Not found",
    insuredName: extractInsuredName(text) || "Not found",
    effectiveDate: extractDate(text, 'effective') || "Not found",
    expirationDate: extractDate(text, 'expiration') || "Not found",
    insurerName: extractInsurerName(text) || "Not found",
    propertyAddress: extractPropertyAddress(text) || "Not found",
    coverageAmount: extractCoverageAmount(text) || "Not found",
    deductible: extractDeductible(text) || "Not found",
    extractionConfidence: calculateConfidence(text),
    extractedText: text.substring(0, 1000) + '...' // Store a portion of the raw text
  };
};

// Helper function to read file as ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

// Calculate confidence based on how many fields were successfully extracted
const calculateConfidence = (text: string): number => {
  let score = 0.4; // Base confidence
  
  if (extractPolicyNumber(text)) score += 0.1;
  if (extractInsuredName(text)) score += 0.1;
  if (extractDate(text, 'effective')) score += 0.05;
  if (extractDate(text, 'expiration')) score += 0.05;
  if (extractInsurerName(text)) score += 0.1;
  if (extractPropertyAddress(text)) score += 0.1;
  if (extractCoverageAmount(text)) score += 0.05;
  if (extractDeductible(text)) score += 0.05;
  
  return Math.min(score, 1.0);
};

// Text extraction helper functions
const extractPolicyNumber = (text: string) => {
  // Try multiple patterns to increase chances of finding the policy number
  const patterns = [
    /policy\s*(?:number|#|no)[:.]?\s*([A-Z0-9\-_]{3,20})/i,
    /policy\s*(?:number|#|no)?[:.]?\s*([A-Z0-9\-_]{3,20})/i,
    /(?:number|#|no)[:.]?\s*([A-Z0-9\-_]{3,20})/i,
    /([A-Z0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{3})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

const extractInsuredName = (text: string) => {
  // Try multiple patterns to increase chances of finding the insured name
  const patterns = [
    /insured(?:'s)?\s*(?:name)?[:.]?\s*([A-Z][A-Za-z\s,\.&'-]{2,50})/i,
    /named\s*insured[:.]?\s*([A-Z][A-Za-z\s,\.&'-]{2,50})/i,
    /insured[:.]?\s*([A-Z][A-Za-z\s,\.&'-]{2,50})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

const extractDate = (text: string, type: 'effective' | 'expiration') => {
  // Try to find policy period first
  const policyPeriodPattern = /policy\s*period[:.]?\s*([A-Za-z0-9\s,\./-]{2,20})\s*(?:to|through|thru|-)\s*([A-Za-z0-9\s,\./-]{2,20})/i;
  const policyPeriodMatch = text.match(policyPeriodPattern);
  
  if (policyPeriodMatch) {
    return type === 'effective' ? policyPeriodMatch[1].trim() : policyPeriodMatch[2].trim();
  }
  
  // Try specific effective/expiration date patterns
  const patterns = type === 'effective' 
    ? [
        /effective\s*date[:.]?\s*([A-Za-z0-9\s,\./-]{2,20})/i,
        /policy\s*effective[:.]?\s*([A-Za-z0-9\s,\./-]{2,20})/i,
        /inception\s*date[:.]?\s*([A-Za-z0-9\s,\./-]{2,20})/i
      ]
    : [
        /expiration\s*date[:.]?\s*([A-Za-z0-9\s,\./-]{2,20})/i,
        /policy\s*expiration[:.]?\s*([A-Za-z0-9\s,\./-]{2,20})/i,
        /expiry\s*date[:.]?\s*([A-Za-z0-9\s,\./-]{2,20})/i
      ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Try to find dates in standard formats
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
    /\d{1,2}-\d{1,2}-\d{2,4}/g,
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/gi
  ];
  
  let dates: string[] = [];
  
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      dates = dates.concat(matches);
    }
  }
  
  // If we found at least two dates, assume first is effective, second is expiration
  if (dates.length >= 2) {
    return type === 'effective' ? dates[0] : dates[1];
  }
  
  return null;
};

const extractInsurerName = (text: string) => {
  // Try multiple patterns to increase chances of finding the insurer name
  const patterns = [
    /insurance\s*company[:.]?\s*([A-Z][A-Za-z\s,\.&'-]{2,50})/i,
    /insurer[:.]?\s*([A-Z][A-Za-z\s,\.&'-]{2,50})/i,
    /underwritten\s*by[:.]?\s*([A-Z][A-Za-z\s,\.&'-]{2,50})/i,
    /issued\s*by[:.]?\s*([A-Z][A-Za-z\s,\.&'-]{2,50})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Try to find common insurance company names
  const commonInsurers = [
    'Allstate', 'State Farm', 'Liberty Mutual', 'Farmers', 'Nationwide',
    'Progressive', 'USAA', 'Travelers', 'American Family', 'Geico', 'Hartford',
    'Chubb', 'Erie', 'Amica', 'Auto-Owners'
  ];
  
  for (const insurer of commonInsurers) {
    if (text.includes(insurer)) {
      // Try to get the full name by extracting context
      const index = text.indexOf(insurer);
      const start = Math.max(0, index - 20);
      const end = Math.min(text.length, index + insurer.length + 30);
      const context = text.substring(start, end);
      
      // Try to extract a company name from the context
      const companyMatch = context.match(/([A-Z][A-Za-z\s]{0,20}\s+(?:Insurance|Mutual|Casualty|Indemnity|Underwriters|Company)(?:\s+[A-Za-z\s,\.&'-]{0,30})?)/);
      if (companyMatch) {
        return companyMatch[1].trim();
      }
      
      return insurer;
    }
  }
  
  return null;
};

const extractPropertyAddress = (text: string) => {
  // Try multiple patterns to increase chances of finding the property address
  const patterns = [
    /property\s*address[:.]?\s*([0-9]+[A-Za-z0-9\s,\.#-]{5,100})/i,
    /(?:insured|risk)\s*(?:location|address|property)[:.]?\s*([0-9]+[A-Za-z0-9\s,\.#-]{5,100})/i,
    /location\s*(?:of|address)[:.]?\s*([0-9]+[A-Za-z0-9\s,\.#-]{5,100})/i,
    /premises\s*address[:.]?\s*([0-9]+[A-Za-z0-9\s,\.#-]{5,100})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Try to clean up the address by removing extra whitespace and limiting length
      const address = match[1].replace(/\s+/g, ' ').trim();
      
      // Try to find the end of the address (usually ends with a zip code or state abbreviation)
      const zipMatch = address.match(/([0-9]{5}(?:-[0-9]{4})?)/);
      const stateMatch = address.match(/\b([A-Z]{2})\b/);
      
      if (zipMatch) {
        const zipIndex = address.indexOf(zipMatch[0]) + zipMatch[0].length;
        return address.substring(0, zipIndex);
      } else if (stateMatch) {
        const stateIndex = address.indexOf(stateMatch[0]) + stateMatch[0].length;
        return address.substring(0, stateIndex);
      }
      
      // If we can't find a clean end, limit to a reasonable length
      return address.length > 100 ? address.substring(0, 100) + '...' : address;
    }
  }
  
  return null;
};

const extractCoverageAmount = (text: string) => {
  // Try to find coverage amounts in various formats
  const patterns = [
    /dwelling(?:\s*coverage)?(?:\s*limit)?[:.]?\s*\$?([0-9,]+)/i,
    /coverage\s*a[:.]?\s*\$?([0-9,]+)/i,
    /building(?:\s*coverage)?(?:\s*limit)?[:.]?\s*\$?([0-9,]+)/i,
    /property\s*(?:value|coverage)[:.]?\s*\$?([0-9,]+)/i,
    /(?:insured|insurable)\s*value[:.]?\s*\$?([0-9,]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return '$' + match[1].trim();
    }
  }
  
  return null;
};

const extractDeductible = (text: string) => {
  // Try to find deductible amounts in various formats
  const patterns = [
    /deductible[:.]?\s*\$?([0-9,]+)/i,
    /all\s*(?:other\s*)?perils\s*deductible[:.]?\s*\$?([0-9,]+)/i,
    /aop\s*deductible[:.]?\s*\$?([0-9,]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return '$' + match[1].trim();
    }
  }
  
  return null;
};