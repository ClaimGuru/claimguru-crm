/**
 * CLAIMS & CLIENT MANAGEMENT OVERVIEW
 * 
 * A comprehensive dashboard component that provides quick access to:
 * - Claims management (view, create, edit)
 * - Client management (view, create, edit)
 * - AI-powered intake wizards
 * - Manual intake forms
 * - Quick stats and analytics
 * - Recent activity and notifications
 * 
 * This component serves as a central hub for claims and client operations.
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Plus, 
  Users, 
  FileText, 
  Brain, 
  Zap, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  DollarSign,
  Calendar,
  ArrowRight,
  Eye,
  Edit,
  Settings,
  Star,
  Award,
  Target,
  BarChart3,
  Activity,
  Filter,
  Search
} from 'lucide-react'
import { useClaims } from '../../hooks/useClaims'
import { useClients } from '../../hooks/useClients'
import { EnhancedAIIntakeWizard } from '../claims/EnhancedAIClaimWizard'
import { ManualIntakeWizard } from '../claims/ManualIntakeWizard'
import { ClientForm } from '../forms/ClientForm'
import { ClaimForm } from '../forms/ClaimForm'
import { ClientDetailView } from '../clients/ClientDetailView'
import { ClaimDetailView } from '../claims/ClaimDetailView'

export function ClaimsClientOverview() {
  const { claims, loading: claimsLoading, createClaim } = useClaims()
  const { clients, loading: clientsLoading, createClient } = useClients()
  
  // Modal states
  const [showAIWizard, setShowAIWizard] = useState(false)
  const [showManualWizard, setShowManualWizard] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [showClientDetail, setShowClientDetail] = useState(false)
  const [showClaimDetail, setShowClaimDetail] = useState(false)
  
  // Selected items
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  
  // View modes
  const [activeView, setActiveView] = useState<'overview' | 'claims' | 'clients'>('overview')

  // Calculate statistics
  const totalClaims = claims.length
  const activeClaims = claims.filter(c => c.claim_status !== 'closed' && c.claim_status !== 'settled').length
  const settledClaims = claims.filter(c => c.claim_status === 'settled').length
  const totalClients = clients.length
  const totalClaimValue = claims.reduce((sum, claim) => sum + (claim.estimated_loss_value || 0), 0)
  const totalSettledValue = claims
    .filter(c => c.claim_status === 'settled')
    .reduce((sum, claim) => sum + (claim.estimated_loss_value || 0), 0)

  // Recent items (last 5)
  const recentClaims = claims
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
  
  const recentClients = clients
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Handle AI wizard completion
  const handleAIWizardComplete = async (claimData: any) => {
    try {
      await createClaim({
        ...claimData,
        dataSource: 'ai_extraction',
        aiEnhanced: true
      })
      setShowAIWizard(false)
      // Refresh data if needed
    } catch (error) {
      console.error('Error creating AI claim:', error)
      alert('Error creating claim. Please try again.')
    }
  }

  // Handle manual wizard completion
  const handleManualWizardComplete = async (claimData: any) => {
    try {
      await createClaim({
        ...claimData,
        dataSource: 'manual_input',
        aiEnhanced: false
      })
      setShowManualWizard(false)
      // Refresh data if needed
    } catch (error) {
      console.error('Error creating manual claim:', error)
      alert('Error creating claim. Please try again.')
    }
  }

  // Handle client creation
  const handleClientSave = async (clientData: any) => {
    try {
      await createClient(clientData)
      setShowClientForm(false)
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Error creating client. Please try again.')
    }
  }

  // Handle claim creation
  const handleClaimSave = async (claimData: any) => {
    try {
      await createClaim(claimData)
      setShowClaimForm(false)
    } catch (error) {
      console.error('Error creating claim:', error)
      alert('Error creating claim. Please try again.')
    }
  }

  // View client details
  const handleViewClient = (client: any) => {
    setSelectedClient(client)
    setShowClientDetail(true)
  }

  // View claim details
  const handleViewClaim = (claim: any) => {
    setSelectedClaim(claim)
    setShowClaimDetail(true)
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims & Client Management</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive overview of your claims and clients with AI-powered tools
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowClientForm(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Add Client
          </Button>
          <Button
            onClick={() => setShowAIWizard(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Brain className="h-4 w-4" />
            AI Claim Intake
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'claims', label: 'Claims', icon: FileText },
            { id: 'clients', label: 'Clients', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Claims</p>
                    <p className="text-3xl font-bold text-gray-900">{totalClaims}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {activeClaims} active
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-3xl font-bold text-gray-900">{totalClients}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Active relationships
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Claim Value</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(totalClaimValue)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Total estimated
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Settled Value</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(totalSettledValue)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {settledClaims} settled
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setShowAIWizard(true)}
                  className="flex items-center gap-2 justify-center h-20 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Brain className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">AI Intake Wizard</div>
                    <div className="text-xs opacity-90">Smart PDF processing</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setShowManualWizard(true)}
                  variant="outline"
                  className="flex items-center gap-2 justify-center h-20"
                >
                  <FileText className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">Manual Intake</div>
                    <div className="text-xs text-gray-500">Traditional form entry</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setShowClientForm(true)}
                  variant="outline"
                  className="flex items-center gap-2 justify-center h-20"
                >
                  <Users className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">Add Client</div>
                    <div className="text-xs text-gray-500">Create new client</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setShowClaimForm(true)}
                  variant="outline"
                  className="flex items-center gap-2 justify-center h-20"
                >
                  <Plus className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">Quick Claim</div>
                    <div className="text-xs text-gray-500">Basic claim form</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Claims */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Recent Claims
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveView('claims')}
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentClaims.length > 0 ? (
                    recentClaims.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {claim.file_number || `Claim #${claim.id.slice(0, 8)}`}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.claim_status)}`}>
                              {claim.claim_status.charAt(0).toUpperCase() + claim.claim_status.slice(1).replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {claim.cause_of_loss || 'General Loss'} • {formatDate(claim.created_at)}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            {formatCurrency(claim.estimated_loss_value || 0)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClaim(claim)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No claims yet</h3>
                      <p className="text-gray-600 mb-4">Start your first claim intake to get started</p>
                      <Button onClick={() => setShowAIWizard(true)}>
                        <Brain className="h-4 w-4 mr-2" />
                        Start AI Intake
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Clients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Recent Clients
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveView('clients')}
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentClients.length > 0 ? (
                    recentClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {client.client_type === 'business' 
                              ? client.business_name 
                              : `${client.first_name} ${client.last_name}`
                            }
                          </h4>
                          <p className="text-sm text-gray-600">
                            {client.primary_email} • {formatDate(client.created_at)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {client.client_type}
                            </span>
                            {client.is_policyholder && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Policyholder
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClient(client)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
                      <p className="text-gray-600 mb-4">Add your first client to get started</p>
                      <Button onClick={() => setShowClientForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Claims Tab */}
      {activeView === 'claims' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              All Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Claims Management</h3>
              <p className="text-gray-600 mb-4">
                Navigate to the dedicated Claims page for full claims management
              </p>
              <Button onClick={() => window.location.href = '/claims'}>
                Go to Claims Page
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients Tab */}
      {activeView === 'clients' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              All Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Management</h3>
              <p className="text-gray-600 mb-4">
                Navigate to the dedicated Clients page for full client management
              </p>
              <Button onClick={() => window.location.href = '/clients'}>
                Go to Clients Page
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showAIWizard && (
        <EnhancedAIIntakeWizard
          onComplete={handleAIWizardComplete}
          onCancel={() => setShowAIWizard(false)}
        />
      )}

      {showManualWizard && (
        <ManualIntakeWizard
          onComplete={handleManualWizardComplete}
          onCancel={() => setShowManualWizard(false)}
        />
      )}

      {showClientForm && (
        <ClientForm
          isOpen={showClientForm}
          onClose={() => setShowClientForm(false)}
          onSave={handleClientSave}
        />
      )}

      {showClaimForm && (
        <ClaimForm
          isOpen={showClaimForm}
          onClose={() => setShowClaimForm(false)}
          onSave={handleClaimSave}
        />
      )}

      {showClientDetail && selectedClient && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <ClientDetailView
            client={selectedClient}
            onClose={() => {
              setShowClientDetail(false)
              setSelectedClient(null)
            }}
          />
        </div>
      )}

      {showClaimDetail && selectedClaim && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <ClaimDetailView
            claim={selectedClaim}
            client={clients.find(c => c.id === selectedClaim.client_id)}
            onClose={() => {
              setShowClaimDetail(false)
              setSelectedClaim(null)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ClaimsClientOverview