import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Clock, 
  Download, 
  Eye, 
  FileText,
  User,
  Calendar,
  ArrowRight,
  RotateCcw
} from 'lucide-react'

interface DocumentVersion {
  id: string
  version_number: number
  file_name: string
  file_size: number
  file_url: string
  uploaded_by: string
  created_at: string
  change_summary?: string
  is_current: boolean
}

interface DocumentVersionHistoryProps {
  versions: DocumentVersion[]
  onViewVersion: (version: DocumentVersion) => void
  onDownloadVersion: (version: DocumentVersion) => void
  onRestoreVersion: (version: DocumentVersion) => void
  currentVersion?: DocumentVersion
}

export function DocumentVersionHistory({ 
  versions, 
  onViewVersion, 
  onDownloadVersion, 
  onRestoreVersion,
  currentVersion 
}: DocumentVersionHistoryProps) {
  const sortedVersions = versions.sort((a, b) => b.version_number - a.version_number)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Version History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedVersions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No version history available
            </p>
          ) : (
            sortedVersions.map((version, index) => (
              <div 
                key={version.id} 
                className={`border rounded-lg p-4 transition-colors ${
                  version.is_current ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                        version.is_current 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <FileText className="h-4 w-4" />
                        <span>Version {version.version_number}</span>
                        {version.is_current && (
                          <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      {index < sortedVersions.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {version.file_name}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(version.created_at).toLocaleDateString()}</span>
                          </span>
                          <span>{formatFileSize(version.file_size)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>Uploaded by {version.uploaded_by}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(version.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    {version.change_summary && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Changes: </span>
                          {version.change_summary}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewVersion(version)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadVersion(version)}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    
                    {!version.is_current && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRestoreVersion(version)}
                        className="text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Timeline connector */}
                {index < sortedVersions.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="w-px h-4 bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Version Summary */}
        {sortedVersions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Version Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Versions:</span>
                <span className="ml-2 font-medium">{sortedVersions.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Current Version:</span>
                <span className="ml-2 font-medium">
                  {currentVersion?.version_number || sortedVersions[0]?.version_number}
                </span>
              </div>
              <div>
                <span className="text-gray-500">First Created:</span>
                <span className="ml-2 font-medium">
                  {sortedVersions.length > 0 && 
                    new Date(sortedVersions[sortedVersions.length - 1].created_at).toLocaleDateString()
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last Modified:</span>
                <span className="ml-2 font-medium">
                  {sortedVersions.length > 0 && 
                    new Date(sortedVersions[0].created_at).toLocaleDateString()
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}