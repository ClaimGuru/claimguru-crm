/**
 * Document Upload Service
 * 
 * Handles document upload to Supabase storage and tracking
 */

export interface UploadedDocument {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  publicUrl: string
  documentType: 'policy' | 'claim' | 'estimate' | 'photo' | 'other'
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed'
  extractedData?: any
}

class DocumentUploadService {
  private supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  private supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  constructor() {
    console.log('DocumentUploadService initialized')
  }

  /**
   * Upload document to Supabase storage
   */
  async uploadDocument(
    file: File, 
    documentType: UploadedDocument['documentType'] = 'other',
    claimId?: string
  ): Promise<UploadedDocument> {
    try {
      // Check if Supabase is configured
      if (!this.supabaseUrl || !this.supabaseKey || this.supabaseUrl === 'undefined') {
        throw new Error('Supabase configuration not available. Please configure environment variables or use client-side processing.')
      }

      // Generate unique filename
      const timestamp = Date.now()
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${timestamp}_${cleanFileName}`
      const filePath = `${documentType}s/${fileName}`

      console.log(`Uploading ${file.name} to ${filePath}`)

      // Upload to Supabase storage
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch(
        `${this.supabaseUrl}/storage/v1/object/policy-documents/${filePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
          },
          body: file
        }
      )

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${errorText}`)
      }

      // Get public URL
      const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/policy-documents/${filePath}`

      // Create document record
      const document: UploadedDocument = {
        id: `doc_${timestamp}`,
        fileName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        publicUrl,
        documentType,
        extractionStatus: 'pending'
      }

      // Store document metadata in database
      await this.storeDocumentMetadata(document, claimId)

      console.log('Document uploaded successfully:', document)
      return document

    } catch (error) {
      console.error('Document upload failed:', error)
      throw error
    }
  }

  /**
   * Store document metadata in database
   */
  private async storeDocumentMetadata(document: UploadedDocument, claimId?: string): Promise<void> {
    try {
      const documentData = {
        id: document.id,
        file_name: document.fileName,
        file_path: document.filePath,
        file_size: document.fileSize,
        mime_type: document.mimeType,
        uploaded_at: document.uploadedAt,
        public_url: document.publicUrl,
        document_type: document.documentType,
        extraction_status: document.extractionStatus,
        claim_id: claimId,
        created_at: new Date().toISOString()
      }

      const response = await fetch(`${this.supabaseUrl}/rest/v1/documents`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(documentData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn('Failed to store document metadata:', errorText)
        // Don't throw error - document is still uploaded to storage
      }
    } catch (error) {
      console.warn('Failed to store document metadata:', error)
      // Don't throw error - document is still uploaded to storage
    }
  }

  /**
   * Update document extraction status
   */
  async updateExtractionStatus(
    documentId: string, 
    status: UploadedDocument['extractionStatus'],
    extractedData?: any
  ): Promise<void> {
    try {
      const updateData: any = {
        extraction_status: status,
        updated_at: new Date().toISOString()
      }

      if (extractedData) {
        updateData.extracted_data = extractedData
      }

      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/documents?id=eq.${documentId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      )

      if (!response.ok) {
        console.warn('Failed to update extraction status:', await response.text())
      }
    } catch (error) {
      console.warn('Failed to update extraction status:', error)
    }
  }

  /**
   * Get documents for a claim
   */
  async getClaimDocuments(claimId: string): Promise<UploadedDocument[]> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/documents?claim_id=eq.${claimId}&select=*`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.map(this.mapDocumentFromDB)
      }
      
      return []
    } catch (error) {
      console.error('Failed to fetch claim documents:', error)
      return []
    }
  }

  /**
   * Get recent documents
   */
  async getRecentDocuments(limit: number = 20): Promise<UploadedDocument[]> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/documents?select=*&order=uploaded_at.desc&limit=${limit}`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.map(this.mapDocumentFromDB)
      }
      
      return []
    } catch (error) {
      console.error('Failed to fetch recent documents:', error)
      return []
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Get document info first
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/documents?id=eq.${documentId}&select=file_path`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const documents = await response.json()
        if (documents.length > 0) {
          const filePath = documents[0].file_path

          // Delete from storage
          const deleteResponse = await fetch(
            `${this.supabaseUrl}/storage/v1/object/policy-documents/${filePath}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${this.supabaseKey}`,
              }
            }
          )

          // Delete from database
          await fetch(
            `${this.supabaseUrl}/rest/v1/documents?id=eq.${documentId}`,
            {
              method: 'DELETE',
              headers: {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`,
                'Content-Type': 'application/json'
              }
            }
          )

          return deleteResponse.ok
        }
      }
      
      return false
    } catch (error) {
      console.error('Failed to delete document:', error)
      return false
    }
  }

  /**
   * Map document from database format
   */
  private mapDocumentFromDB(dbDoc: any): UploadedDocument {
    return {
      id: dbDoc.id,
      fileName: dbDoc.file_name,
      filePath: dbDoc.file_path,
      fileSize: dbDoc.file_size,
      mimeType: dbDoc.mime_type,
      uploadedAt: dbDoc.uploaded_at,
      publicUrl: dbDoc.public_url,
      documentType: dbDoc.document_type,
      extractionStatus: dbDoc.extraction_status,
      extractedData: dbDoc.extracted_data
    }
  }

  /**
   * Process document with AI extraction
   */
  async processDocumentWithAI(document: UploadedDocument, documentType: string): Promise<any> {
    try {
      // Update status to processing
      await this.updateExtractionStatus(document.id, 'processing')

      // Create a File object from the public URL
      const response = await fetch(document.publicUrl)
      const blob = await response.blob()
      const file = new File([blob], document.fileName, { type: document.mimeType })

      // Call the processing edge function
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const processResponse = await fetch(
        `${this.supabaseUrl}/functions/v1/process-policy-document`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseKey}`,
          },
          body: formData
        }
      )

      if (processResponse.ok) {
        const result = await processResponse.json()
        
        // Update status to completed with extracted data
        await this.updateExtractionStatus(document.id, 'completed', result.data)
        
        return result.data
      } else {
        // Update status to failed
        await this.updateExtractionStatus(document.id, 'failed')
        throw new Error('Document processing failed')
      }
    } catch (error) {
      console.error('AI processing failed:', error)
      await this.updateExtractionStatus(document.id, 'failed')
      throw error
    }
  }
}

export const documentUploadService = new DocumentUploadService()
