import React, { useState, useEffect } from 'react'
import { useClaims } from '../hooks/useClaims'
import { useClients } from '../hooks/useClients'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ClaimForm } from '../components/forms/ClaimForm'
// Import both Manual and AI wizards
import { EnhancedAIIntakeWizard } from '../components/claims/EnhancedAIClaimWizard'
import { ManualIntakeWizard } from '../components/claims/ManualIntakeWizard'
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Brain,
  TrendingUp,
  Trash2,
  ArrowLeft,
  Zap
} from 'lucide-react'
import type { Claim } from '../lib/supabase'

// Helper function for status colors (moved outside to be accessible by modal)
const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'text-blue-600 bg-blue-100'
    case 'in_progress': return 'text-orange-600 bg-orange-100'
    case 'under_review': return 'text-purple-600 bg-purple-100'
    case 'negotiating': return 'text-yellow-600 bg-yellow-100'
    case 'settled': return 'text-green-600 bg-green-100'
    case 'closed': return 'text-gray-600 bg-gray-100'
    default: return 'text-blue-600 bg-blue-100'
  }
}

export function Claims() {
  const { claims, loading, createClaim, updateClaim, deleteClaim } = useClaims()
  const { clients } = useClients()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  // Separate state for manual and AI wizards
  const [claimSubmissionStatus, setClaimSubmissionStatus] = useState<{ isSubmitting: boolean; error: string | null; success: boolean }>({ 
    isSubmitting: false, 
    error: null, 
    success: false 
  })
  const [showManualWizard, setShowManualWizard] = useState(false)
  const [showAIWizard, setShowAIWizard] = useState(false)
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Handle URL routing for new claim creation
  useEffect(() => {
    if (location.pathname === '/claims/new') {
      setShowManualWizard(true)
    }
  }, [location.pathname])

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.file_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.carrier_claim_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.cause_of_loss?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || claim.claim_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return Clock
      case 'in_progress': return AlertCircle
      case 'under_review': return FileText
      case 'negotiating': return TrendingUp
      case 'settled': return CheckCircle
      case 'closed': return CheckCircle
      default: return Clock
    }
  }



  const handleAddClaim = () => {
    setEditingClaim(null)
    setIsFormOpen(true)
  }

  const handleManualWizardComplete = async (claimData: any) => {
    setClaimSubmissionStatus({ isSubmitting: true, error: null, success: false })
    try {
      // Create the claim with manually entered data
      const result = await createClaim({
        ...claimData,
        dataSource: 'manual_input',
        aiEnhanced: false
      })
      setClaimSubmissionStatus({ isSubmitting: false, error: null, success: true })
      setShowManualWizard(false)
      
      // Show success message
      alert('Claim created successfully!')
      
      // Refresh claims list
      window.location.reload()
    } catch (error: any) {
      console.error('Error creating manual claim:', error)
      setClaimSubmissionStatus({ 
        isSubmitting: false, 
        error: error.message || 'Failed to create claim. Please try again.', 
        success: false 
      })
      alert(`Error creating claim: ${error.message || 'Please try again.'}`)
    }
  }

  const handleManualWizardCancel = () => {
    setShowManualWizard(false)
  }

  const handleAIWizardComplete = async (claimData: any) => {
    setClaimSubmissionStatus({ isSubmitting: true, error: null, success: false })
    try {
      // Create the claim with AI-generated data
      const result = await createClaim({
        ...claimData,
        dataSource: 'ai_extraction',
        aiEnhanced: true
      })
      setClaimSubmissionStatus({ isSubmitting: false, error: null, success: true })
      setShowAIWizard(false)
      
      // Show success message
      alert('Claim created successfully!')
      
      // Refresh claims list
      window.location.reload()
    } catch (error: any) {
      console.error('Error creating AI claim:', error)
      setClaimSubmissionStatus({ 
        isSubmitting: false, 
        error: error.message || 'Failed to create claim. Please try again.', 
        success: false 
      })
      alert(`Error creating claim: ${error.message || 'Please try again.'}`)
    }
  }

  const handleAIWizardCancel = () => {
    setShowAIWizard(false)
  }

  const handleEditClaim = (claim: Claim) => {
    setEditingClaim(claim)
    setIsFormOpen(true)
  }

  const handleDeleteClaim = async (claim: Claim) => {
    if (!confirm(`Are you sure you want to delete claim "${claim.file_number}"?`)) return
    
    try {
      await deleteClaim(claim.id)
    } catch (error) {
      alert('Error deleting claim. Please try again.')
    }
  }

  const handleSaveClaim = async (claim: Claim) => {
    // The form handles the save operation, just close the modal
    setIsFormOpen(false)
    setEditingClaim(null)
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and track insurance claims with AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowManualWizard(true)}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            New Claim Intake
          </Button>
          <Button 
            onClick={() => setShowAIWizard(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Brain className="h-4 w-4" />
            AI-Enhanced Intake Wizard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-3xl font-bold text-gray-900">{claims.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Claims</p>
                <p className="text-3xl font-bold text-gray-900">
                  {claims.filter(c => c.claim_status !== 'closed' && c.claim_status !== 'settled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Settled Claims</p>
                <p className="text-3xl font-bold text-gray-900">
                  {claims.filter(c => c.claim_status === 'settled').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${claims.reduce((sum, c) => sum + (c.estimated_loss_value || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search claims by file number, claim number, or cause of loss..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="negotiating">Negotiating</option>
            <option value="settled">Settled</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {claims.length === 0 ? 'No claims yet' : 'No matching claims'}
            </h3>
            <p className="text-gray-600 mb-6">
              {claims.length === 0 
                ? 'Create your first claim to get started with ClaimGuru'
                : 'Try adjusting your search or filter criteria'
              }
            </p>

          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClaims.map((claim) => {
            const StatusIcon = getStatusIcon(claim.claim_status)
            const statusColorClass = getStatusColor(claim.claim_status)
            const client = clients.find(c => c.id === claim.client_id)
            
            return (
              <Card key={claim.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${statusColorClass}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {claim.file_number || `Claim #${claim.id.slice(0, 8)}`}
                        </h3>
                        <p className="text-gray-600">
                          {claim.cause_of_loss || 'General Loss'} • {claim.carrier_claim_number || 'No Claim #'}
                        </p>
                        {client && (
                          <p className="text-sm text-gray-500">
                            {client.first_name} {client.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${(claim.estimated_loss_value || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(claim)
                            setShowDetailsModal(true)
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClaim(claim)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClaim(claim)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                        {claim.claim_status.charAt(0).toUpperCase() + claim.claim_status.slice(1).replace('_', ' ')}
                      </span>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Last updated: {new Date(claim.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Manual Intake Wizard */}
      {showManualWizard && (
        <ManualIntakeWizard
          onComplete={handleManualWizardComplete}
          onCancel={handleManualWizardCancel}
        />
      )}

      {/* Enhanced AI-Powered Insurance Intake Wizard with Real PDF Processing */}
      {showAIWizard && (
        <EnhancedAIIntakeWizard
          onComplete={handleAIWizardComplete}
          onCancel={handleAIWizardCancel}
        />
      )}

      {/* Claim Form Modal */}
      <ClaimForm
        claim={editingClaim}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingClaim(null)
        }}
        onSave={handleSaveClaim}
      />

      {/* Claim Details Modal */}
      {showDetailsModal && selectedClaim && (
        <ClaimDetailsModal
          claim={selectedClaim}
          client={clients.find(c => c.id === selectedClaim.client_id)}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedClaim(null)
          }}
          onEdit={() => {
            setShowDetailsModal(false)
            handleEditClaim(selectedClaim)
          }}
        />
      )}
    </div>
  )
}

// Claim Details Modal Component
interface ClaimDetailsModalProps {
  claim: Claim
  client?: any
  onClose: () => void
  onEdit: () => void
}

function ClaimDetailsModal({ claim, client, onClose, onEdit }: ClaimDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {claim.file_number || `Claim #${claim.id.slice(0, 8)}`}
            </h2>
            <p className="text-gray-600">
              {claim.cause_of_loss || 'General Loss'} • Created {new Date(claim.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Claim Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Claim Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">File Number</label>
                  <p className="font-semibold">{claim.file_number}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Carrier Claim Number</label>
                  <p className="font-semibold">{claim.carrier_claim_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Date of Loss</label>
                  <p className="font-semibold">
                    {claim.date_of_loss ? new Date(claim.date_of_loss).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Cause of Loss</label>
                  <p className="font-semibold">{claim.cause_of_loss || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.claim_status)}`}>
                    {claim.claim_status.charAt(0).toUpperCase() + claim.claim_status.slice(1).replace('_', ' ')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            {client && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-semibold">
                      {client.client_type === 'business' 
                        ? client.business_name 
                        : `${client.first_name} ${client.last_name}`
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Phone</label>
                    <p className="font-semibold">{client.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-semibold">{client.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Address</label>
                    <p className="font-semibold">
                      {client.address_line_1}
                      {client.address_line_2 && `, ${client.address_line_2}`}<br />
                      {client.city}, {client.state} {client.zip_code}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Estimated Loss Value</label>
                  <p className="text-2xl font-bold text-purple-600">
                    ${(claim.estimated_loss_value || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Settlement Amount</label>
                  <p className="text-xl font-semibold text-green-600">
                    ${(claim.estimated_loss_value || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Deductible</label>
                  <p className="font-semibold">
                    ${(claim.deductible || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {claim.loss_description && (
                  <div>
                    <label className="text-sm text-gray-600">Loss Description</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {claim.loss_description}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <p className="font-semibold">{new Date(claim.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Updated</label>
                  <p className="font-semibold">{new Date(claim.updated_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}