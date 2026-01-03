/**
 * Tests for useReportGeneration hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useReportGeneration } from './useReportGeneration'
import type { SimulationContextState } from '../contexts/SimulationContext'

// Mock the simulation context
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: vi.fn(() => ({
    simulationData: {
      results: [
        {
          startkapital: 0,
          zinsen: 50,
          endkapital: 1050,
          bezahlteSteuer: 10,
          genutzterFreibetrag: 5,
          vorabpauschale: 5,
          vorabpauschaleAccumulated: 5,
        },
      ],
    },
    withdrawalResults: null,
    rendite: 5,
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2024: 2000 },
    startEnd: [2024, 2040],
    simulationAnnual: 'yearly',
    sparplan: [],
  } as unknown as SimulationContextState)),
}))

// Mock the report generation service
vi.mock('../services/report-generation', () => ({
  generateAndDownloadReport: vi.fn(async () => ({
    success: true,
    generatedAt: new Date().toISOString(),
    format: 'markdown',
    filename: 'test-report.md',
  })),
}))

// Mock the storage utilities
vi.mock('../utils/report-config-storage', () => ({
  loadReportConfig: vi.fn(() => ({
    enabled: false,
    frequency: 'quarterly',
    format: 'markdown',
    content: {
      portfolioSummary: true,
      performanceMetrics: true,
      taxOverview: true,
      savingsBreakdown: true,
      withdrawalProjections: false,
      riskAnalysis: true,
    },
  })),
  saveReportConfig: vi.fn(() => true),
  updateLastGenerated: vi.fn(config => ({
    ...config,
    lastGenerated: new Date().toISOString(),
  })),
}))

describe('useReportGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with loaded configuration', () => {
    const { result } = renderHook(() => useReportGeneration())

    expect(result.current.config).toBeDefined()
    expect(result.current.config.format).toBe('markdown')
    expect(result.current.config.frequency).toBe('quarterly')
    expect(result.current.isGenerating).toBe(false)
    expect(result.current.lastResult).toBeNull()
  })

  it('should update configuration and persist to storage', () => {
    const { result } = renderHook(() => useReportGeneration())

    act(() => {
      result.current.updateConfig({ format: 'pdf' })
    })

    expect(result.current.config.format).toBe('pdf')
  })

  it('should reset configuration to defaults', () => {
    const { result } = renderHook(() => useReportGeneration())

    act(() => {
      result.current.updateConfig({ format: 'excel' })
    })

    expect(result.current.config.format).toBe('excel')

    act(() => {
      result.current.resetConfig()
    })

    expect(result.current.config.format).toBe('pdf') // DEFAULT_REPORT_CONFIG format
  })

  it('should generate report successfully', async () => {
    const { result } = renderHook(() => useReportGeneration())

    expect(result.current.isGenerating).toBe(false)

    act(() => {
      result.current.generateReport()
    })

    expect(result.current.isGenerating).toBe(true)

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false)
    })

    expect(result.current.lastResult).not.toBeNull()
    expect(result.current.lastResult?.success).toBe(true)
  })

  it('should handle report generation errors', async () => {
    const { result } = renderHook(() => useReportGeneration())
    const { generateAndDownloadReport } = await import('../services/report-generation')

    vi.mocked(generateAndDownloadReport).mockRejectedValueOnce(new Error('Test error'))

    act(() => {
      result.current.generateReport()
    })

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false)
    })

    expect(result.current.lastResult).not.toBeNull()
    expect(result.current.lastResult?.success).toBe(false)
    expect(result.current.lastResult?.error).toBe('Test error')
  })

  it('should not generate report if already generating', async () => {
    const { result } = renderHook(() => useReportGeneration())

    act(() => {
      result.current.generateReport()
      result.current.generateReport() // Second call should be ignored
    })

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false)
    })
  })

  it('should update lastGenerated timestamp on successful generation', async () => {
    const { result } = renderHook(() => useReportGeneration())

    act(() => {
      result.current.generateReport()
    })

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false)
      expect(result.current.lastResult?.success).toBe(true)
    })
  })

  it('should include withdrawal data if available', async () => {
    const { useSimulation } = await import('../contexts/useSimulation')
    vi.mocked(useSimulation).mockReturnValueOnce({
      simulationData: { sparplanElements: [] },
      withdrawalResults: {
        2024: {
          startkapital: 100000,
          entnahme: 4000,
          endkapital: 101000,
          bezahlteSteuer: 500,
          genutzterFreibetrag: 0,
          zinsen: 5000,
        },
      },
    } as unknown as ReturnType<typeof useSimulation>)

    const { result } = renderHook(() => useReportGeneration())

    act(() => {
      result.current.generateReport()
    })

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false)
    })

    expect(result.current.lastResult?.success).toBe(true)
  })
})
