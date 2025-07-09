import React, { useState } from 'react'
import { Upload, FileText, Camera, Eye, Trash2 } from 'lucide-react'
import { useToastContext } from '../../contexts/ToastContext'

interface DocumentFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface DocumentUploadProps {
  onFilesUploaded?: (files: DocumentFile[]) => void
  maxFiles?: number
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFilesUploaded,
  maxFiles = 10
}) => {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [uploading, setUploading] = useState(false)
  const toast = useToastContext()

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    if (documents.length + fileArray.length > maxFiles) {
      toast.error('Too Many Files', `Maximum ${maxFiles} files allowed`)
      return
    }

    setUploading(true)
    
    try {
      const newDocuments: DocumentFile[] = fileArray.map(file => ({
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
      
      setDocuments(prev => [...prev, ...newDocuments])
      
      if (onFilesUploaded) {
        onFilesUploaded(newDocuments)
      }
      
      toast.success('Upload Complete', `Successfully uploaded ${fileArray.length} files`)
    } catch (error) {
      toast.error('Upload Failed', 'An error occurred during file upload')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
    e.target.value = ''
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Camera className="h-6 w-6" />
    return <FileText className="h-6 w-6" />
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
        <p className="text-sm text-gray-600 mb-4">
          Supports images, PDFs, Word docs
        </p>
        
        <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Choose Files
          <input
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.txt"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {documents.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Uploaded Documents ({documents.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div key={doc.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-gray-400">
                    {getFileIcon(doc.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                    <p className="text-xs text-gray-500">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(doc.url, '_blank')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentUpload
