import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { X, Calendar, Clock, MapPin, Users, Repeat, Bell } from 'lucide-react'

interface EventFormData {
  title: string
  description: string
  event_type: string
  start_datetime: string
  end_datetime: string
  all_day: boolean
  location: string
  virtual_meeting_url: string
  priority: string
  is_recurring: boolean
  recurrence_type: string
  claim_id?: string
  client_id?: string
  vendor_id?: string
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (eventData: EventFormData) => Promise<void>
  selectedDate?: Date
  event?: any // For editing existing events
}

export function EventModal({ isOpen, onClose, onSave, selectedDate, event }: EventModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: event?.title || '',
    description: event?.description || '',
    event_type: event?.event_type || 'appointment',
    start_datetime: event?.start_datetime || (selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 9, 0).toISOString().slice(0, 16) : ''),
    end_datetime: event?.end_datetime || (selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 10, 0).toISOString().slice(0, 16) : ''),
    all_day: event?.all_day || false,
    location: event?.location || '',
    virtual_meeting_url: event?.virtual_meeting_url || '',
    priority: event?.priority || 'medium',
    is_recurring: event?.is_recurring || false,
    recurrence_type: event?.recurrence_type || 'weekly',
    claim_id: event?.claim_id || '',
    client_id: event?.client_id || '',
    vendor_id: event?.vendor_id || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a title for the event')
      return
    }

    try {
      setLoading(true)
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event ? 'Edit Event' : 'Create New Event'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Event Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Event Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => handleInputChange('event_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="appointment">Appointment</option>
                  <option value="deadline">Deadline</option>
                  <option value="inspection">Inspection</option>
                  <option value="meeting">Meeting</option>
                  <option value="court_date">Court Date</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.all_day}
                onChange={(e) => handleInputChange('all_day', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="allDay" className="text-sm font-medium">All Day Event</label>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Start {formData.all_day ? 'Date' : 'Date & Time'}
                </label>
                <Input
                  type={formData.all_day ? 'date' : 'datetime-local'}
                  value={formData.all_day ? formData.start_datetime.split('T')[0] : formData.start_datetime}
                  onChange={(e) => handleInputChange('start_datetime', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  End {formData.all_day ? 'Date' : 'Date & Time'}
                </label>
                <Input
                  type={formData.all_day ? 'date' : 'datetime-local'}
                  value={formData.all_day ? formData.end_datetime.split('T')[0] : formData.end_datetime}
                  onChange={(e) => handleInputChange('end_datetime', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter location or address"
              />
            </div>

            {/* Virtual Meeting URL */}
            <div>
              <label className="block text-sm font-medium mb-1">Virtual Meeting URL</label>
              <Input
                value={formData.virtual_meeting_url}
                onChange={(e) => handleInputChange('virtual_meeting_url', e.target.value)}
                placeholder="Zoom, Teams, or other meeting link"
                type="url"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter event description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Recurring Event */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-sm font-medium flex items-center gap-1">
                  <Repeat className="h-4 w-4" />
                  Recurring Event
                </label>
              </div>

              {formData.is_recurring && (
                <div>
                  <label className="block text-sm font-medium mb-1">Repeat</label>
                  <select
                    value={formData.recurrence_type}
                    onChange={(e) => handleInputChange('recurrence_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}