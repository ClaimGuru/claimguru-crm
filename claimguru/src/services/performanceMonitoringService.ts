/**
 * Performance Monitoring Service
 * Tracks application performance metrics and vitals
 */

import { startTransaction } from '../lib/sentry'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
}

export interface PageLoadMetrics {
  dns: number
  tcp: number
  request: number
  response: number
  dom: number
  load: number
  total: number
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService
  private metrics: PerformanceMetric[] = []
  private observers: Map<string, PerformanceObserver> = new Map()

  private constructor() {
    this.initializeObservers()
  }

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService()
    }
    return PerformanceMonitoringService.instance
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return
    }

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('navigation', entry.duration, 'ms')
        }
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.set('navigation', navObserver)

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming
          if (resource.duration > 1000) {
            // Log slow resources
            console.warn(`⚠️ Slow resource: ${resource.name} (${Math.round(resource.duration)}ms)`)
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', resourceObserver)

      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('long-task', entry.duration, 'ms')
          console.warn(`⚠️ Long task detected: ${Math.round(entry.duration)}ms`)
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.set('longtask', longTaskObserver)

      console.log('✅ Performance monitoring initialized')
    } catch (error) {
      console.error('❌ Failed to initialize performance observers:', error)
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, unit: string = 'ms') {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    }

    this.metrics.push(metric)

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift()
    }
  }

  /**
   * Get page load metrics
   */
  getPageLoadMetrics(): PageLoadMetrics | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null
    }

    const timing = performance.timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (!navigation) {
      return null
    }

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.fetchStart
    }
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): Promise<{
    lcp?: number  // Largest Contentful Paint
    fid?: number  // First Input Delay
    cls?: number  // Cumulative Layout Shift
  }> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.PerformanceObserver) {
        resolve({})
        return
      }

      const vitals: any = {}

      // LCP - Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          vitals.lcp = lastEntry.renderTime || lastEntry.loadTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        setTimeout(() => {
          lcpObserver.disconnect()
          resolve(vitals)
        }, 3000)
      } catch (error) {
        resolve(vitals)
      }
    })
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - start
      
      this.recordMetric(name, duration, 'ms')
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow operation: ${name} (${Math.round(duration)}ms)`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}-error`, duration, 'ms')
      throw error
    }
  }

  /**
   * Measure synchronous function
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    
    try {
      const result = fn()
      const duration = performance.now() - start
      
      this.recordMetric(name, duration, 'ms')
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}-error`, duration, 'ms')
      throw error
    }
  }

  /**
   * Start a performance mark
   */
  mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name)
    }
  }

  /**
   * Measure between two marks
   */
  measureBetween(name: string, startMark: string, endMark: string) {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        performance.measure(name, startMark, endMark)
        const measure = performance.getEntriesByName(name)[0]
        this.recordMetric(name, measure.duration, 'ms')
        return measure.duration
      } catch (error) {
        console.error('❌ Failed to measure:', error)
        return null
      }
    }
    return null
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name)
  }

  /**
   * Get average metric value
   */
  getAverageMetric(name: string): number | null {
    const metrics = this.getMetricsByName(name)
    if (metrics.length === 0) return null

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = []
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const pageLoad = this.getPageLoadMetrics()
    const allMetrics = this.getMetrics()

    // Group metrics by name
    const grouped = allMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = []
      }
      acc[metric.name].push(metric.value)
      return acc
    }, {} as Record<string, number[]>)

    // Calculate averages
    const averages = Object.entries(grouped).map(([name, values]) => ({
      name,
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }))

    return {
      pageLoad,
      metrics: averages,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Log performance report
   */
  logReport() {
    const report = this.getPerformanceReport()
    console.group('📊 Performance Report')
    console.log('Page Load:', report.pageLoad)
    console.table(report.metrics)
    console.groupEnd()
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

export const performanceMonitoringService = PerformanceMonitoringService.getInstance()
export default performanceMonitoringService
