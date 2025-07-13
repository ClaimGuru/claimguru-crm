import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { 
  X, 
  Clock, 
  Download, 
  Eye, 
  FileText, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  User
} from 'lucide-react'

interface DocumentVersionHistoryProps {
  document: any
  isOpen: boolean
  onClose: () => void
}

interface DocumentVersion {
  id: string
  version: number
  file_name: string
  file_size: number
  created_at: string
  created_by: string
  changes_summary: string
  is_current: boolean
  download_url: string
  status: 'active' | 'archived' | 'deleted'
}

export function DocumentVersionHistory({ document, isOpen, onClose }: DocumentVersionHistoryProps) {
  const [loading, setLoading] = useState(true)
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && document) {
      loadVersionHistory()
    }
  }, [isOpen, document])

  const loadVersionHistory = async () => {
    setLoading(true)
    
    // Mock version history data
    setTimeout(() => {
      const mockVersions: DocumentVersion[] = [
        {
          id: '1',
          version: 3,
          file_name: document.name,
          file_size: document.size,
          created_at: '2025-07-09T14:30:00Z',
          created_by: 'John Adjuster',
          changes_summary: 'Added additional damage photos and updated assessment details',
          is_current: true,
          download_url: '/documents/v3/' + document.id,
          status: 'active'
        },
        {
          id: '2',
          version: 2,
          file_name: document.name.replace('.zip', '_v2.zip'),
          file_size: document.size - 1000000,
          created_at: '2025-07-08T16:45:00Z',
          created_by: 'Sarah Estimator',
          changes_summary: 'Updated estimate calculations and added contractor quotes',
          is_current: false,
          download_url: '/documents/v2/' + document.id,
          status: 'active'
        },
        {
          id: '3',
          version: 1,
          file_name: document.name.replace('.zip', '_v1.zip'),
          file_size: document.size - 2000000,
          created_at: '2025-07-07T10:20:00Z',
          created_by: 'Legal Team',
          changes_summary: 'Initial document upload with basic damage assessment',
          is_current: false,
          download_url: '/documents/v1/' + document.id,
          status: 'active'
        }
      ]
      
      setVersions(mockVersions)
      setLoading(false)
    }, 1000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const handleRestoreVersion = (versionId: string, version: number) => {
    console.log(`Restoring version ${version} (ID: ${versionId})`)
    // Implement version restoration logic
  }

  const handleDownloadVersion = (version: DocumentVersion) => {
    console.log(`Downloading version ${version.version}:`, version.download_url)
    // Implement download logic
  }

  const handleCompareVersions = () => {
    console.log('Opening version comparison')
    // Implement version comparison logic
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
              <p className="text-sm text-gray-600">{document.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedVersion && (
              <Button variant="outline" size="sm" onClick={handleCompareVersions}>
                Compare Versions
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading version history...</span>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Total Versions</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-900">{versions.length}</div>
                  <div className="text-sm text-blue-700">Document revisions</div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Current Version</span>
                  </div>
                  <div className="text-3xl font-bold text-green-900">
                    v{versions.find(v => v.is_current)?.version || 1}
                  </div>
                  <div className="text-sm text-green-700">Latest revision</div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Contributors</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-900">
                    {new Set(versions.map(v => v.created_by)).size}
                  </div>
                  <div className="text-sm text-purple-700">Team members</div>
                </div>
              </div>

              {/* Version Timeline */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Version Timeline
                </h3>

                <div className="space-y-4">
                  {versions.map((version, index) => {
                    const dateTime = formatDate(version.created_at)
                    const isSelected = selectedVersion === version.id
                    
                    return (
                      <div
                        key={version.id}
                        className={`relative border rounded-lg p-6 transition-all hover:shadow-md ${
                          version.is_current 
                            ? 'border-green-500 bg-green-50' 
                            : isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Timeline connector */}
                        {index < versions.length - 1 && (
                          <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300"></div>
                        )}

                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {/* Version indicator */}
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              version.is_current
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {version.version}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  Version {version.version}
                                  {version.is_current && (
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      Current
                                    </span>
                                  )}
                                </h4>
                                <div className="text-sm text-gray-600">
                                  {formatFileSize(version.file_size)}
                                </div>
                              </div>

                              <p className="text-gray-700 mb-3">{version.changes_summary}</p>

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {version.created_by}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {dateTime.date} at {dateTime.time}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVersion(version.id)
                                } else {
                                  setSelectedVersion(null)
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadVersion(version)}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {!version.is_current && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestoreVersion(version.id, version.version)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Version Actions */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Version Management</h4>
                <div className="flex flex-wrap gap-3">
                  <Button className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download All Versions
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Export History Report
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Upload New Version
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}