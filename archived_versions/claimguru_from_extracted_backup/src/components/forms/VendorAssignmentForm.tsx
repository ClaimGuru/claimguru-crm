import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { 
  Calendar, 
  User, 
  FileText, 
  DollarSign,
  AlertCircle,
  Clock
} from 'lucide-react'
import type { Vendor } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface Assignment {
  id: string
  vendor_id: string
  claim_id: string
  assignment_type: string
  description: string
  assigned_date: string
  due_date?: string
  status: string
  priority: string
  amount?: number
}

interface VendorAssignmentFormProps {
  assignment?: Assignment | null
  vendors: Vendor[]
  onSave: (data: any) => void
  onCancel: () => void
}

export function VendorAssignmentForm({ assignment, vendors, onSave, onCancel }: VendorAssignmentFormProps) {
  const { userProfile } = useAuth()
  const [formData, setFormData] = useState({
    vendor_id: '',
    claim_id: '',
    assignment_type: 'inspection',
    description: '',
    assigned_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'assigned',
    priority: 'medium',
    amount: '',
    notes: ''
  })
  
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadClaims()
    if (assignment) {
      setFormData({
        vendor_id: assignment.vendor_id || '',
        claim_id: assignment.claim_id || '',
        assignment_type: assignment.assignment_type || 'inspection',
        description: assignment.description || '',
        assigned_date: assignment.assigned_date ? assignment.assigned_date.split('T')[0] : '',
        due_date: assignment.due_date ? assignment.due_date.split('T')[0] : '',
        status: assignment.status || 'assigned',
        priority: assignment.priority || 'medium',
        amount: assignment.amount?.toString() || '',
        notes: ''
      })
    }
  }, [assignment])

  async function loadClaims() {
    try {
      const { data } = await supabase
        .from('claims')
        .select('id, file_number, claim_status')
        .eq('organization_id', userProfile?.organization_id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      setClaims(data || [])
    } catch (error) {
      console.error('Error loading claims:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      assigned_date: formData.assigned_date ? new Date(formData.assigned_date).toISOString() : null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
    }
    
    onSave(submitData)
  }

  const assignmentTypes = [
    'inspection',
    'repair',
    'evaluation',
    'cleanup',
    'documentation',
    'consultation',
    'other'
  ]

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Assignment Details */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Assignment Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor *
            </label>
            <select
              value={formData.vendor_id}
              onChange={(e) => setFormData(prev => ({ ...prev, vendor_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select vendor...</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.company_name} - {vendor.category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claim *
            </label>
            <select
              value={formData.claim_id}
              onChange={(e) => setFormData(prev => ({ ...prev, claim_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select claim...</option>
              {claims.map(claim => (
                <option key={claim.id} value={claim.id}>
                  {claim.file_number} - {claim.claim_status}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Type *
            </label>
            <select
              value={formData.assignment_type}
              onChange={(e) => setFormData(prev => ({ ...prev, assignment_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              {assignmentTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Describe the work to be performed..."
            required
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Timeline
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Date *
            </label>
            <input
              type="date"
              value={formData.assigned_date}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Financial Information
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Additional notes or special instructions..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {assignment ? 'Update Assignment' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  )
}