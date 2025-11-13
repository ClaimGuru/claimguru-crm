import { describe, it, expect } from 'vitest'
import { salesPipelineService } from '../salesPipelineService'

describe('SalesPipelineService', () => {
  it('should be a singleton', () => {
    const instance1 = salesPipelineService
    const instance2 = salesPipelineService
    expect(instance1).toBe(instance2)
  })

  it('should have getStages method', () => {
    expect(typeof salesPipelineService.getStages).toBe('function')
  })

  it('should have createStage method', () => {
    expect(typeof salesPipelineService.createStage).toBe('function')
  })

  it('should have getLeadsInPipeline method', () => {
    expect(typeof salesPipelineService.getLeadsInPipeline).toBe('function')
  })

  it('should have moveLead method', () => {
    expect(typeof salesPipelineService.moveLead).toBe('function')
  })

  it('should have getPipelineStats method', () => {
    expect(typeof salesPipelineService.getPipelineStats).toBe('function')
  })

  it('should have convertLeadToClaim method', () => {
    expect(typeof salesPipelineService.convertLeadToClaim).toBe('function')
  })
})
