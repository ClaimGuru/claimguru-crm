/**
 * Workflow Automation Service
 * Automated workflows, triggers, and actions for ClaimGuru
 */

import { supabase } from '../lib/supabase'
import { geminiService } from './geminiService'

export interface WorkflowTrigger {
  id: string
  type: 'claim_created' | 'claim_updated' | 'document_uploaded' | 'status_changed' | 'date_reached' | 'value_threshold'
  conditions?: Record<string, any>
}

export interface WorkflowAction {
  id: string
  type: 'send_email' | 'create_task' | 'update_status' | 'send_notification' | 'assign_user' | 'ai_analyze'
  parameters: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  description: string
  organization_id: string
  enabled: boolean
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  created_at: string
  updated_at: string
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed'
  trigger_data: any
  results: any[]
  error?: string
  started_at: string
  completed_at?: string
}

class WorkflowAutomationService {
  private static instance: WorkflowAutomationService
  private activeWorkflows: Map<string, Workflow> = new Map()

  private constructor() {}

  static getInstance(): WorkflowAutomationService {
    if (!WorkflowAutomationService.instance) {
      WorkflowAutomationService.instance = new WorkflowAutomationService()
    }
    return WorkflowAutomationService.instance
  }

  /**
   * Initialize workflow automation for an organization
   */
  async initialize(organizationId: string): Promise<void> {
    try {
      console.log('🤖 Initializing workflow automation...')

      // Load all active workflows
      const workflows = await this.getWorkflows(organizationId)
      workflows.filter(w => w.enabled).forEach(workflow => {
        this.activeWorkflows.set(workflow.id, workflow)
      })

      // Subscribe to database changes to trigger workflows
      this.setupTriggers(organizationId)

      console.log(`✅ Initialized ${this.activeWorkflows.size} active workflows`)
    } catch (error) {
      console.error('❌ Error initializing workflows:', error)
      throw error
    }
  }

  /**
   * Get all workflows for an organization
   */
  async getWorkflows(organizationId: string): Promise<Workflow[]> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Error fetching workflows:', error)
      return []
    }
  }

  /**
   * Create new workflow
   */
  async createWorkflow(organizationId: string, workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Promise<Workflow> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          ...workflow,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      if (data.enabled) {
        this.activeWorkflows.set(data.id, data)
      }

      console.log('✅ Workflow created:', data.name)
      return data
    } catch (error) {
      console.error('❌ Error creating workflow:', error)
      throw error
    }
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId)
        .select()
        .single()

      if (error) throw error

      // Update active workflows
      if (data.enabled) {
        this.activeWorkflows.set(data.id, data)
      } else {
        this.activeWorkflows.delete(data.id)
      }

      console.log('✅ Workflow updated:', data.name)
      return data
    } catch (error) {
      console.error('❌ Error updating workflow:', error)
      throw error
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId)

      if (error) throw error

      this.activeWorkflows.delete(workflowId)

      console.log('✅ Workflow deleted')
    } catch (error) {
      console.error('❌ Error deleting workflow:', error)
      throw error
    }
  }

  /**
   * Execute workflow manually
   */
  async executeWorkflow(workflowId: string, triggerData: any): Promise<WorkflowExecution> {
    const workflow = this.activeWorkflows.get(workflowId)
    
    if (!workflow) {
      throw new Error('Workflow not found or not active')
    }

    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      workflow_id: workflowId,
      status: 'running',
      trigger_data: triggerData,
      results: [],
      started_at: new Date().toISOString()
    }

    try {
      console.log(`🤖 Executing workflow: ${workflow.name}`)

      // Check trigger conditions
      if (!this.evaluateTriggerConditions(workflow.trigger, triggerData)) {
        execution.status = 'completed'
        execution.completed_at = new Date().toISOString()
        execution.results.push({ action: 'trigger_check', result: 'conditions_not_met' })
        return execution
      }

      // Execute each action
      for (const action of workflow.actions) {
        try {
          const result = await this.executeAction(action, triggerData, workflow.organization_id)
          execution.results.push({ action: action.type, result })
        } catch (error: any) {
          execution.results.push({ action: action.type, error: error.message })
        }
      }

      execution.status = 'completed'
      execution.completed_at = new Date().toISOString()

      console.log(`✅ Workflow completed: ${workflow.name}`)
    } catch (error: any) {
      execution.status = 'failed'
      execution.error = error.message
      execution.completed_at = new Date().toISOString()

      console.error(`❌ Workflow failed: ${workflow.name}`, error)
    }

    // Log execution
    await this.logExecution(execution)

    return execution
  }

  /**
   * Setup database triggers for workflows
   */
  private setupTriggers(organizationId: string): void {
    // Subscribe to claims changes
    supabase
      .channel(`workflows:claims:${organizationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'claims', filter: `organization_id=eq.${organizationId}` },
        (payload) => this.handleTrigger('claim_created', payload.new, organizationId)
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'claims', filter: `organization_id=eq.${organizationId}` },
        (payload) => this.handleTrigger('claim_updated', payload.new, organizationId)
      )
      .subscribe()

    // Subscribe to document changes
    supabase
      .channel(`workflows:documents:${organizationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'documents', filter: `organization_id=eq.${organizationId}` },
        (payload) => this.handleTrigger('document_uploaded', payload.new, organizationId)
      )
      .subscribe()
  }

  /**
   * Handle triggered event
   */
  private async handleTrigger(triggerType: string, data: any, organizationId: string): Promise<void> {
    console.log(`🔔 Trigger fired: ${triggerType}`)

    // Find matching workflows
    const matchingWorkflows = Array.from(this.activeWorkflows.values()).filter(
      workflow => workflow.trigger.type === triggerType && workflow.organization_id === organizationId
    )

    // Execute each matching workflow
    for (const workflow of matchingWorkflows) {
      await this.executeWorkflow(workflow.id, data)
    }
  }

  /**
   * Evaluate trigger conditions
   */
  private evaluateTriggerConditions(trigger: WorkflowTrigger, data: any): boolean {
    if (!trigger.conditions) return true

    // Simple condition evaluation
    for (const [key, value] of Object.entries(trigger.conditions)) {
      if (data[key] !== value) {
        return false
      }
    }

    return true
  }

  /**
   * Execute a single workflow action
   */
  private async executeAction(action: WorkflowAction, triggerData: any, organizationId: string): Promise<any> {
    console.log(`⚡ Executing action: ${action.type}`)

    switch (action.type) {
      case 'send_email':
        return await this.sendEmail(action.parameters, triggerData)

      case 'create_task':
        return await this.createTask(action.parameters, triggerData, organizationId)

      case 'update_status':
        return await this.updateStatus(action.parameters, triggerData)

      case 'send_notification':
        return await this.sendNotification(action.parameters, triggerData, organizationId)

      case 'assign_user':
        return await this.assignUser(action.parameters, triggerData)

      case 'ai_analyze':
        return await this.aiAnalyze(action.parameters, triggerData)

      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  /**
   * Action: Send email
   */
  private async sendEmail(params: any, data: any): Promise<any> {
    console.log('📧 Sending email...')
    // Implementation would integrate with email service
    return { sent: true, to: params.to, subject: params.subject }
  }

  /**
   * Action: Create task
   */
  private async createTask(params: any, data: any, organizationId: string): Promise<any> {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        organization_id: organizationId,
        title: params.title || 'Automated Task',
        description: params.description,
        assigned_to: params.assigned_to,
        due_date: params.due_date,
        priority: params.priority || 'medium',
        status: 'pending',
        entity_type: data.id ? 'claim' : null,
        entity_id: data.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Task created:', task.title)
    return task
  }

  /**
   * Action: Update status
   */
  private async updateStatus(params: any, data: any): Promise<any> {
    const { error } = await supabase
      .from(params.table || 'claims')
      .update({ status: params.status })
      .eq('id', data.id)

    if (error) throw error

    console.log('✅ Status updated to:', params.status)
    return { updated: true, status: params.status }
  }

  /**
   * Action: Send notification
   */
  private async sendNotification(params: any, data: any, organizationId: string): Promise<any> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        organization_id: organizationId,
        user_id: params.user_id,
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    console.log('🔔 Notification sent')
    return notification
  }

  /**
   * Action: Assign user
   */
  private async assignUser(params: any, data: any): Promise<any> {
    const { error } = await supabase
      .from('claims')
      .update({ assigned_to: params.user_id })
      .eq('id', data.id)

    if (error) throw error

    console.log('✅ User assigned:', params.user_id)
    return { assigned: true, user_id: params.user_id }
  }

  /**
   * Action: AI analysis
   */
  private async aiAnalyze(params: any, data: any): Promise<any> {
    console.log('🤖 Running AI analysis...')

    // Use Gemini to analyze the data
    const analysis = await geminiService.analyzeClaim({
      claimDescription: data.description || '',
      claimType: data.claim_type,
      estimatedAmount: parseFloat(data.claim_amount) || 0
    })

    console.log('✅ AI analysis completed')
    return analysis
  }

  /**
   * Log workflow execution
   */
  private async logExecution(execution: WorkflowExecution): Promise<void> {
    try {
      await supabase
        .from('workflow_executions')
        .insert({
          id: execution.id,
          workflow_id: execution.workflow_id,
          status: execution.status,
          trigger_data: execution.trigger_data,
          results: execution.results,
          error: execution.error,
          started_at: execution.started_at,
          completed_at: execution.completed_at
        })
    } catch (error) {
      console.error('❌ Error logging execution:', error)
    }
  }

  /**
   * Create default workflows for new organization
   */
  async createDefaultWorkflows(organizationId: string): Promise<void> {
    const defaultWorkflows = [
      {
        name: 'New Claim Auto-Assignment',
        description: 'Automatically assign new claims to available adjusters',
        enabled: true,
        trigger: {
          id: '1',
          type: 'claim_created' as const
        },
        actions: [
          {
            id: '1',
            type: 'create_task' as const,
            parameters: {
              title: 'Review New Claim',
              description: 'New claim requires initial review',
              priority: 'high'
            }
          }
        ]
      },
      {
        name: 'Document Upload Notification',
        description: 'Notify assigned user when documents are uploaded',
        enabled: true,
        trigger: {
          id: '2',
          type: 'document_uploaded' as const
        },
        actions: [
          {
            id: '1',
            type: 'send_notification' as const,
            parameters: {
              title: 'New Document Uploaded',
              message: 'A new document has been uploaded to a claim',
              type: 'info'
            }
          }
        ]
      }
    ]

    for (const workflow of defaultWorkflows) {
      await this.createWorkflow(organizationId, workflow)
    }

    console.log('✅ Default workflows created')
  }
}

export const workflowAutomationService = WorkflowAutomationService.getInstance()
export default workflowAutomationService
