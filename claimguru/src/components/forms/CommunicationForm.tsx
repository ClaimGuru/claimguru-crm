import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Save, Send, MessageSquare, Mail, Phone, Calendar, Clock, FileText, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import type { Communication, Claim, Client } from '../../lib/supabase'

interface CommunicationFormProps {
  communication?: Communication | null
  claims: Claim[]
  clients: Client[]
  isOpen: boolean
  onClose: () => void
  onSave: (communication: Partial<Communication>) => void
}

export function CommunicationForm({ 
  communication, 
  claims, 
  clients, 
  isOpen, 
  onClose, 
  onSave 
}: CommunicationFormProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    claim_id: '',
    client_id: '',
    vendor_id: '',
    communication_type: 'email',
    direction: 'outbound',
    subject: '',
    content: '',
    status: 'draft',
    scheduled_at: '',
    follow_up_required: false,
    follow_up_date: '',
    urgency: 'normal',
    attachments: [],
    metadata: {}
  })

  useEffect(() => {
    if (communication) {
      setFormData({
        claim_id: communication.claim_id || '',
        client_id: communication.client_id || '',
        vendor_id: communication.vendor_id || '',
        communication_type: communication.communication_type || 'email',
        direction: communication.direction || 'outbound',
        subject: communication.subject || '',
        content: communication.content || '',
        status: communication.status || 'draft',
        scheduled_at: communication.scheduled_at || '',
        follow_up_required: communication.follow_up_required || false,
        follow_up_date: communication.follow_up_date || '',
        urgency: communication.urgency || 'normal',
        attachments: communication.attachments || [],
        metadata: communication.metadata || {}
      })
    } else {
      setFormData({
        claim_id: '',
        client_id: '',
        vendor_id: '',
        communication_type: 'email',
        direction: 'outbound',
        subject: '',
        content: '',
        status: 'draft',
        scheduled_at: '',
        follow_up_required: false,
        follow_up_date: '',
        urgency: 'normal',
        attachments: [],
        metadata: {}
      })
    }
  }, [communication, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const communicationData = {
        ...formData,
        organization_id: userProfile?.organization_id,
        created_by: userProfile?.id
      }

      await onSave(communicationData)
      onClose()
    } catch (error) {
      console.error('Error saving communication:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNow = async () => {
    setFormData(prev => ({ ...prev, status: 'pending', scheduled_at: '' }))
    await handleSubmit(new Event('submit') as any)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              {getTypeIcon(formData.communication_type)}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {communication ? 'Edit Communication' : 'New Communication'}
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
          {/* Communication Type and Direction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Type
              </label>
              <select
                value={formData.communication_type}
                onChange={(e) => setFormData(prev => ({ ...prev, communication_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="phone">Phone Call</option>
                <option value="meeting">Meeting</option>
                <option value="letter">Letter</option>
                <option value="fax">Fax</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direction
              </label>
              <select
                value={formData.direction}
                onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Associations */}
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
                Contact
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a contact (optional)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.business_name || `${client.first_name || ''} ${client.last_name || ''}`.trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject (for email/letter) */}
          {(formData.communication_type === 'email' || formData.communication_type === 'letter') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter subject line..."
                required={formData.communication_type === 'email'}
              />
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.communication_type === 'phone' ? 'Call Notes' :
               formData.communication_type === 'meeting' ? 'Meeting Notes' :
               formData.communication_type === 'sms' ? 'Message' : 'Content'}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={formData.communication_type === 'sms' ? 3 : 6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${formData.communication_type === 'phone' ? 'call notes' :
                             formData.communication_type === 'meeting' ? 'meeting details' :
                             formData.communication_type === 'sms' ? 'message text' : 'content'}...`}
              required
            />
            {formData.communication_type === 'sms' && (
              <p className="text-xs text-gray-500 mt-1">
                Character count: {formData.content.length}/160
              </p>
            )}
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule for later (optional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.follow_up_required}
                  onChange={(e) => setFormData(prev => ({ ...prev, follow_up_required: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Requires follow-up</span>
              </label>
            </div>
          </div>

          {/* Follow-up Date */}
          {formData.follow_up_required && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Date
              </label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {/* Email Templates (for email type) */}
          {formData.communication_type === 'email' && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { name: 'Initial Contact', content: 'Thank you for choosing our services. We have received your claim and will begin processing it immediately...' },
                  { name: 'Status Update', content: 'We wanted to provide you with an update on your claim. Current status...' },
                  { name: 'Document Request', content: 'To continue processing your claim, we need the following documents...' },
                  { name: 'Settlement Offer', content: 'We are pleased to inform you that we have received a settlement offer for your claim...' },
                  { name: 'Claim Closure', content: 'Your claim has been successfully processed and closed. Final settlement details...' },
                  { name: 'Follow-up Required', content: 'We need to schedule a follow-up regarding your claim. Please let us know your availability...' }
                ].map((template) => (
                  <Button
                    key={template.name}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        subject: prev.subject || template.name,
                        content: template.content
                      }))
                    }}
                    className="text-xs h-8"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="responded">Responded</option>
              <option value="failed">Failed</option>
            </select>
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
            
            {!communication && formData.communication_type !== 'phone' && formData.communication_type !== 'meeting' && (
              <Button
                type="button"
                onClick={handleSendNow}
                disabled={loading || !formData.content}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Sending...' : 'Send Now'}</span>
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : formData.scheduled_at ? 'Schedule' : 'Save Draft'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}