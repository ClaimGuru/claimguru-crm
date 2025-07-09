import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Edit,
  Trash2,
  Bell,
  Repeat,
  Filter,
  Download,
  Upload
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  start_datetime: string
  end_datetime: string
  event_type: string
  location?: string
  virtual_meeting_url?: string
  status: string
  priority: string
  all_day: boolean
  is_recurring: boolean
  claim_id?: string
  client_id?: string
  vendor_id?: string
  attendees?: Array<{
    name: string
    email: string
    response_status: string
  }>
}

export function Calendar() {
  const { userProfile } = useAuth()
  const { success, error } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadEvents()
    }
  }, [userProfile?.organization_id, currentDate, viewMode])

  async function loadEvents() {
    if (!userProfile?.organization_id) return

    try {
      setLoading(true)
      
      // Calculate date range based on view mode
      const startDate = getViewStartDate()
      const endDate = getViewEndDate()
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_attendees(name, email, response_status)
        `)
        .eq('organization_id', userProfile.organization_id)
        .gte('start_datetime', startDate.toISOString())
        .lte('start_datetime', endDate.toISOString())
        .order('start_datetime', { ascending: true })

      if (error) throw error

      setEvents(data || [])
    } catch (error: any) {
      console.error('Error loading events:', error)
      error('Failed to load events', error.message)
    } finally {
      setLoading(false)
    }
  }

  function getViewStartDate(): Date {
    const date = new Date(currentDate)
    switch (viewMode) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth(), 1)
      case 'week':
        const day = date.getDay()
        date.setDate(date.getDate() - day)
        return date
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
      default:
        return date
    }
  }

  function getViewEndDate(): Date {
    const date = new Date(currentDate)
    switch (viewMode) {
      case 'month':
        return new Date(date.getFullYear(), date.getMonth() + 1, 0)
      case 'week':
        const day = date.getDay()
        date.setDate(date.getDate() - day + 6)
        return date
      case 'day':
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
      default:
        return date
    }
  }

  function navigateDate(direction: 'prev' | 'next') {
    const newDate = new Date(currentDate)
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
    }
    
    setCurrentDate(newDate)
  }

  function formatDateTime(dateTime: string, allDay: boolean = false): string {
    const date = new Date(dateTime)
    if (allDay) {
      return date.toLocaleDateString()
    }
    return date.toLocaleString()
  }

  function getEventTypeColor(eventType: string): string {
    const colors = {
      appointment: 'bg-blue-100 text-blue-800 border-blue-200',
      deadline: 'bg-red-100 text-red-800 border-red-200',
      inspection: 'bg-green-100 text-green-800 border-green-200',
      meeting: 'bg-purple-100 text-purple-800 border-purple-200',
      court_date: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[eventType as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  function getPriorityIcon(priority: string) {
    switch (priority) {
      case 'urgent':
        return <Bell className="h-4 w-4 text-red-500" />
      case 'high':
        return <Bell className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true
    return event.event_type === filterType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Scheduling</h1>
          <p className="text-gray-600">Manage appointments, deadlines, and events</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Button onClick={() => setShowEventModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric',
                  ...(viewMode === 'day' && { day: 'numeric' })
                })}
              </h2>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border">
                {(['month', 'week', 'day'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
              
              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="ml-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Events</option>
                <option value="appointment">Appointments</option>
                <option value="deadline">Deadlines</option>
                <option value="inspection">Inspections</option>
                <option value="meeting">Meetings</option>
                <option value="court_date">Court Dates</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <div className="grid gap-6">
        {viewMode === 'month' && (
          <MonthView 
            events={filteredEvents} 
            currentDate={currentDate}
            onEventClick={setSelectedEvent}
            getEventTypeColor={getEventTypeColor}
            getPriorityIcon={getPriorityIcon}
          />
        )}
        
        {viewMode === 'week' && (
          <WeekView 
            events={filteredEvents} 
            currentDate={currentDate}
            onEventClick={setSelectedEvent}
            getEventTypeColor={getEventTypeColor}
            getPriorityIcon={getPriorityIcon}
          />
        )}
        
        {viewMode === 'day' && (
          <DayView 
            events={filteredEvents} 
            currentDate={currentDate}
            onEventClick={setSelectedEvent}
            getEventTypeColor={getEventTypeColor}
            getPriorityIcon={getPriorityIcon}
          />
        )}
      </div>

      {/* Upcoming Events Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEvents.slice(0, 5).map((event) => (
              <div 
                key={event.id}
                className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getEventTypeColor(event.event_type)}`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{event.title}</h4>
                      {getPriorityIcon(event.priority)}
                      {event.is_recurring && <Repeat className="h-4 w-4" />}
                    </div>
                    <p className="text-sm opacity-75 mt-1">
                      {formatDateTime(event.start_datetime, event.all_day)}
                    </p>
                    {event.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{event.location}</span>
                      </div>
                    )}
                    {event.virtual_meeting_url && (
                      <div className="flex items-center gap-1 mt-1">
                        <Video className="h-3 w-3" />
                        <span className="text-xs">Virtual Meeting</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events scheduled</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowEventModal(true)}
                >
                  Create your first event
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder components for different calendar views
function MonthView({ events, currentDate, onEventClick, getEventTypeColor, getPriorityIcon }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Month view implementation coming soon</p>
          <p className="text-sm">Showing {events.length} events</p>
        </div>
      </CardContent>
    </Card>
  )
}

function WeekView({ events, currentDate, onEventClick, getEventTypeColor, getPriorityIcon }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Week view implementation coming soon</p>
          <p className="text-sm">Showing {events.length} events</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DayView({ events, currentDate, onEventClick, getEventTypeColor, getPriorityIcon }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Day view implementation coming soon</p>
          <p className="text-sm">Showing {events.length} events</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default Calendar