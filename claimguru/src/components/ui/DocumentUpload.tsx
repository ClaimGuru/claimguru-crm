import React, { useState, useRef } from 'react'
import { Button } from './Button'
import { X, Upload, FileText, Image, Video, File, Check, AlertTriangle } from 'lucide-react'

interface DocumentUploadProps {
  onClose: () => void
  onUpload: (files: File[]) => void
}

export function DocumentUpload({ onClose, onUpload }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files: File[]) => {
    setUploading(true)
    
    // Simulate upload progress
    files.forEach((file, index) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
        }
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: Math.min(progress, 100)
        }))
      }, 200)
    })

    // Simulate upload completion
    setTimeout(() => {
      setUploading(false)
      onUpload(files)
    }, 2000)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-600" />
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8 text-red-600" />
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8 text-red-600" />
    return <File className="h-8 w-8 text-gray-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Upload Documents</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Enhanced Clickable Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer select-none ${
              dragActive
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-102'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Click to upload files or drag and drop"
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
              dragActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'
            }`} />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                Click anywhere here to upload files
              </p>
              <p className="text-sm text-gray-600">
                Or drag and drop files • Support for images, PDFs, videos, and documents up to 50MB
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors hover:bg-blue-200">
              <Upload className="h-4 w-4" />
              Choose Files
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
            />
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-gray-900">Uploading Files</h3>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {getFileIcon({ name: fileName, type: fileName.split('.').pop() || '' } as File)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{fileName}</div>
                      <div className="text-sm text-gray-600">
                        {progress === 100 ? 'Upload complete' : `${Math.round(progress)}% uploaded`}
                      </div>
                    </div>
                    {progress === 100 ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File Requirements */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">File Requirements</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Maximum file size: 50MB per file</li>
                  <li>• Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, MP4, MOV, AVI</li>
                  <li>• Files will be automatically scanned for compliance</li>
                  <li>• AI analysis will be performed on uploaded documents</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Add More Files
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}