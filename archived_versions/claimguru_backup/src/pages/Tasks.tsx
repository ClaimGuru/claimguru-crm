import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  CheckSquare, Clock, AlertCircle, Users, Calendar, Search, Filter, Plus,
  Play, Pause, Square, MoreVertical, Flag, User, ArrowRight, Target,
  TrendingUp, CheckCircle, XCircle, Timer, Zap, FileText
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Task } from '../lib/supabase'

export function Tasks() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'all-tasks' | 'workflows' | 'templates'>('my-tasks')

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadTasks()
    }
  }, [userProfile?.organization_id])

  async function loadTasks() {
    if (!userProfile?.organization_id) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesAssignee = assigneeFilter === 'all' || task.assigned_to === assigneeFilter
    
    let matchesTab = true
    if (activeTab === 'my-tasks') {
      matchesTab = task.assigned_to === userProfile?.id
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesTab
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'in_progress': return Play
      case 'pending': return Clock
      case 'cancelled': return XCircle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertCircle
      case 'medium': return Flag
      case 'low': return Clock
      default: return Clock
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getDueDateStatus = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'overdue', color: 'text-red-600', text: 'Overdue' }
    if (diffDays === 0) return { status: 'today', color: 'text-orange-600', text: 'Due Today' }
    if (diffDays === 1) return { status: 'tomorrow', color: 'text-yellow-600', text: 'Due Tomorrow' }
    if (diffDays <= 7) return { status: 'week', color: 'text-blue-600', text: `${diffDays} days` }
    return { status: 'future', color: 'text-gray-600', text: `${diffDays} days` }
  }

  // Calculate task metrics
  const totalTasks = tasks.length
  const myTasks = tasks.filter(t => t.assigned_to === userProfile?.id)
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date) return false
    return new Date(t.due_date) < new Date() && t.status !== 'completed'
  })
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-2">
            Organize workflows, assign tasks, and track progress
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Workflow
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{myTasks.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {myTasks.filter(t => t.status !== 'completed').length} pending
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{inProgressTasks.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((inProgressTasks.length / totalTasks) * 100).toFixed(0)}% of total
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{completedTasks.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((completedTasks.length / totalTasks) * 100).toFixed(0)}% completion rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-gray-900">{overdueTasks.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Requires attention
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'my-tasks', label: 'My Tasks', icon: User },
            { id: 'all-tasks', label: 'All Tasks', icon: CheckSquare },
            { id: 'workflows', label: 'Workflows', icon: Zap },
            { id: 'templates', label: 'Templates', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      {(activeTab === 'my-tasks' || activeTab === 'all-tasks') && (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Tasks Display */}
      {(activeTab === 'my-tasks' || activeTab === 'all-tasks') && (
        <>
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {tasks.length === 0 
                    ? 'Create your first task to get started'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {tasks.length === 0 && (
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Task
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status)
                const PriorityIcon = getPriorityIcon(task.priority)
                const statusColorClass = getStatusColor(task.status)
                const priorityColorClass = getPriorityColor(task.priority)
                const dueDateInfo = task.due_date ? getDueDateStatus(task.due_date) : null
                
                return (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              onChange={() => {
                                // Handle task completion toggle
                              }}
                            />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              task.priority === 'high' ? 'bg-red-100' :
                              task.priority === 'medium' ? 'bg-yellow-100' :
                              'bg-green-100'
                            }`}>
                              <PriorityIcon className={`h-4 w-4 ${priorityColorClass}`} />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`font-semibold ${
                                task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                                {task.task_title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                                <StatusIcon className="h-3 w-3 inline mr-1" />
                                {task.status.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {task.description && (
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {task.due_date && dueDateInfo && (
                                <span className={`flex items-center ${dueDateInfo.color}`}>
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {dueDateInfo.text}
                                </span>
                              )}
                              
                              {task.assigned_to && (
                                <span className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  Assigned
                                </span>
                              )}
                              
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Created {new Date(task.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {task.status === 'pending' && (
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              Start
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Pause className="h-3 w-3" />
                              Pause
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Workflow Automation</h2>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'New Claim Processing',
                description: 'Automatically creates tasks when a new claim is assigned',
                trigger: 'New claim created',
                actions: '5 automated tasks',
                status: 'active'
              },
              {
                name: 'Inspection Follow-up',
                description: 'Sends reminders and creates follow-up tasks for inspections',
                trigger: 'Inspection scheduled',
                actions: '3 automated tasks',
                status: 'active'
              },
              {
                name: 'Document Review',
                description: 'Routes documents for review and approval',
                trigger: 'Document uploaded',
                actions: '2 automated tasks',
                status: 'draft'
              }
            ].map((workflow, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Target className="h-3 w-3 mr-2" />
                      Trigger: {workflow.trigger}
                    </div>
                    <div className="flex items-center">
                      <ArrowRight className="h-3 w-3 mr-2" />
                      {workflow.actions}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Task Templates</h2>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Property Inspection Checklist',
                description: 'Standard checklist for property inspections',
                tasks: 12,
                category: 'Inspection'
              },
              {
                name: 'Claim Investigation Process',
                description: 'Step-by-step investigation workflow',
                tasks: 8,
                category: 'Investigation'
              },
              {
                name: 'Document Collection',
                description: 'Gather all required documentation',
                tasks: 6,
                category: 'Documentation'
              },
              {
                name: 'Settlement Negotiation',
                description: 'Negotiation and settlement process',
                tasks: 10,
                category: 'Settlement'
              }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {template.category}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <CheckSquare className="h-3 w-3 mr-2" />
                    {template.tasks} tasks included
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}