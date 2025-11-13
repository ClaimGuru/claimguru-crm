import { describe, it, expect, vi } from 'vitest'
import { realTimeAnalyticsService } from '../analytics/realTimeAnalyticsService'

describe('RealTimeAnalyticsService', () => {
  it('should be a singleton', () => {
    const instance1 = realTimeAnalyticsService
    const instance2 = realTimeAnalyticsService
    expect(instance1).toBe(instance2)
  })

  it('should have getDashboardStats method', () => {
    expect(typeof realTimeAnalyticsService.getDashboardStats).toBe('function')
  })

  it('should have getAnalyticsMetrics method', () => {
    expect(typeof realTimeAnalyticsService.getAnalyticsMetrics).toBe('function')
  })

  it('should have subscribeToAnalytics method', () => {
    expect(typeof realTimeAnalyticsService.subscribeToAnalytics).toBe('function')
  })

  it('should have subscribeToDashboard method', () => {
    expect(typeof realTimeAnalyticsService.subscribeToDashboard).toBe('function')
  })
})
