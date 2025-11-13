import { describe, it, expect } from 'vitest'
import { workflowAutomationService } from '../workflowAutomationService'

describe('WorkflowAutomationService', () => {
  it('should be a singleton', () => {
    const instance1 = workflowAutomationService
    const instance2 = workflowAutomationService
    expect(instance1).toBe(instance2)
  })

  it('should have initialize method', () => {
    expect(typeof workflowAutomationService.initialize).toBe('function')
  })

  it('should have getWorkflows method', () => {
    expect(typeof workflowAutomationService.getWorkflows).toBe('function')
  })

  it('should have createWorkflow method', () => {
    expect(typeof workflowAutomationService.createWorkflow).toBe('function')
  })

  it('should have executeWorkflow method', () => {
    expect(typeof workflowAutomationService.executeWorkflow).toBe('function')
  })

  it('should have createDefaultWorkflows method', () => {
    expect(typeof workflowAutomationService.createDefaultWorkflows).toBe('function')
  })
})
