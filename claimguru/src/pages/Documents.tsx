import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { FileText, Upload, Download, Search, Brain, Scan, Share2, Eye, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Document } from '../lib/supabase'

export function Documents() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadDocuments()
    }
  }, [userProfile?.organization_id])

  async function loadDocuments() {
    if (!userProfile?.organization_id) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc => 
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-2">Intelligent document processing with AI analysis</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />OCR Scan
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />AI Analysis
          </Button>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />Upload
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Processed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {documents.filter(d => d.ai_processed).length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shared</p>
                <p className="text-3xl font-bold text-gray-900">
                  {documents.filter(d => d.is_shared).length}
                </p>
              </div>
              <Share2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatFileSize(documents.reduce((sum, d) => sum + (d.file_size || 0), 0))}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-6">Upload your first document to get started</p>
            <Button>Upload Document</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.ai_processed ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <FileText className={`h-5 w-5 ${doc.ai_processed ? 'text-purple-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    {doc.ai_processed && <Brain className="h-4 w-4 text-purple-600" />}
                    {doc.is_shared && <Share2 className="h-4 w-4 text-green-600" />}
                    {doc.is_template && <Star className="h-4 w-4 text-yellow-600" />}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm truncate" title={doc.file_name}>
                  {doc.file_name}
                </h3>
                {doc.description && (
                  <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>{formatFileSize(doc.file_size || 0)}</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-1 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-3 w-3 mr-1" />Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>AI Document Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">Extract key information</p>
              <Button variant="outline">Analyze</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Scan className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">OCR Processing</h3>
              <p className="text-sm text-gray-600 mb-4">Convert to text</p>
              <Button variant="outline">Process</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Compliance</h3>
              <p className="text-sm text-gray-600 mb-4">Check completeness</p>
              <Button variant="outline">Check</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}