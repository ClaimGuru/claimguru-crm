import { workingPdfService, PDFExtractionResult } from './workingPdfService';

class PdfExtractionService {
  async extractFromPDF(file: File, organizationId: string): Promise<PDFExtractionResult> {
    // Use the working PDF service to extract data
    return workingPdfService.extractTextFromPDF(file);
  }
}

export const pdfExtractionService = new PdfExtractionService();
export type { PDFExtractionResult };