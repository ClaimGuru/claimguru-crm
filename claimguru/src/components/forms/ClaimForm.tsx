import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Save, FileText, User, Calendar, DollarSign } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Claim, Client } from '../../lib/supabase'

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
  const [formData, setFormData] = useState({
    client_id: '',
    file_number: '',
    claim_number: '',
    carrier_claim_number: '',
    status: 'open',
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

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadClients()
    }
  }, [userProfile?.organization_id])

  useEffect(() => {
    if (claim) {
      setFormData({
        client_id: claim.client_id || '',
        file_number: claim.file_number || '',
        claim_number: claim.claim_number || '',
        carrier_claim_number: claim.carrier_claim_number || '',
        status: claim.claim_status || 'open',
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
        status: 'open',
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

    setLoading(true)
    try {
      const claimData = {
        ...formData,
        organization_id: userProfile.organization_id,
        assigned_adjuster_id: userProfile.id,
        created_by: userProfile.id
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

      onClose()
    } catch (error) {
      console.error('Error saving claim:', error)
      alert('Error saving claim. Please try again.')
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
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
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
              </label>
              <input
                type="number"
                name="contract_fee_amount"
                value={formData.contract_fee_amount}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Loss Value
              </label>
              <input
                type="number"
                name="estimated_loss_value"
                value={formData.estimated_loss_value}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

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