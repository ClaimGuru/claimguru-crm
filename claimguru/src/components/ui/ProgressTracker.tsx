import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertCircle, ArrowRight, Play, Pause } from 'lucide-react'

interface ProgressStep {
  id: string
  title: string
  description?: string
  status: 'pending' | 'active' | 'completed' | 'error'
  duration?: number
  startTime?: Date
  endTime?: Date
}

interface ProgressTrackerProps {
  steps: ProgressStep[]
  currentStep?: string
  orientation?: 'horizontal' | 'vertical'
  showTime?: boolean
  animated?: boolean
  className?: string
}

export function ProgressTracker({
  steps,
  currentStep,
  orientation = 'horizontal',
  showTime = false,
  animated = true,
  className = ''
}: ProgressTrackerProps) {
  const [animatedSteps, setAnimatedSteps] = useState<ProgressStep[]>(steps)
  
  useEffect(() => {
    if (animated) {
      setAnimatedSteps(steps)
    }
  }, [steps, animated])
  
  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-white" />
      case 'active':
        return <Play className="h-5 w-5 text-white" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-white" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }
  
  const getStepColor = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-500'
      case 'active':
        return 'bg-blue-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }
  
  const getConnectorColor = (currentIndex: number) => {
    const currentStep = animatedSteps[currentIndex]
    const nextStep = animatedSteps[currentIndex + 1]
    
    if (currentStep.status === 'completed' && nextStep?.status !== 'pending') {
      return 'bg-green-500'
    }
    if (currentStep.status === 'active') {
      return 'bg-blue-500'
    }
    return 'bg-gray-300'
  }
  
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }
  
  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {animatedSteps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(step)} transition-colors duration-300`}>
                {getStepIcon(step)}
              </div>
              {index < animatedSteps.length - 1 && (
                <div className={`w-0.5 h-12 mt-2 transition-colors duration-300 ${getConnectorColor(index)}`} />
              )}
            </div>
            
            {/* Step content */}
            <div className="flex-1 min-w-0 pb-8">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-medium transition-colors duration-300 ${
                  step.status === 'completed' ? 'text-green-700' :
                  step.status === 'active' ? 'text-blue-700' :
                  step.status === 'error' ? 'text-red-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </h3>
                {showTime && step.duration && (
                  <span className="text-xs text-gray-500">
                    {formatDuration(step.duration)}
                  </span>
                )}
              </div>
              {step.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {step.description}
                </p>
              )}
              {showTime && step.startTime && (
                <p className="mt-1 text-xs text-gray-500">
                  Started: {step.startTime.toLocaleTimeString()}
                  {step.endTime && (
                    <> • Completed: {step.endTime.toLocaleTimeString()}</>
                  )}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  // Horizontal layout
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {animatedSteps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(step)} transition-colors duration-300`}>
              {getStepIcon(step)}
            </div>
            <div className="text-center">
              <h3 className={`text-sm font-medium transition-colors duration-300 ${
                step.status === 'completed' ? 'text-green-700' :
                step.status === 'active' ? 'text-blue-700' :
                step.status === 'error' ? 'text-red-700' :
                'text-gray-500'
              }`}>
                {step.title}
              </h3>
              {step.description && (
                <p className="text-xs text-gray-600 mt-1 max-w-24 truncate">
                  {step.description}
                </p>
              )}
              {showTime && step.duration && (
                <span className="text-xs text-gray-500">
                  {formatDuration(step.duration)}
                </span>
              )}
            </div>
          </div>
          
          {/* Connector */}
          {index < animatedSteps.length - 1 && (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className={`h-0.5 flex-1 transition-colors duration-300 ${getConnectorColor(index)}`} />
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Real-time progress tracker for AI processing
interface AIProcessingProgressProps {
  isProcessing: boolean
  currentTask?: string
  progress?: number
  stages?: string[]
  onCancel?: () => void
  className?: string
}

export function AIProcessingProgress({
  isProcessing,
  currentTask = 'Processing...',
  progress = 0,
  stages = [],
  onCancel,
  className = ''
}: AIProcessingProgressProps) {
  const [dots, setDots] = useState('')
  
  // Animated dots effect
  useEffect(() => {
    if (!isProcessing) return
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [isProcessing])
  
  if (!isProcessing) return null
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          AI Processing{dots}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{currentTask}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Stages */}
      {stages.length > 0 && (
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const isActive = index === Math.floor((progress / 100) * stages.length)
            const isCompleted = index < Math.floor((progress / 100) * stages.length)
            
            return (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isCompleted ? 'bg-green-500' :
                  isActive ? 'bg-blue-500 animate-pulse' :
                  'bg-gray-300'
                }`} />
                <span className={`text-sm ${
                  isCompleted ? 'text-green-700' :
                  isActive ? 'text-blue-700' :
                  'text-gray-500'
                }`}>
                  {stage}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProgressTracker