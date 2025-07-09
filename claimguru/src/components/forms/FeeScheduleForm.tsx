import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Save, DollarSign } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { FeeSchedule, Claim } from '../../lib/supabase'

interface FeeScheduleFormProps {
  feeSchedule?: FeeSchedule | null
  isOpen: boolean
  onClose: () => void
  onSave: (feeSchedule: Partial<FeeSchedule>) => void
}

export function FeeScheduleForm({ feeSchedule, isOpen, onClose, onSave }: FeeScheduleFormProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [claims, setClaims] = useState<Pick<Claim, 'id' | 'file_number'>[]>([])
  const [formData, setFormData] = useState({
    claim_id: '',
    fee_type: 'percentage',
    fee_amount: 0,
    fee_percentage: 10,
    description: '',
    status: 'pending',
    due_date: '',
    invoice_number: ''
  })

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadClaims()
    }
  }, [userProfile?.organization_id])

  useEffect(() => {
    if (feeSchedule) {
      setFormData({
        claim_id: feeSchedule.claim_id || '',
        fee_type: feeSchedule.fee_type || 'percentage',
        fee_amount: feeSchedule.fee_amount || 0,
        fee_percentage: feeSchedule.fee_percentage || 10,
        description: feeSchedule.description || '',
        status: feeSchedule.status || 'pending',
        due_date: feeSchedule.due_date || '',
        invoice_number: feeSchedule.invoice_number || ''
      })
    } else {
      setFormData({
        claim_id: '',
        fee_type: 'percentage',
        fee_amount: 0,
        fee_percentage: 10,
        description: '',
        status: 'pending',
        due_date: '',
        invoice_number: generateInvoiceNumber()
      })
    }
  }, [feeSchedule, isOpen])

  async function loadClaims() {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('id, file_number')
        .eq('organization_id', userProfile?.organization_id)
        .order('file_number')

      if (error) throw error
      setClaims(data || [])
    } catch (error) {
      console.error('Error loading claims:', error)
    }
  }

  function generateInvoiceNumber() {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `INV-${timestamp}-${random}`.toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const feeData = {
        ...formData,
        organization_id: userProfile?.organization_id,
        created_by: userProfile?.id
      }

      await onSave(feeData)
      onClose()
    } catch (error) {
      console.error('Error saving fee schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {feeSchedule ? 'Edit Fee Schedule' : 'Create Fee Schedule'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Claim Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Claim
            </label>
            <select
              value={formData.claim_id}
              onChange={(e) => setFormData(prev => ({ ...prev, claim_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a claim (optional)</option>
              {claims.map((claim) => (
                <option key={claim.id} value={claim.id}>
                  {claim.file_number}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Type and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Type
              </label>
              <select
                value={formData.fee_type}
                onChange={(e) => setFormData(prev => ({ ...prev, fee_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="percentage">Percentage</option>
                <option value="flat_fee">Flat Fee</option>
                <option value="hourly">Hourly Rate</option>
                <option value="contingency">Contingency</option>
                <option value="retainer">Retainer</option>
              </select>
            </div>

            {formData.fee_type === 'percentage' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.fee_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, fee_percentage: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fee_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, fee_amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}
          </div>

          {/* Status and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="pending">Pending</option>
                <option value="invoiced">Invoiced</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number
            </label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="INV-XXXXXX"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter fee description or notes..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Fee Schedule'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}