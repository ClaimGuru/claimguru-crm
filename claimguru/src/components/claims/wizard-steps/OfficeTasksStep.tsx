import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  CheckSquare, 
  Plus, 
  Calendar,
  Clock,
  AlertTriangle,
  Brain,
  Flag,
  User,
  X,
  Star,
  Bell,
  Target,
  Archive,
  CheckCircle
} from 'lucide-react'
import { enhancedClaimWizardAI } from '../../../services/enhancedClaimWizardAI'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'documentation' | 'communication' | 'inspection' | 'legal' | 'administrative' | 'follow_up'
  assigneeId?: string
  assigneeName?: string
  dueDate: string
  estimatedHours?: number
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  dependencies?: string[]
  isAIGenerated: boolean
  aiReasoning?: string
}

interface TaskTemplate {
  title: string
  description: string
  category: string
  priority: string
  estimatedHours: number
}

interface OfficeTasksStepProps {
  data: any
  onUpdate: (data: any) => void
  onComplete?: () => void
}

export const OfficeTasksStep: React.FC<OfficeTasksStepProps> = ({
  data,
  onUpdate,
  onComplete
}) => {
  const [tasks, setTasks] = useState<Task[]>(data.officeTasks || [])
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'administrative',
    dueDate: '',
    estimatedHours: 1,
    status: 'pending',
    isAIGenerated: false
  })

  // Generate AI-recommended tasks
  const generateAITasks = async () => {
    setIsGeneratingTasks(true)
    try {
      const aiTasks = await enhancedClaimWizardAI.generateOfficeTasks({
        claimData: data,
        organizationPolicies: data.organizationPolicies,
        personnelAssignments: data.personnelAssignments
      })
      
      const formattedTasks: Task[] = aiTasks.map(task => ({
        id: `ai-${Date.now()}-${Math.random()}`,
        ...task,
        isAIGenerated: true,
        status: 'pending' as const
      }))
      
      const updatedTasks = [...tasks, ...formattedTasks]
      setTasks(updatedTasks)
      onUpdate({
        ...data,
        officeTasks: updatedTasks
      })
    } catch (error) {
      console.error('Failed to generate AI tasks:', error)
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="h-6 w-6 text-blue-600" />
            <span>Office Tasks & Follow-ups</span>
          </CardTitle>
          <p className="text-gray-600">
            Manage tasks and follow-ups for this claim. AI generates recommended tasks based on claim details and company policies.
          </p>
        </CardHeader>
      </Card>

      {/* Generate AI Tasks Button */}
      <div className="flex justify-between items-center">
        <Button
          onClick={generateAITasks}
          disabled={isGeneratingTasks}
          className="flex items-center space-x-2"
        >
          {isGeneratingTasks ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          <span>Generate AI Tasks</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Task</span>
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <div></div>
        <Button onClick={onComplete}>
          Complete Task Setup
        </Button>
      </div>
    </div>
  )
}
