/**
 * Tests for report configuration storage utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveReportConfig,
  loadReportConfig,
  clearReportConfig,
  shouldGenerateReport,
  updateLastGenerated,
} from './report-config-storage'
import { DEFAULT_REPORT_CONFIG, type ReportConfiguration } from '../types/automated-report'

describe('report-config-storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('saveReportConfig', () => {
    it('should save report configuration to localStorage', () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'monthly',
      }

      const result = saveReportConfig(config)

      expect(result).toBe(true)
      const saved = localStorage.getItem('zinszins-report-config')
      expect(saved).toBeTruthy()
      expect(JSON.parse(saved!)).toEqual(config)
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const config: ReportConfiguration = DEFAULT_REPORT_CONFIG
      const result = saveReportConfig(config)

      expect(result).toBe(false)
      setItemSpy.mockRestore()
    })
  })

  describe('loadReportConfig', () => {
    it('should load saved configuration from localStorage', () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'yearly',
        format: 'markdown',
      }
      localStorage.setItem('zinszins-report-config', JSON.stringify(config))

      const loaded = loadReportConfig()

      expect(loaded).toEqual(config)
    })

    it('should return default configuration when nothing is saved', () => {
      const loaded = loadReportConfig()

      expect(loaded).toEqual(DEFAULT_REPORT_CONFIG)
    })

    it('should merge with defaults for partial configurations', () => {
      const partialConfig = {
        enabled: true,
        frequency: 'monthly' as const,
      }
      localStorage.setItem('zinszins-report-config', JSON.stringify(partialConfig))

      const loaded = loadReportConfig()

      expect(loaded.enabled).toBe(true)
      expect(loaded.frequency).toBe('monthly')
      expect(loaded.format).toBe(DEFAULT_REPORT_CONFIG.format)
      expect(loaded.content).toEqual(DEFAULT_REPORT_CONFIG.content)
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('zinszins-report-config', 'invalid json')

      const loaded = loadReportConfig()

      expect(loaded).toEqual(DEFAULT_REPORT_CONFIG)
    })
  })

  describe('clearReportConfig', () => {
    it('should remove report configuration from localStorage', () => {
      localStorage.setItem('zinszins-report-config', JSON.stringify(DEFAULT_REPORT_CONFIG))

      const result = clearReportConfig()

      expect(result).toBe(true)
      expect(localStorage.getItem('zinszins-report-config')).toBeNull()
    })

    it('should handle localStorage errors gracefully', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = clearReportConfig()

      expect(result).toBe(false)
      removeItemSpy.mockRestore()
    })
  })

  describe('shouldGenerateReport', () => {
    it('should return false when reporting is disabled', () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: false,
      }

      expect(shouldGenerateReport(config)).toBe(false)
    })

    it('should return false when frequency is never', () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'never',
      }

      expect(shouldGenerateReport(config)).toBe(false)
    })

    it('should return true when no report has been generated yet', () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'monthly',
        lastGenerated: undefined,
      }

      expect(shouldGenerateReport(config)).toBe(true)
    })

    it('should return true for monthly frequency after 30 days', () => {
      const thirtyOneDaysAgo = new Date()
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31)

      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'monthly',
        lastGenerated: thirtyOneDaysAgo.toISOString(),
      }

      expect(shouldGenerateReport(config)).toBe(true)
    })

    it('should return false for monthly frequency before 30 days', () => {
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'monthly',
        lastGenerated: tenDaysAgo.toISOString(),
      }

      expect(shouldGenerateReport(config)).toBe(false)
    })

    it('should return true for quarterly frequency after 90 days', () => {
      const ninetyOneDaysAgo = new Date()
      ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91)

      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'quarterly',
        lastGenerated: ninetyOneDaysAgo.toISOString(),
      }

      expect(shouldGenerateReport(config)).toBe(true)
    })

    it('should return true for yearly frequency after 365 days', () => {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      oneYearAgo.setDate(oneYearAgo.getDate() - 1) // Add extra day to ensure it's past 365

      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'yearly',
        lastGenerated: oneYearAgo.toISOString(),
      }

      expect(shouldGenerateReport(config)).toBe(true)
    })

    it('should handle invalid date strings gracefully', () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'monthly',
        lastGenerated: 'invalid-date',
      }

      expect(shouldGenerateReport(config)).toBe(false)
    })
  })

  describe('updateLastGenerated', () => {
    it('should update lastGenerated timestamp', () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
      }

      const before = new Date()
      const updated = updateLastGenerated(config)
      const after = new Date()

      expect(updated.lastGenerated).toBeTruthy()
      const generatedDate = new Date(updated.lastGenerated!)
      expect(generatedDate.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(generatedDate.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should not modify other configuration fields', () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        enabled: true,
        frequency: 'monthly',
        format: 'excel',
      }

      const updated = updateLastGenerated(config)

      expect(updated.enabled).toBe(config.enabled)
      expect(updated.frequency).toBe(config.frequency)
      expect(updated.format).toBe(config.format)
      expect(updated.content).toEqual(config.content)
    })
  })
})
