import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Save, CheckCircle, Clock, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import type { Task, Claim } from '../../lib/supabase'

interface TaskFormProps {
  task?: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
}

export function TaskForm({ task, isOpen, onClose, onSave }: TaskFormProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [claims, setClaims] = useState<Pick<Claim, 'id' | 'file_number' | 'carrier_claim_number'>[]>([])
  const [formData, setFormData] = useState({
    task_title: '',
    description: '',
    claim_id: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    estimated_hours: 1,
    notes: ''
  })

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadClaims()
    }
  }, [userProfile?.organization_id])

  useEffect(() => {
    if (task) {
      setFormData({
        task_title: task.task_title || '',
        description: task.description || '',
        claim_id: task.claim_id || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date || '',
        estimated_hours: task.estimated_hours || 1,
        notes: task.notes || ''
      })
    } else {
      setFormData({
        task_title: '',
        description: '',
        claim_id: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        estimated_hours: 1,
        notes: ''
      })
    }
  }, [task, isOpen])

  async function loadClaims() {
    if (!userProfile?.organization_id) return
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('id, file_number, carrier_claim_number')
        .eq('organization_id', userProfile.organization_id)
        .eq('claim_status', 'open')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClaims(data || [])
    } catch (error) {
      console.error('Error loading claims:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?.organization_id) return

    setLoading(true)
    try {
      const taskData = {
        ...formData,
        organization_id: userProfile.organization_id,
        assigned_to: userProfile.id,
        created_by: userProfile.id
      }

      if (task) {
        const { data, error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', task.id)
          .select()
          .single()

        if (error) throw error
        onSave(data)
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single()

        if (error) throw error
        onSave(data)
      }

      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Error saving task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="task_title"
              value={formData.task_title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Claim
              </label>
              <select
                name="claim_id"
                value={formData.claim_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a claim (optional)</option>
                {claims.map(claim => (
                  <option key={claim.id} value={claim.id}>
                    {claim.file_number || claim.carrier_claim_number || `Claim ${claim.id.slice(0, 8)}`}
                  </option>
                ))}
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
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              name="estimated_hours"
              value={formData.estimated_hours}
              onChange={handleInputChange}
              min="0.5"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes..."
            />
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
                  {task ? 'Update Task' : 'Create Task'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}