import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Save, FileText, User, Calendar, DollarSign, MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Claim, Client } from '../../lib/supabase'

interface Property {
  id: string
  client_id: string
  property_nickname?: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  zip_code: string
}

interface ClaimFormProps {
  claim?: Claim | null
  isOpen: boolean
  onClose: () => void
  onSave: (claim: Claim) => void
}

export function ClaimForm({ claim, isOpen, onClose, onSave }: ClaimFormProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Pick<Client, 'id' | 'first_name' | 'last_name' | 'business_name' | 'client_type'>[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [showNewProperty, setShowNewProperty] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    property_id: '',
    file_number: '',
    claim_number: '',
    carrier_claim_number: '',
    claim_status: 'new',
    claim_phase: 'intake',
    priority: 'medium',
    date_of_loss: '',
    cause_of_loss: '',
    loss_description: '',
    date_reported: '',
    contract_fee_type: 'percentage',
    contract_fee_amount: 0,
    estimated_loss_value: 0,
    is_claim_filed: false,
    is_fema_claim: false,
    settlement_status: 'pending'
  })
  
  // New property form data
  const [newPropertyData, setNewPropertyData] = useState({
    property_nickname: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: ''
  })

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadClients()
    }
  }, [userProfile?.organization_id])

  useEffect(() => {
    if (formData.client_id) {
      loadPropertiesForClient(formData.client_id)
    } else {
      setProperties([])
      setFormData(prev => ({ ...prev, property_id: '' }))
    }
  }, [formData.client_id])

  useEffect(() => {
    // Check for preloaded client from CreateClaimModal
    const preloadedClientData = localStorage.getItem('preloadedClient')
    
    if (preloadedClientData && !claim && isOpen) {
      try {
        const clientData = JSON.parse(preloadedClientData)
        setFormData(prev => ({
          ...prev,
          client_id: clientData.id
        }))
        
        // Clear localStorage after using
        localStorage.removeItem('preloadedClient')
        
        // Show a notification that client was pre-selected
        setTimeout(() => {
          const message = `Client "${clientData.name}" has been pre-selected for this claim.`
          const leadSourceInfo = clientData.lead_source ? ` Lead source: ${clientData.lead_source}` : ''
          alert(message + leadSourceInfo)
        }, 500)
      } catch (error) {
        console.error('Error parsing preloaded client data:', error)
        localStorage.removeItem('preloadedClient')
      }
    }
    
    // Fallback: Check for old pre-selected client format
    const preselectedClientId = localStorage.getItem('preselected_client_id')
    const preselectedClientName = localStorage.getItem('preselected_client_name')
    
    if (preselectedClientId && !claim && !preloadedClientData) {
      setFormData(prev => ({
        ...prev,
        client_id: preselectedClientId
      }))
      
      // Clear localStorage after using
      localStorage.removeItem('preselected_client_id')
      localStorage.removeItem('preselected_client_name')
      
      // Show a notification that client was pre-selected
      if (preselectedClientName) {
        setTimeout(() => {
          alert(`Client "${preselectedClientName}" has been pre-selected for this claim.`)
        }, 500)
      }
    }
  }, [claim, isOpen])

  useEffect(() => {
    if (claim) {
      setFormData({
        client_id: claim.client_id || '',
        file_number: claim.file_number || '',
        claim_number: claim.claim_number || '',
        carrier_claim_number: claim.carrier_claim_number || '',
        claim_status: claim.claim_status || 'new',
        property_id: claim.property_id || '',
        claim_phase: claim.claim_phase || 'intake',
        priority: claim.priority || 'medium',
        date_of_loss: claim.date_of_loss || '',
        cause_of_loss: claim.cause_of_loss || '',
        loss_description: claim.loss_description || '',
        date_reported: claim.date_reported || '',
        contract_fee_type: claim.contract_fee_type || 'percentage',
        contract_fee_amount: claim.contract_fee_amount || 0,
        estimated_loss_value: claim.estimated_loss_value || 0,
        is_claim_filed: claim.is_claim_filed || false,
        is_fema_claim: claim.is_fema_claim || false,
        settlement_status: claim.settlement_status || 'pending'
      })
    } else {
      setFormData({
        client_id: '',
        file_number: generateFileNumber(),
        claim_number: '',
        carrier_claim_number: '',
        claim_status: 'new',
        property_id: '',
        claim_phase: 'intake',
        priority: 'medium',
        date_of_loss: '',
        cause_of_loss: '',
        loss_description: '',
        date_reported: new Date().toISOString().split('T')[0],
        contract_fee_type: 'percentage',
        contract_fee_amount: 10,
        estimated_loss_value: 0,
        is_claim_filed: false,
        is_fema_claim: false,
        settlement_status: 'pending'
      })
    }
  }, [claim, isOpen])

  async function loadClients() {
    if (!userProfile?.organization_id) return
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, business_name, client_type')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  async function loadPropertiesForClient(clientId: string) {
    if (!userProfile?.organization_id || !clientId) return
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, client_id, property_nickname, address_line_1, address_line_2, city, state, zip_code')
        .eq('organization_id', userProfile.organization_id)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
      
      // Auto-select first property if only one exists
      if (data && data.length === 1 && !formData.property_id) {
        setFormData(prev => ({ ...prev, property_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error loading properties:', error)
    }
  }

  async function createProperty() {
    if (!userProfile?.organization_id || !formData.client_id) return null
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          organization_id: userProfile.organization_id,
          client_id: formData.client_id,
          ...newPropertyData
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating property:', error)
      throw error
    }
  }

  function generateFileNumber() {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${year}-${random}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?.organization_id) return

    // Validation
    if (!formData.client_id) {
      alert('Please select a client.')
      return
    }

    setLoading(true)
    try {
      let propertyId = formData.property_id

      // Create new property if needed
      if (showNewProperty && newPropertyData.address_line_1) {
        propertyId = await createProperty()
        if (!propertyId) {
          throw new Error('Failed to create property')
        }
      }

      // Validate required fields
      if (!propertyId) {
        alert('Please select a property or create a new one.')
        setLoading(false)
        return
      }

      if (!formData.cause_of_loss) {
        alert('Please enter the cause of loss.')
        setLoading(false)
        return
      }

      if (!formData.date_of_loss) {
        alert('Please enter the date of loss.')
        setLoading(false)
        return
      }

      const claimData = {
        ...formData,
        property_id: propertyId,
        organization_id: userProfile.organization_id,
        assigned_adjuster_id: userProfile.id,
        created_by: userProfile.id,
        // Ensure date format is correct
        date_of_loss: new Date(formData.date_of_loss).toISOString().split('T')[0],
        date_reported: formData.date_reported ? new Date(formData.date_reported).toISOString() : new Date().toISOString()
      }

      if (claim) {
        const { data, error } = await supabase
          .from('claims')
          .update(claimData)
          .eq('id', claim.id)
          .select()
          .single()

        if (error) throw error
        onSave(data)
      } else {
        const { data, error } = await supabase
          .from('claims')
          .insert(claimData)
          .select()
          .single()

        if (error) throw error
        onSave(data)
      }

      // Clear preloaded client data if it exists
      localStorage.removeItem('preloadedClient')
      
      onClose()
    } catch (error: any) {
      console.error('Error saving claim:', error)
      alert(`Error saving claim: ${error.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {claim ? 'Edit Claim' : 'Create New Claim'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.client_type === 'commercial' 
                      ? client.business_name 
                      : `${client.first_name} ${client.last_name}`
                    }
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Number *
              </label>
              <input
                type="text"
                name="file_number"
                value={formData.file_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Number
              </label>
              <input
                type="text"
                name="claim_number"
                value={formData.claim_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carrier Claim Number
              </label>
              <input
                type="text"
                name="carrier_claim_number"
                value={formData.carrier_claim_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Status
              </label>
              <select
                name="claim_status"
                value={formData.claim_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Under Review</option>
                <option value="negotiating">Negotiating</option>
                <option value="settled">Settled</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Phase
              </label>
              <select
                name="claim_phase"
                value={formData.claim_phase}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="intake">Intake</option>
                <option value="inspection">Inspection</option>
                <option value="documentation">Documentation</option>
                <option value="negotiation">Negotiation</option>
                <option value="settlement">Settlement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Loss *
              </label>
              <input
                type="date"
                name="date_of_loss"
                value={formData.date_of_loss}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Reported
              </label>
              <input
                type="date"
                name="date_reported"
                value={formData.date_reported}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cause of Loss *
            </label>
            <select
              name="cause_of_loss"
              value={formData.cause_of_loss}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select cause of loss</option>
              <option value="fire">Fire</option>
              <option value="water_damage">Water Damage</option>
              <option value="wind_damage">Wind Damage</option>
              <option value="hail">Hail</option>
              <option value="hurricane">Hurricane</option>
              <option value="tornado">Tornado</option>
              <option value="theft">Theft</option>
              <option value="vandalism">Vandalism</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loss Description
            </label>
            <textarea
              name="loss_description"
              value={formData.loss_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the loss in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Fee Type
              </label>
              <select
                name="contract_fee_type"
                value={formData.contract_fee_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="percentage">Percentage</option>
                <option value="flat_fee">Flat Fee</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Fee Amount
                {formData.contract_fee_type === 'percentage' && ' (%)'}
                {formData.contract_fee_type === 'flat_fee' && ' ($)'}
                {formData.contract_fee_type === 'hourly' && ' ($/hour)'}
              </label>
              <div className="relative">
                {formData.contract_fee_type !== 'percentage' && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                )}
                <input
                  type="number"
                  name="contract_fee_amount"
                  value={formData.contract_fee_amount}
                  onChange={handleInputChange}
                  step={formData.contract_fee_type === 'percentage' ? '0.1' : '0.01'}
                  min="0"
                  max={formData.contract_fee_type === 'percentage' ? '100' : undefined}
                  className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.contract_fee_type !== 'percentage' ? 'pl-7 pr-3' : 'px-3'
                  }`}
                  placeholder={
                    formData.contract_fee_type === 'percentage' 
                      ? 'e.g., 10.5' 
                      : formData.contract_fee_type === 'flat_fee'
                      ? 'e.g., 5000'
                      : 'e.g., 150'
                  }
                />
                {formData.contract_fee_type === 'percentage' && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.contract_fee_type === 'percentage' && 'Enter percentage (0-100%)'}
                {formData.contract_fee_type === 'flat_fee' && 'Enter total flat fee amount'}
                {formData.contract_fee_type === 'hourly' && 'Enter hourly rate'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Loss Value ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="estimated_loss_value"
                  value={formData.estimated_loss_value}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 50000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total estimated value of the loss
              </p>
            </div>
          </div>

          {/* Calculated Fee Display */}
          {formData.contract_fee_type === 'percentage' && 
           formData.contract_fee_amount > 0 && 
           formData.estimated_loss_value > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Calculated Fee</h4>
                  <p className="text-sm text-blue-700">
                    {formData.contract_fee_amount}% of ${Number(formData.estimated_loss_value).toLocaleString()} = 
                    <span className="font-semibold"> ${((Number(formData.contract_fee_amount) / 100) * Number(formData.estimated_loss_value)).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_claim_filed"
                name="is_claim_filed"
                checked={formData.is_claim_filed}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_claim_filed" className="ml-2 text-sm text-gray-700">
                Claim Filed with Carrier
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_fema_claim"
                name="is_fema_claim"
                checked={formData.is_fema_claim}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_fema_claim" className="ml-2 text-sm text-gray-700">
                FEMA Claim
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {claim ? 'Update Claim' : 'Create Claim'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}