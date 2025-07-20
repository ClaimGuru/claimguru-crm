/**
 * Document Upload Service
 * 
 * Handles document upload to Supabase storage and tracking
 * SECURITY: Uses proper Supabase client with RLS policies
 */

import { supabase } from '../lib/supabase'

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

  constructor() {
    console.log('DocumentUploadService initialized with proper RLS security')
  }

  /**
   * Upload document to Supabase storage using authenticated client
   * SECURITY: Uses RLS-enabled Supabase client
   */
  async uploadDocument(
    file: File, 
    documentType: UploadedDocument['documentType'] = 'other',
    claimId?: string
  ): Promise<UploadedDocument> {
    try {
      // Get current user session for security
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required for document upload')
      }

      // Generate unique filename
      const timestamp = Date.now()
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const fileName = `${timestamp}_${cleanFileName}`
      const filePath = `${documentType}s/${fileName}`

      console.log(`Uploading ${file.name} to ${filePath} (authenticated)`)

      // Upload to Supabase storage using authenticated client
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('policy-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL using authenticated client
      const { data: { publicUrl } } = supabase.storage
        .from('policy-documents')
        .getPublicUrl(filePath)

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
   * Store document metadata in database using RLS-enabled client
   * SECURITY: Uses authenticated Supabase client with RLS policies
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

      const { error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single()

      if (error) {
        console.warn('Failed to store document metadata:', error.message)
        // Don't throw error - document is still uploaded to storage
      }
    } catch (error) {
      console.warn('Failed to store document metadata:', error)
      // Don't throw error - document is still uploaded to storage
    }
  }

  /**
   * Update document extraction status using RLS-enabled client
   * SECURITY: Uses authenticated Supabase client with RLS policies
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

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId)

      if (error) {
        console.warn('Failed to update extraction status:', error.message)
      }
    } catch (error) {
      console.warn('Failed to update extraction status:', error)
    }
  }

  /**
   * Get documents for a claim using RLS-enabled client
   * SECURITY: Uses authenticated Supabase client with RLS policies
   */
  async getClaimDocuments(claimId: string): Promise<UploadedDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('claim_id', claimId)

      if (error) {
        console.error('Failed to fetch claim documents:', error.message)
        return []
      }
      
      return data ? data.map(this.mapDocumentFromDB) : []
    } catch (error) {
      console.error('Failed to fetch claim documents:', error)
      return []
    }
  }

  /**
   * Get recent documents using RLS-enabled client
   * SECURITY: Uses authenticated Supabase client with RLS policies
   */
  async getRecentDocuments(limit: number = 20): Promise<UploadedDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch recent documents:', error.message)
        return []
      }
      
      return data ? data.map(this.mapDocumentFromDB) : []
    } catch (error) {
      console.error('Failed to fetch recent documents:', error)
      return []
    }
  }

  /**
   * Delete document using RLS-enabled client
   * SECURITY: Uses authenticated Supabase client with RLS policies
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Get document info first
      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single()

      if (fetchError || !documents) {
        console.error('Failed to fetch document for deletion:', fetchError?.message)
        return false
      }

      const filePath = documents.file_path

      // Delete from storage using authenticated client
      const { error: storageError } = await supabase.storage
        .from('policy-documents')
        .remove([filePath])

      // Delete from database using RLS-enabled client
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (storageError || dbError) {
        console.error('Failed to delete document:', storageError?.message || dbError?.message)
        return false
      }

      return true
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
   * Process document with AI extraction using authenticated edge function
   * SECURITY: Uses authenticated Supabase edge function
   */
  async processDocumentWithAI(document: UploadedDocument, documentType: string): Promise<any> {
    try {
      // Update status to processing
      await this.updateExtractionStatus(document.id, 'processing')

      // Create a File object from the public URL
      const response = await fetch(document.publicUrl)
      const blob = await response.blob()
      const file = new File([blob], document.fileName, { type: document.mimeType })

      // Call the processing edge function with authentication
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const { data: result, error } = await supabase.functions.invoke('process-policy-document', {
        body: formData
      })

      if (error) {
        // Update status to failed
        await this.updateExtractionStatus(document.id, 'failed')
        throw new Error(`Document processing failed: ${error.message}`)
      }

      // Update status to completed with extracted data
      await this.updateExtractionStatus(document.id, 'completed', result.data)
      
      return result.data
    } catch (error) {
      console.error('AI processing failed:', error)
      await this.updateExtractionStatus(document.id, 'failed')
      throw error
    }
  }
}

export const documentUploadService = new DocumentUploadService()
