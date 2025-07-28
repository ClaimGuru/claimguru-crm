import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { Switch } from '../../ui/Switch'
import { CheckSquare, Plus, X, Calendar, User, AlertCircle, Clock } from 'lucide-react'

interface OfficeTasksStepProps {
  data: any
  onUpdate: (data: any) => void
}

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  dueDate: string
  category: string
  isAutomatic: boolean
  status: 'pending' | 'in_progress' | 'completed'
  estimatedHours: number
}

export function OfficeTasksStep({ data, onUpdate }: OfficeTasksStepProps) {
  const [stepData, setStepData] = useState({
    automaticTasks: data.automaticTasks || [],
    customTasks: data.customTasks || [],
    taskCategories: data.taskCategories || []
  })

  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    category: '',
    estimatedHours: 1
  })

  // Predefined automatic tasks that are typically created for new claims
  const defaultAutomaticTasks = [
    {
      id: 'auto_1',
      title: 'Initial Client Contact Follow-up',
      description: 'Contact client within 24 hours to confirm receipt of claim and next steps',
      priority: 'high',
      assignedTo: 'Claims Adjuster',
      dueDate: getDateInDays(1),
      category: 'Client Communication',
      isAutomatic: true,
      status: 'pending',
      estimatedHours: 0.5
    },
    {
      id: 'auto_2',
      title: 'Insurance Carrier Notification',
      description: 'Submit formal claim notice to insurance carrier',
      priority: 'high',
      assignedTo: 'Claims Processor',
      dueDate: getDateInDays(2),
      category: 'Insurance Processing',
      isAutomatic: true,
      status: 'pending',
      estimatedHours: 1
    },
    {
      id: 'auto_3',
      title: 'Initial Damage Assessment',
      description: 'Schedule and conduct initial property damage assessment',
      priority: 'high',
      assignedTo: 'Field Adjuster',
      dueDate: getDateInDays(3),
      category: 'Assessment',
      isAutomatic: true,
      status: 'pending',
      estimatedHours: 2
    },
    {
      id: 'auto_4',
      title: 'Document Collection',
      description: 'Collect all relevant documents (policy, photos, receipts, etc.)',
      priority: 'medium',
      assignedTo: 'Claims Assistant',
      dueDate: getDateInDays(5),
      category: 'Documentation',
      isAutomatic: true,
      status: 'pending',
      estimatedHours: 1.5
    },
    {
      id: 'auto_5',
      title: 'Emergency Mitigation Review',
      description: 'Review and approve emergency mitigation measures if needed',
      priority: 'urgent',
      assignedTo: 'Senior Adjuster',
      dueDate: getDateInDays(1),
      category: 'Emergency Response',
      isAutomatic: true,
      status: 'pending',
      estimatedHours: 1
    },
    {
      id: 'auto_6',
      title: 'Vendor Coordination',
      description: 'Coordinate with contractors and vendors for damage repair',
      priority: 'medium',
      assignedTo: 'Project Manager',
      dueDate: getDateInDays(7),
      category: 'Vendor Management',
      isAutomatic: true,
      status: 'pending',
      estimatedHours: 2
    },
    {
      id: 'auto_7',
      title: 'Policy Coverage Review',
      description: 'Detailed review of policy coverage and applicable deductibles',
      priority: 'high',
      assignedTo: 'Policy Analyst',
      dueDate: getDateInDays(3),
      category: 'Policy Review',
      isAutomatic: true,
      status: 'pending',
      estimatedHours: 2
    }
  ]

  // Initialize automatic tasks if not already set
  React.useEffect(() => {
    if (stepData.automaticTasks.length === 0) {
      const updatedData = {
        ...stepData,
        automaticTasks: defaultAutomaticTasks
      }
      setStepData(updatedData)
      onUpdate(updatedData)
    }
  }, [])

  function getDateInDays(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  const updateField = (field: string, value: any) => {
    const updatedData = { ...stepData, [field]: value }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const toggleAutomaticTask = (taskId: string, enabled: boolean) => {
    const updatedTasks = stepData.automaticTasks.map((task: Task) =>
      task.id === taskId ? { ...task, status: enabled ? 'pending' : 'completed' } : task
    )
    updateField('automaticTasks', updatedTasks)
  }

  const addCustomTask = () => {
    if (!newTask.title || !newTask.assignedTo) {
      alert('Please fill in the task title and assignee')
      return
    }

    const customTask: Task = {
      id: `custom_${Date.now()}`,
      title: newTask.title!,
      description: newTask.description || '',
      priority: newTask.priority as any,
      assignedTo: newTask.assignedTo!,
      dueDate: newTask.dueDate || getDateInDays(7),
      category: newTask.category || 'General',
      isAutomatic: false,
      status: 'pending',
      estimatedHours: newTask.estimatedHours || 1
    }

    const updatedTasks = [...stepData.customTasks, customTask]
    updateField('customTasks', updatedTasks)

    // Reset form
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
      category: '',
      estimatedHours: 1
    })
    setShowNewTaskForm(false)
  }

  const removeCustomTask = (taskId: string) => {
    const updatedTasks = stepData.customTasks.filter((task: Task) => task.id !== taskId)
    updateField('customTasks', updatedTasks)
  }

  const updateCustomTask = (taskId: string, field: string, value: any) => {
    const updatedTasks = stepData.customTasks.map((task: Task) =>
      task.id === taskId ? { ...task, [field]: value } : task
    )
    updateField('customTasks', updatedTasks)
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  const categoryOptions = [
    'Client Communication',
    'Insurance Processing',
    'Assessment',
    'Documentation',
    'Emergency Response',
    'Vendor Management',
    'Policy Review',
    'Legal',
    'Financial',
    'General'
  ]

  const teamMembers = [
    'Claims Adjuster',
    'Field Adjuster',
    'Senior Adjuster',
    'Claims Processor',
    'Claims Assistant',
    'Policy Analyst',
    'Project Manager',
    'Legal Counsel',
    'Office Manager',
    'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Automatic Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Automatic Tasks & Follow-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              These tasks are automatically created for every new claim. Toggle off any tasks that don't apply to this specific case.
            </p>
          </div>
          
          <div className="space-y-3">
            {stepData.automaticTasks.map((task: Task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Switch
                      checked={task.status !== 'completed'}
                      onChange={(checked) => toggleAutomaticTask(task.id, checked)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignedTo}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimatedHours}h
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Custom Tasks
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add New Task Form */}
          {showNewTaskForm && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-900">Add New Task</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select team member</option>
                    {teamMembers.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Task description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Est. Hours
                  </label>
                  <Input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) || 1 })}
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={addCustomTask}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Task
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTaskForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Custom Tasks List */}
          <div className="space-y-3">
            {stepData.customTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No custom tasks added yet. Click "Add Task" to create specific tasks for this claim.
              </p>
            ) : (
              stepData.customTasks.map((task: Task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignedTo}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimatedHours}h
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                          {task.category}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomTask(task.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OfficeTasksStep