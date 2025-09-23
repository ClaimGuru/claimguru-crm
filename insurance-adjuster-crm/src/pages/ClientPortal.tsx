import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Shield, 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

interface ClientAuth {
  id: string
  firstName: string
  lastName: string
  email: string
  organizationId: string
}

interface Claim {
  id: string
  fileNumber: string
  claimNumber: string
  status: string
  phase: string
  dateOfLoss: string
  causeOfLoss: string
  lossDescription: string
  estimatedValue: number
  settlementAmount: number
  settlementStatus: string
  assignedAdjusters: any[]
  createdAt: string
}

interface Document {
  id: string
  fileName: string
  documentTitle: string
  documentType: string
  documentCategory: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
}

export function ClientPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [clientId, setClientId] = useState('')
  const [portalPin, setPortalPin] = useState('')
  const [client, setClient] = useState<ClientAuth | null>(null)
  const [claims, setClaims] = useState<Claim[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !portalPin) {
      toast.error('Please enter both Client ID and Portal PIN')
      return
    }

    setAuthenticating(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('client-portal', {
        body: {
          action: 'authenticate',
          clientId,
          portalPin
        }
      })

      if (error) throw error

      if (data.data?.authenticated) {
        setClient(data.data.client)
        setIsAuthenticated(true)
        toast.success('Successfully authenticated!')
        await loadClientData(data.data.client.id, data.data.client.organizationId)
      } else {
        toast.error('Invalid credentials')
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      toast.error('Authentication failed. Please check your credentials.')
    } finally {
      setAuthenticating(false)
    }
  }

  const loadClientData = async (clientId: string, organizationId: string) => {
    setLoading(true)
    
    try {
      // Load claims
      const { data: claimsData, error: claimsError } = await supabase.functions.invoke('client-portal', {
        body: {
          action: 'get_claims',
          clientId,
          organizationId
        }
      })

      if (claimsError) throw claimsError
      setClaims(claimsData.data?.claims || [])

      // Load documents if there are claims
      if (claimsData.data?.claims?.length > 0) {
        const firstClaimId = claimsData.data.claims[0].id
        setSelectedClaim(firstClaimId)
        await loadDocuments(clientId, firstClaimId)
      }
    } catch (error: any) {
      console.error('Error loading client data:', error)
      toast.error('Failed to load your information')
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async (clientId: string, claimId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('client-portal', {
        body: {
          action: 'get_documents',
          clientId,
          claimId
        }
      })

      if (error) throw error
      setDocuments(data.data?.documents || [])
    } catch (error: any) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'investigation':
        return 'bg-yellow-100 text-yellow-800'
      case 'settlement negotiation':
        return 'bg-blue-100 text-blue-800'
      case 'closed - settled':
        return 'bg-green-100 text-green-800'
      case 'denied':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Client Portal Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to view your claims and documents
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="py-8 px-6">
              <form onSubmit={handleAuthentication} className="space-y-6">
                <div>
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                    Client ID
                  </label>
                  <Input
                    id="clientId"
                    type="text"
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter your Client ID"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="portalPin" className="block text-sm font-medium text-gray-700">
                    Portal PIN
                  </label>
                  <Input
                    id="portalPin"
                    type="password"
                    required
                    value={portalPin}
                    onChange={(e) => setPortalPin(e.target.value)}
                    placeholder="Enter your Portal PIN"
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={authenticating}
                >
                  {authenticating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    'Access Portal'
                  )}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Demo Access</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Client ID: demo-client-123<br />
                      Portal PIN: 1234
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {client?.firstName} {client?.lastName}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsAuthenticated(false)
                  setClient(null)
                  setClaims([])
                  setDocuments([])
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Message */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Welcome to Your Client Portal
                  </h2>
                  <p className="text-gray-600">
                    Here you can view your claims, track progress, and access important documents.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claims Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Claims</h3>
            <div className="grid gap-6">
              {claims.map((claim) => (
                <Card key={claim.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Claim #{claim.fileNumber}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Insurance Claim: {claim.claimNumber}
                        </p>
                      </div>
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date of Loss:</span>
                        <span className="ml-2 font-medium">{formatDate(claim.dateOfLoss)}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Cause of Loss:</span>
                        <span className="ml-2 font-medium">{claim.causeOfLoss}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-600">Estimated Value:</span>
                        <span className="ml-2 font-medium">{formatCurrency(claim.estimatedValue)}</span>
                      </div>
                      
                      {claim.settlementAmount && (
                        <div>
                          <span className="text-gray-600">Settlement Amount:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {formatCurrency(claim.settlementAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {claim.lossDescription && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          <strong>Description:</strong> {claim.lossDescription}
                        </p>
                      </div>
                    )}
                    
                    {claim.assignedAdjusters && claim.assignedAdjusters.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Your Assigned Adjuster:</strong>
                        </p>
                        {claim.assignedAdjusters.map((adjuster, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{adjuster.first_name} {adjuster.last_name}</span>
                            {adjuster.email && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-blue-600">{adjuster.email}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedClaim(claim.id)
                          loadDocuments(client!.id, claim.id)
                        }}
                        className={selectedClaim === claim.id ? 'bg-blue-600' : ''}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {claims.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Claims Found
                    </h3>
                    <p className="text-gray-500">
                      You don't have any claims associated with your account yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Documents */}
          {selectedClaim && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              <Card>
                <CardContent className="p-6">
                  {documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {document.documentTitle || document.fileName}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {document.documentCategory} • {formatFileSize(document.fileSize)} • 
                                Uploaded {formatDate(document.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No documents available for this claim yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}