import { describe, it, expect, beforeEach, vi } from 'vitest'
import { geminiService } from '../geminiService'

describe('GeminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be a singleton', () => {
    const instance1 = geminiService
    const instance2 = geminiService
    expect(instance1).toBe(instance2)
  })

  it('should initialize without errors', () => {
    expect(() => geminiService.initialize()).not.toThrow()
  })

  describe('Document Analysis', () => {
    it('should have analyzeDocument method', () => {
      expect(typeof geminiService.analyzeDocument).toBe('function')
    })

    it('should have extractPolicyInfo method', () => {
      expect(typeof geminiService.extractPolicyInfo).toBe('function')
    })

    it('should have analyzeClaim method', () => {
      expect(typeof geminiService.analyzeClaim).toBe('function')
    })
  })

  describe('Document Processing', () => {
    it('should have extractDocumentData method', () => {
      expect(typeof geminiService.extractDocumentData).toBe('function')
    })

    it('should have summarizeDocument method', () => {
      expect(typeof geminiService.summarizeDocument).toBe('function')
    })
  })
})
