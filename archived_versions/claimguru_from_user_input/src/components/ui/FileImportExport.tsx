import React, { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { parseCSV, ExcelRow, downloadCSV, downloadJSON, readFileAsText } from '../../utils/excelUtils'
import { useToastContext } from '../../contexts/ToastContext'

interface FileImportExportProps {
  onImport?: (data: ExcelRow[]) => Promise<void>
  onExport?: () => Promise<ExcelRow[]>
  exportHeaders?: string[]
  exportFilename?: string
  importTemplate?: ExcelRow[]
  templateFilename?: string
  acceptedFileTypes?: string
  title?: string
  description?: string
}

const FileImportExport: React.FC<FileImportExportProps> = ({
  onImport,
  onExport,
  exportHeaders = [],
  exportFilename = 'export',
  importTemplate = [],
  templateFilename = 'template',
  acceptedFileTypes = '.csv,.xlsx,.xls',
  title = 'Import/Export Data',
  description = 'Import data from CSV or Excel files, or export current data'
}) => {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importStatus, setImportStatus] = useState<{
    status: 'idle' | 'success' | 'error'
    message: string
    count?: number
  }>({ status: 'idle', message: '' })
  
  const toast = useToastContext()

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImport) return

    setImporting(true)
    setImportStatus({ status: 'idle', message: '' })

    try {
      toast.info('Processing File...', 'Reading and validating your data')
      
      const fileContent = await readFileAsText(file)
      const parsedData = parseCSV(fileContent)
      
      if (parsedData.length === 0) {
        throw new Error('No valid data found in file')
      }

      await onImport(parsedData)
      
      setImportStatus({
        status: 'success',
        message: `Successfully imported ${parsedData.length} records`,
        count: parsedData.length
      })
      
      toast.success('Import Successful!', `Processed ${parsedData.length} records from ${file.name}`)
    } catch (error: any) {
      console.error('Import error:', error)
      const errorMessage = error.message || 'Failed to import data'
      setImportStatus({
        status: 'error',
        message: errorMessage
      })
      toast.error('Import Failed', errorMessage)
    } finally {
      setImporting(false)
      // Reset the file input
      event.target.value = ''
    }
  }

  const handleExport = async () => {
    if (!onExport) return

    setExporting(true)
    try {
      toast.info('Exporting Data...', 'Preparing your data for download')
      
      const data = await onExport()
      
      if (data.length === 0) {
        toast.warning('No Data to Export', 'There is no data available to export.')
        return
      }

      downloadCSV(data, exportFilename, exportHeaders)
      toast.success('Export Complete!', `Downloaded ${data.length} records to ${exportFilename}.csv`)
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error('Export Failed', error.message || 'Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    if (importTemplate.length === 0) {
      toast.warning('No Template Available', 'Template data is not configured for this import.')
      return
    }

    downloadCSV(importTemplate, templateFilename + '_template', exportHeaders)
    toast.success('Template Downloaded', 'Use this template to format your import data correctly.')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        {onImport && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </h4>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Choose file to import
                </span>
                <input
                  type="file"
                  accept={acceptedFileTypes}
                  onChange={handleFileImport}
                  disabled={importing}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Supports CSV and Excel files
              </p>
            </div>

            {/* Import Status */}
            {importStatus.status !== 'idle' && (
              <div className={`p-3 rounded-lg flex items-start space-x-2 ${
                importStatus.status === 'success' ? 'bg-green-50 border border-green-200' :
                'bg-red-50 border border-red-200'
              }`}>
                {importStatus.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    importStatus.status === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {importStatus.status === 'success' ? 'Import Successful' : 'Import Failed'}
                  </p>
                  <p className={`text-xs ${
                    importStatus.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {importStatus.message}
                  </p>
                </div>
              </div>
            )}

            {/* Template Download */}
            {importTemplate.length > 0 && (
              <button
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Template
              </button>
            )}

            {importing && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Processing...</span>
              </div>
            )}
          </div>
        )}

        {/* Export Section */}
        {onExport && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </h4>
            
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                Export all current data to CSV format
              </p>
              
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Import Guidelines:</h5>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Ensure your CSV file has headers that match the template</li>
          <li>• Empty rows will be skipped automatically</li>
          <li>• Use semicolons (;) to separate multiple values in a single field</li>
          <li>• Save Excel files as CSV format before importing</li>
          <li>• Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  )
}

export default FileImportExport