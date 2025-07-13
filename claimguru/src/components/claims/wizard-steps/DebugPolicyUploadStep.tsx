import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Upload, FileText, Brain, AlertTriangle } from 'lucide-react'

interface DebugPolicyUploadStepProps {
  data: any
  onUpdate: (data: any) => void
  onAIProcessing?: (isProcessing: boolean) => void
}

export const DebugPolicyUploadStep: React.FC<DebugPolicyUploadStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  console.log('DebugPolicyUploadStep rendered with data:', data)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('DEBUG: File selected:', file.name, 'Size:', file.size, 'Type:', file.type)
      setUploadedFile(file)
      setTestResult(null)
    }
  }

  const testProcessing = async () => {
    if (!uploadedFile) {
      alert('Please select a file first')
      return
    }

    console.log('DEBUG: Starting test processing...')
    setIsProcessing(true)
    onAIProcessing?.(true)

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockResult = {
        policyNumber: 'TEST-123456',
        insuredName: 'Test Insured',
        insurerName: 'Test Insurance Company',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        propertyAddress: '123 Test Street, Test City, TX 75001'
      }

      setTestResult(JSON.stringify(mockResult, null, 2))
      console.log('DEBUG: Processing completed with mock result:', mockResult)

      // Update wizard data
      onUpdate({
        ...data,
        policyDetails: mockResult,
        uploadedFile: uploadedFile.name,
        processingMethod: 'DEBUG_MODE'
      })

    } catch (error) {
      console.error('DEBUG: Processing failed:', error)
      alert('Processing failed: ' + error.message)
    } finally {
      setIsProcessing(false)
      onAIProcessing?.(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            DEBUG: PDF Upload Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Debug Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">DEBUG MODE ACTIVE</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              This is a simplified test version to diagnose PDF upload issues.
            </p>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Policy Document
              </h3>
              <p className="text-gray-600">
                Select a PDF file to test the upload and processing functionality
              </p>
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>
          </div>

          {/* File Information */}
          {uploadedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selected File:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>Name:</strong> {uploadedFile.name}</div>
                <div><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(1)} KB</div>
                <div><strong>Type:</strong> {uploadedFile.type}</div>
              </div>
            </div>
          )}

          {/* Processing Button */}
          <div className="flex justify-center">
            <Button
              onClick={testProcessing}
              disabled={!uploadedFile || isProcessing}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Brain className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Test Process with AI'}
            </Button>
          </div>

          {/* Processing Result */}
          {testResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Processing Result:</h4>
              <pre className="text-sm text-green-800 bg-green-100 p-3 rounded overflow-x-auto">
                {testResult}
              </pre>
            </div>
          )}

          {/* Debug Console Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Component Status: ✅ Rendered Successfully</div>
              <div>Props Received: ✅ data, onUpdate, onAIProcessing</div>
              <div>Console Logs: Check browser F12 → Console</div>
              <div>Current Data: {JSON.stringify(data, null, 2).substring(0, 100)}...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
