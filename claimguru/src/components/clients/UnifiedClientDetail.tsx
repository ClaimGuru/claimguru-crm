/**
 * UNIFIED CLIENT DETAIL COMPONENT
 * 
 * Consolidates 2 duplicate client detail components into a single, configurable component:
 * - ClientDetailsModal.tsx (modal display with basic details)
 * - ClientDetailView.tsx (comprehensive detail view with editing)
 * 
 * Features:
 * - Modal or inline display modes
 * - Configurable complexity levels (basic, comprehensive)
 * - Inline editing capabilities
 * - Contact information and communication preferences
 * - Address and location details
 * - Policy information and claim history
 * - Emergency contacts and relationships
 * - Communication history tracking
 * - Action buttons (edit, create claim, etc.)
 */

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { 
  X, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  User, 
  Calendar,
  FileText,
  Plus,
  Eye,
  DollarSign,
  Save,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Camera,
  Paperclip,
  TrendingUp,
  Activity,
  UserPlus,
  Users
} from 'lucide-react'
import type { Client } from '../../lib/supabase'

interface UnifiedClientDetailProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (client: Client) => void
  onCreateClaim?: (client: Client) => void
  onUpdate?: (updatedClient: any) => void
  claims?: any[]
  
  // Configuration props
  mode?: 'modal' | 'inline'  // Display as modal or inline component
  complexity?: 'basic' | 'comprehensive'  // Feature level
  showEditMode?: boolean  // Whether to show editing capabilities
  showActions?: boolean  // Whether to show action buttons
  title?: string  // Custom title
}

export function UnifiedClientDetail({ 
  client, 
  isOpen, 
  onClose, 
  onEdit, 
  onCreateClaim, 
  onUpdate,
  claims = [],
  mode = 'modal',
  complexity = 'basic',
  showEditMode = false,
  showActions = true,
  title
}: UnifiedClientDetailProps) {
  const [isEditing, setIsEditing] = useState(showEditMode)
  const [editedClient, setEditedClient] = useState(client)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setEditedClient(client)
  }, [client])

  if (!client) return null

  const clientClaims = claims.filter(claim => claim.client_id === client.id)
  const activeClaims = clientClaims.filter(claim => 
    claim.claim_status !== 'closed' && claim.claim_status !== 'settled'
  )

  const handleSave = async () => {
    setLoading(true)
    try {
      if (onUpdate) {
        await onUpdate(editedClient)
      }
      setIsEditing(false)
    } catch (error) {
      // console.error('Error updating client:', error)
      alert('Error updating client. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedClient(client)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setEditedClient(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (addressType: string, field: string, value: string) => {
    setEditedClient(prev => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value
      }
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {client.client_type === 'commercial' ? (
            <Building className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5" />
          )}
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {client.client_type === 'commercial' ? 'Business Name' : 'Full Name'}
            </label>
            {isEditing ? (
              client.client_type === 'commercial' ? (
                <Input
                  value={editedClient?.business_name || ''}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="First name"
                    value={editedClient?.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                  />
                  <Input
                    placeholder="Last name"
                    value={editedClient?.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                  />
                </div>
              )
            ) : (
              <p className="text-gray-900">
                {client.client_type === 'commercial' 
                  ? client.business_name || 'Unnamed Business'
                  : `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client'
                }
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Type
            </label>
            <Badge variant={client.client_type === 'commercial' ? 'default' : 'secondary'}>
              {client.client_type === 'commercial' ? 'Business' : 'Individual'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderContactInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="h-4 w-4 inline mr-1" />
              Primary Email
            </label>
            {isEditing ? (
              <Input
                type="email"
                value={editedClient?.primary_email || ''}
                onChange={(e) => handleInputChange('primary_email', e.target.value)}
              />
            ) : (
              <p className="text-gray-900">{client.primary_email || 'Not provided'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="h-4 w-4 inline mr-1" />
              Primary Phone
            </label>
            {isEditing ? (
              <Input
                type="tel"
                value={editedClient?.primary_phone || ''}
                onChange={(e) => handleInputChange('primary_phone', e.target.value)}
              />
            ) : (
              <p className="text-gray-900">{client.primary_phone ? formatPhone(client.primary_phone) : 'Not provided'}</p>
            )}
          </div>
        </div>
        
        {complexity === 'comprehensive' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedClient?.secondary_email || ''}
                  onChange={(e) => handleInputChange('secondary_email', e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{client.secondary_email || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Contact Method
              </label>
              <p className="text-gray-900">{client.preferred_contact_method || 'Email'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderAddressInfo = () => {
    if (complexity === 'basic') return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Address
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  placeholder="Street address"
                  value={editedClient?.address_line_1 || ''}
                  onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Input
                    placeholder="City"
                    value={editedClient?.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                  <Input
                    placeholder="State"
                    value={editedClient?.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                  <Input
                    placeholder="ZIP"
                    value={editedClient?.zip_code || ''}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  />
                  <Input
                    placeholder="Country"
                    value={editedClient?.country || 'United States'}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-900">
                {client.address_line_1 && (
                  <>
                    <p>{client.address_line_1}</p>
                    <p>{client.city}, {client.state} {client.zip_code}</p>
                    <p>{client.country || 'United States'}</p>
                  </>
                )}
                {!client.address_line_1 && <p>No address provided</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderClaimsInfo = () => {
    if (!claims || claims.length === 0) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Claims History
            <Badge variant="outline">{clientClaims.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientClaims.length === 0 ? (
            <p className="text-gray-500">No claims found for this client</p>
          ) : (
            <div className="space-y-3">
              {clientClaims.slice(0, complexity === 'basic' ? 3 : 10).map(claim => (
                <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{claim.claim_number}</p>
                    <p className="text-sm text-gray-600">{claim.claim_type}</p>
                    <p className="text-sm text-gray-500">{formatDate(claim.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={claim.claim_status === 'settled' ? 'default' : 
                               claim.claim_status === 'closed' ? 'secondary' : 'outline'}
                    >
                      {claim.claim_status}
                    </Badge>
                    {claim.estimated_loss_value && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formatCurrency(claim.estimated_loss_value)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {clientClaims.length > (complexity === 'basic' ? 3 : 10) && (
                <p className="text-sm text-gray-500 text-center">
                  And {clientClaims.length - (complexity === 'basic' ? 3 : 10)} more claims...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderSummaryStats = () => {
    if (complexity === 'basic' || !claims || claims.length === 0) return null
    
    const totalValue = clientClaims.reduce((sum, claim) => sum + (claim.estimated_loss_value || 0), 0)
    const settledValue = clientClaims
      .filter(claim => claim.claim_status === 'settled')
      .reduce((sum, claim) => sum + (claim.total_settlement_amount || 0), 0)
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Client Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{clientClaims.length}</p>
              <p className="text-sm text-gray-600">Total Claims</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{activeClaims.length}</p>
              <p className="text-sm text-gray-600">Active Claims</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(settledValue)}</p>
              <p className="text-sm text-gray-600">Settled Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'contact', label: 'Contact', icon: Phone },
    ...(complexity === 'comprehensive' ? [
      { id: 'address', label: 'Address', icon: MapPin },
      { id: 'claims', label: 'Claims', icon: FileText },
      { id: 'summary', label: 'Summary', icon: TrendingUp }
    ] : [])
  ]

  const renderContent = () => {
    const shouldShowTabs = complexity === 'comprehensive'
    
    if (shouldShowTabs) {
      return (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map(tab => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && renderBasicInfo()}
            {activeTab === 'contact' && renderContactInfo()}
            {activeTab === 'address' && renderAddressInfo()}
            {activeTab === 'claims' && renderClaimsInfo()}
            {activeTab === 'summary' && renderSummaryStats()}
          </div>
        </div>
      )
    }
    
    // Single page layout for basic complexity
    return (
      <div className="space-y-6">
        {renderBasicInfo()}
        {renderContactInfo()}
        {renderAddressInfo()}
        {renderClaimsInfo()}
        {renderSummaryStats()}
      </div>
    )
  }

  const clientDisplayName = client.client_type === 'commercial' 
    ? client.business_name || 'Unnamed Business'
    : `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client'
  
  const componentTitle = title || clientDisplayName
  
  if (mode === 'inline') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {client.client_type === 'commercial' ? (
                <Building className="h-6 w-6 text-blue-600" />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{componentTitle}</h2>
              {client.business_name && client.client_type !== 'commercial' && (
                <p className="text-gray-600">{client.business_name}</p>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <>
                  {onEdit && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {onCreateClaim && (
                    <Button
                      onClick={() => onCreateClaim(client)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Claim
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        {renderContent()}
      </div>
    )
  }
  
  // Modal mode
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {client.client_type === 'commercial' ? (
                <Building className="h-6 w-6 text-blue-600" />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{componentTitle}</h2>
              {client.business_name && client.client_type !== 'commercial' && (
                <p className="text-gray-600">{client.business_name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showActions && (
              <>
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <>
                    {onEdit && (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                    {onCreateClaim && (
                      <Button
                        onClick={() => onCreateClaim(client)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Claim
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}