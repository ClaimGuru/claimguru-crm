import React, { useState } from 'react'
import { useClients } from '../hooks/useClients'
import { useClaims } from '../hooks/useClaims'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EnhancedClientForm } from '../components/forms/EnhancedClientForm'
import { ClientDetailsModal } from '../components/clients/ClientDetailsModal'
import { CreateClaimModal } from '../components/clients/CreateClaimModal'
import { ClientCreateClaimButton } from '../components/clients/ClientCreateClaimButton'
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Phone, 
  Mail,
  MapPin,
  Eye,
  Edit,
  FileText,
  Calendar,
  Building,
  Trash2,
  UserPlus,
  Star
} from 'lucide-react'
import type { Client } from '../lib/supabase'

export function Clients() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients()
  const { claims } = useClaims()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateClaimFlow, setShowCreateClaimFlow] = useState(false)
  const [clientForClaim, setClientForClaim] = useState<Client | null>(null)

  const filteredClients = clients.filter(client => {
    const clientDisplayName = client.client_type === 'commercial' || client.client_type === 'business'
      ? client.business_name || 'Unnamed Business'
      : `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client'
    
    const matchesSearch = 
      clientDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.primary_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.primary_phone?.includes(searchTerm) ||
      client.point_of_contact_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.point_of_contact_last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const normalizedClientType = client.client_type === 'commercial' ? 'business' : client.client_type
    const matchesType = typeFilter === 'all' || normalizedClientType === typeFilter
    
    return matchesSearch && matchesType
  })

  const getClientClaims = (clientId: string) => {
    return claims.filter(claim => claim.client_id === clientId)
  }

  const handleAddClient = () => {
    setEditingClient(null)
    setIsFormOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsFormOpen(true)
  }

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete client "${client.client_type === 'commercial' ? client.business_name : `${client.first_name} ${client.last_name}`}"?`)) return
    
    try {
      await deleteClient(client.id)
    } catch (error) {
      alert('Error deleting client. Please try again.')
    }
  }

  const handleSaveClient = async (clientData: any) => {
    console.log('📥 PARENT handleSaveClient called with:', clientData)
    console.log('📝 Editing client:', editingClient)
    
    try {
      let savedClient
      if (editingClient) {
        console.log('📝 Updating existing client...')
        // Update existing client
        savedClient = await updateClient(editingClient.id, clientData)
        console.log('✅ Client updated successfully:', savedClient)
      } else {
        console.log('➕ Creating new client...')
        // Create new client
        savedClient = await createClient(clientData)
        console.log('✅ Client created successfully:', savedClient)
      }
      
      console.log('📝 Closing form and resetting state...')
      setIsFormOpen(false)
      setEditingClient(null)
      
      // If this is a new client, show create claim modal
      if (!editingClient && savedClient) {
        console.log('📜 Opening create claim flow for new client...')
        setClientForClaim(savedClient)
        setShowCreateClaimFlow(true)
      }
      
      console.log('✅ handleSaveClient completed successfully')
    } catch (error) {
      console.error('❌ Error in handleSaveClient:', error)
      console.error('📊 Error details:', JSON.stringify(error, null, 2))
      // Error handling is done in the form
      throw error // Re-throw so the form can handle it
    }
  }

  const handleCreateClaim = (client: Client) => {
    setClientForClaim(client)
    setShowCreateClaimFlow(true)
    setShowDetailsModal(false)
  }

  const handleCloseCreateClaim = () => {
    setShowCreateClaimFlow(false)
    setClientForClaim(null)
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
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your client relationships and contact information
          </p>
        </div>
        <Button 
          onClick={handleAddClient}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Individual Clients</p>
                <p className="text-3xl font-bold text-gray-900">
                  {clients.filter(c => c.client_type === 'residential' || c.client_type === 'individual').length}
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
                <p className="text-sm font-medium text-gray-600">Business Clients</p>
                <p className="text-3xl font-bold text-gray-900">
                  {clients.filter(c => c.client_type === 'commercial' || c.client_type === 'business').length}
                </p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Claims</p>
                <p className="text-3xl font-bold text-gray-900">
                  {claims.filter(c => c.claim_status !== 'closed' && c.claim_status !== 'settled').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
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
            placeholder="Search clients by name, email, phone, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {clients.length === 0 ? 'No clients yet' : 'No matching clients'}
            </h3>
            <p className="text-gray-600 mb-6">
              {clients.length === 0 
                ? 'Add your first client to start managing relationships in ClaimGuru'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {clients.length === 0 && (
              <Button 
                onClick={handleAddClient}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add First Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => {
            const clientClaims = getClientClaims(client.id)
            const activeClaims = clientClaims.filter(claim => 
              claim.claim_status !== 'closed' && claim.claim_status !== 'settled'
            )
            
            return (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center relative">
                      {(client.client_type === 'commercial' || client.client_type === 'business') ? (
                        <Building className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Users className="h-6 w-6 text-blue-600" />
                      )}
                      {client.has_co_insured && (
                        <UserPlus className="h-3 w-3 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {(client.client_type === 'commercial' || client.client_type === 'business')
                          ? client.business_name || 'Unnamed Business'
                          : `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client'
                        }
                      </h3>
                      {(client.client_type === 'commercial' || client.client_type === 'business') && (
                        client.point_of_contact_first_name && client.point_of_contact_last_name && (
                          <p className="text-gray-600">
                            Contact: {client.point_of_contact_first_name} {client.point_of_contact_last_name}
                            {client.point_of_contact_title && ` (${client.point_of_contact_title})`}
                          </p>
                        )
                      )}
                      {client.has_co_insured && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <UserPlus className="h-3 w-3" />
                          Co-insured: {client.co_insured_first_name} {client.co_insured_last_name}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-1">
                        {client.primary_email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            {client.primary_email}
                          </div>
                        )}
                        {client.primary_phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {client.primary_phone}
                          </div>
                        )}
                        {client.emergency_contact_name && (
                          <div className="flex items-center text-sm text-orange-500">
                            <Star className="h-4 w-4 mr-1" />
                            Emergency: {client.emergency_contact_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {clientClaims.length} {clientClaims.length === 1 ? 'Claim' : 'Claims'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activeClaims.length} active
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client)
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
                          onClick={() => handleEditClient(client)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <ClientCreateClaimButton
                          client={client}
                          onCreateClaim={handleCreateClaim}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {(client.address_line_1 || client.city || client.state) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {[client.address_line_1, client.city, client.state]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (client.client_type === 'commercial' || client.client_type === 'business')
                          ? 'text-purple-600 bg-purple-100'
                          : 'text-blue-600 bg-blue-100'
                      }`}>
                        {(client.client_type === 'commercial' || client.client_type === 'business') ? 'Business' : 'Individual'}
                      </span>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Added: {new Date(client.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Enhanced Client Form Modal */}
      <EnhancedClientForm
        client={editingClient}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingClient(null)
        }}
        onSave={handleSaveClient}
      />

      {/* Client Details Modal */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedClient(null)
        }}
        onEdit={(client) => {
          setEditingClient(client)
          setShowDetailsModal(false)
          setIsFormOpen(true)
        }}
        onCreateClaim={handleCreateClaim}
        claims={claims}
      />

      {/* Enhanced Create Claim Modal */}
      <CreateClaimModal
        client={clientForClaim}
        isOpen={showCreateClaimFlow}
        onClose={handleCloseCreateClaim}
      />
    </div>
  )
}