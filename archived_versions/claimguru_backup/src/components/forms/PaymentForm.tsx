import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Save, CreditCard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Payment, Claim, FeeSchedule } from '../../lib/supabase'

interface PaymentFormProps {
  payment?: Payment | null
  isOpen: boolean
  onClose: () => void
  onSave: (payment: Partial<Payment>) => void
}

export function PaymentForm({ payment, isOpen, onClose, onSave }: PaymentFormProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [claims, setClaims] = useState<Pick<Claim, 'id' | 'file_number'>[]>([])
  const [feeSchedules, setFeeSchedules] = useState<Pick<FeeSchedule, 'id' | 'fee_type' | 'fee_amount' | 'claim_id'>[]>([])
  const [formData, setFormData] = useState({
    claim_id: '',
    fee_schedule_id: '',
    payment_type: 'fee_payment',
    amount: 0,
    payment_method: 'check',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    status: 'completed',
    notes: ''
  })

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadData()
    }
  }, [userProfile?.organization_id])

  useEffect(() => {
    if (payment) {
      setFormData({
        claim_id: payment.claim_id || '',
        fee_schedule_id: payment.fee_schedule_id || '',
        payment_type: payment.payment_type || 'fee_payment',
        amount: payment.amount || 0,
        payment_method: payment.payment_method || 'check',
        payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
        reference_number: payment.reference_number || '',
        status: payment.status || 'completed',
        notes: payment.notes || ''
      })
    } else {
      setFormData({
        claim_id: '',
        fee_schedule_id: '',
        payment_type: 'fee_payment',
        amount: 0,
        payment_method: 'check',
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: generateReferenceNumber(),
        status: 'completed',
        notes: ''
      })
    }
  }, [payment, isOpen])

  async function loadData() {
    try {
      const [claimsData, feesData] = await Promise.all([
        supabase
          .from('claims')
          .select('id, file_number')
          .eq('organization_id', userProfile?.organization_id)
          .order('file_number'),
        supabase
          .from('fee_schedules')
          .select('id, fee_type, fee_amount, claim_id')
          .eq('organization_id', userProfile?.organization_id)
          .order('created_at', { ascending: false })
      ])

      setClaims(claimsData.data || [])
      setFeeSchedules(feesData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  function generateReferenceNumber() {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `PAY-${timestamp}-${random}`.toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const paymentData = {
        ...formData,
        organization_id: userProfile?.organization_id,
        created_by: userProfile?.id
      }

      await onSave(paymentData)
      onClose()
    } catch (error) {
      console.error('Error saving payment:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter fee schedules based on selected claim
  const filteredFeeSchedules = formData.claim_id 
    ? feeSchedules.filter(fee => fee.claim_id === formData.claim_id)
    : feeSchedules

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {payment ? 'Edit Payment' : 'Record Payment'}
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
          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              value={formData.payment_type}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="fee_payment">Fee Payment</option>
              <option value="expense_reimbursement">Expense Reimbursement</option>
              <option value="settlement_payment">Settlement Payment</option>
              <option value="vendor_payment">Vendor Payment</option>
              <option value="refund">Refund</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Claim and Fee Schedule Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associated Claim
              </label>
              <select
                value={formData.claim_id}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    claim_id: e.target.value,
                    fee_schedule_id: '' // Reset fee schedule when claim changes
                  }))
                }}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Schedule
              </label>
              <select
                value={formData.fee_schedule_id}
                onChange={(e) => {
                  const selectedFee = feeSchedules.find(f => f.id === e.target.value)
                  setFormData(prev => ({ 
                    ...prev, 
                    fee_schedule_id: e.target.value,
                    amount: selectedFee?.fee_amount || prev.amount
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select fee schedule (optional)</option>
                {filteredFeeSchedules.map((fee) => (
                  <option key={fee.id} value={fee.id}>
                    {fee.fee_type} - ${fee.fee_amount?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount and Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="check">Check</option>
                <option value="wire_transfer">Wire Transfer</option>
                <option value="ach">ACH Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="money_order">Money Order</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Payment Date and Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Check #, Transaction ID, etc."
              />
            </div>
          </div>

          {/* Status */}
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
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter payment notes or details..."
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
              <span>{loading ? 'Saving...' : 'Save Payment'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}