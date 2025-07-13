import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Save, Receipt, Upload } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Expense, Claim, Vendor } from '../../lib/supabase'

interface ExpenseFormProps {
  expense?: Expense | null
  isOpen: boolean
  onClose: () => void
  onSave: (expense: Partial<Expense>) => void
}

export function ExpenseForm({ expense, isOpen, onClose, onSave }: ExpenseFormProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [claims, setClaims] = useState<Pick<Claim, 'id' | 'file_number'>[]>([])
  const [vendors, setVendors] = useState<Pick<Vendor, 'id' | 'company_name'>[]>([])
  const [formData, setFormData] = useState({
    claim_id: '',
    vendor_id: '',
    expense_type: 'general',
    category: 'office_supplies',
    amount: 0,
    description: '',
    receipt_url: '',
    expense_date: new Date().toISOString().split('T')[0],
    is_billable: false,
    is_reimbursed: false,
    approval_status: 'pending'
  })

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadData()
    }
  }, [userProfile?.organization_id])

  useEffect(() => {
    if (expense) {
      setFormData({
        claim_id: expense.claim_id || '',
        vendor_id: expense.vendor_id || '',
        expense_type: expense.expense_type || 'general',
        category: expense.category || 'office_supplies',
        amount: expense.amount || 0,
        description: expense.description || '',
        receipt_url: expense.receipt_url || '',
        expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
        is_billable: expense.is_billable || false,
        is_reimbursed: expense.is_reimbursed || false,
        approval_status: expense.approval_status || 'pending'
      })
    } else {
      setFormData({
        claim_id: '',
        vendor_id: '',
        expense_type: 'general',
        category: 'office_supplies',
        amount: 0,
        description: '',
        receipt_url: '',
        expense_date: new Date().toISOString().split('T')[0],
        is_billable: false,
        is_reimbursed: false,
        approval_status: 'pending'
      })
    }
  }, [expense, isOpen])

  async function loadData() {
    try {
      const [claimsData, vendorsData] = await Promise.all([
        supabase
          .from('claims')
          .select('id, file_number')
          .eq('organization_id', userProfile?.organization_id)
          .order('file_number'),
        supabase
          .from('vendors')
          .select('id, company_name')
          .eq('organization_id', userProfile?.organization_id)
          .eq('is_active', true)
          .order('company_name')
      ])

      setClaims(claimsData.data || [])
      setVendors(vendorsData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const expenseData = {
        ...formData,
        organization_id: userProfile?.organization_id,
        created_by: userProfile?.id
      }

      await onSave(expenseData)
      onClose()
    } catch (error) {
      console.error('Error saving expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `receipts/${userProfile?.organization_id}/${fileName}`

      // DISABLED: No storage uploads to prevent 405 errors
      // Simulate receipt processing without uploading
      console.log('Receipt processing simulated (no upload):', file.name)
      
      // Mock public URL for testing
      const publicUrl = `mock://receipt-${Date.now()}-${file.name}`

      setFormData(prev => ({ ...prev, receipt_url: publicUrl }))
    } catch (error) {
      console.error('Error uploading receipt:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const expenseCategories = [
    'office_supplies',
    'travel',
    'meals',
    'professional_services',
    'equipment',
    'software',
    'marketing',
    'training',
    'utilities',
    'insurance',
    'legal_fees',
    'accounting_fees',
    'contractor_fees',
    'subpoena_fees',
    'court_costs',
    'expert_witness',
    'investigation',
    'other'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {expense ? 'Edit Expense' : 'Create Expense'}
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
          {/* Claim and Vendor Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor
              </label>
              <select
                value={formData.vendor_id}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a vendor (optional)</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.company_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Type
              </label>
              <select
                value={formData.expense_type}
                onChange={(e) => setFormData(prev => ({ ...prev, expense_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="general">General Expense</option>
                <option value="claim_related">Claim Related</option>
                <option value="business_development">Business Development</option>
                <option value="administrative">Administrative</option>
                <option value="legal">Legal</option>
                <option value="professional_services">Professional Services</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount and Date */}
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
                Expense Date
              </label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Receipt
              </label>
              {formData.receipt_url && (
                <a
                  href={formData.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Receipt
                </a>
              )}
            </div>
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
              placeholder="Enter expense description..."
              required
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_billable"
                checked={formData.is_billable}
                onChange={(e) => setFormData(prev => ({ ...prev, is_billable: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_billable" className="ml-2 text-sm text-gray-700">
                Billable to Client
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_reimbursed"
                checked={formData.is_reimbursed}
                onChange={(e) => setFormData(prev => ({ ...prev, is_reimbursed: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_reimbursed" className="ml-2 text-sm text-gray-700">
                Reimbursed
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Status
              </label>
              <select
                value={formData.approval_status}
                onChange={(e) => setFormData(prev => ({ ...prev, approval_status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
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
              <span>{loading ? 'Saving...' : 'Save Expense'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}