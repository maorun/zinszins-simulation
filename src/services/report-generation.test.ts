/**
 * Tests for report generation service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculatePortfolioSummary,
  calculatePerformanceMetrics,
  calculateTaxOverview,
  generateReportMarkdown,
  generateAndDownloadReport,
  type ReportData,
} from './report-generation'
import type { SimulationResultElement } from '../utils/simulate'
import type { SimulationContextState } from '../contexts/SimulationContext'
import { DEFAULT_REPORT_CONFIG, type ReportConfiguration } from '../types/automated-report'

// Mock the utility functions
vi.mock('../utils/data-export', () => ({
  downloadTextAsFile: vi.fn(),
}))

vi.mock('../utils/excel-export', () => ({
  exportSavingsDataToExcel: vi.fn(),
}))

vi.mock('../utils/pdf-export', () => ({
  exportSavingsDataToPDF: vi.fn(() => new Blob(['pdf'], { type: 'application/pdf' })),
  exportWithdrawalDataToPDF: vi.fn(() => new Blob(['pdf'], { type: 'application/pdf' })),
  exportAllDataToPDF: vi.fn(() => new Blob(['pdf'], { type: 'application/pdf' })),
  downloadPDFBlob: vi.fn(),
}))

describe('report-generation', () => {
  const mockSimulationResults: SimulationResultElement[] = [
    {
      startkapital: 0,
      zinsen: 0,
      endkapital: 1000,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
    },
    {
      startkapital: 1000,
      zinsen: 50,
      endkapital: 2050,
      bezahlteSteuer: 15,
      genutzterFreibetrag: 5,
      vorabpauschale: 10,
      vorabpauschaleAccumulated: 10,
    },
    {
      startkapital: 2050,
      zinsen: 100,
      endkapital: 3150,
      bezahlteSteuer: 25,
      genutzterFreibetrag: 10,
      vorabpauschale: 20,
      vorabpauschaleAccumulated: 30,
    },
  ]

  const mockContext: Partial<SimulationContextState> = {
    rendite: 5,
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2023: 2000, 2024: 2000, 2025: 2000 },
    startEnd: [2023, 2040],
    simulationAnnual: 'yearly',
    sparplan: [
      {
        id: 1,
        einzahlung: 1000,
        start: '2023-01-01',
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculatePortfolioSummary', () => {
    it('should calculate portfolio summary correctly', () => {
      const summary = calculatePortfolioSummary(mockSimulationResults, 3000)

      expect(summary.totalValue).toBe(3150)
      expect(summary.totalContributions).toBe(3000)
      expect(summary.totalReturns).toBe(150)
      expect(summary.returnPercentage).toBeCloseTo(5, 1)
      expect(summary.taxesPaid).toBe(40) // 15 + 25
    })

    it('should handle empty elements array', () => {
      const summary = calculatePortfolioSummary([], 0)

      expect(summary.totalValue).toBe(0)
      expect(summary.totalContributions).toBe(0)
      expect(summary.totalReturns).toBe(0)
      expect(summary.returnPercentage).toBe(0)
      expect(summary.taxesPaid).toBe(0)
    })

    it('should handle zero contributions', () => {
      const elements: SimulationResultElement[] = [
        {
          startkapital: 0,
          zinsen: 0,
          endkapital: 0,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      ]

      const summary = calculatePortfolioSummary(elements, 0)

      expect(summary.returnPercentage).toBe(0)
    })
  })

  describe('calculatePerformanceMetrics', () => {
    it('should calculate performance metrics correctly', () => {
      const metrics = calculatePerformanceMetrics(mockSimulationResults)

      expect(metrics).not.toBeNull()
      expect(metrics!.averageAnnualReturn).toBeGreaterThan(0)
      expect(metrics!.bestYear).toBeDefined()
      expect(metrics!.worstYear).toBeDefined()
      expect(metrics!.volatility).toBeGreaterThan(0)
      expect(metrics!.sharpeRatio).toBeDefined()
    })

    it('should return null for insufficient data', () => {
      const metrics = calculatePerformanceMetrics([mockSimulationResults[0]])

      expect(metrics).toBeNull()
    })

    it('should return null for empty array', () => {
      const metrics = calculatePerformanceMetrics([])

      expect(metrics).toBeNull()
    })

    it('should handle zero starting capital', () => {
      const elements: SimulationResultElement[] = [
        {
          startkapital: 0,
          zinsen: 0,
          endkapital: 0,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
        {
          startkapital: 0,
          zinsen: 50,
          endkapital: 1050,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      ]

      const metrics = calculatePerformanceMetrics(elements)

      // Should skip years with zero starting capital
      expect(metrics).toBeNull()
    })
  })

  describe('calculateTaxOverview', () => {
    it('should calculate tax overview correctly', () => {
      const taxOverview = calculateTaxOverview(mockSimulationResults, mockContext as unknown as SimulationContextState)

      expect(taxOverview.totalTaxes).toBe(40) // 15 + 25
      expect(taxOverview.vorabpauschale).toBe(30) // 10 + 20
      expect(taxOverview.freibetragUsed).toBe(10)
      expect(taxOverview.freibetragRemaining).toBe(1990) // 2000 - 10
    })

    it('should handle empty elements array', () => {
      const taxOverview = calculateTaxOverview([], mockContext as unknown as SimulationContextState)

      expect(taxOverview.totalTaxes).toBe(0)
      expect(taxOverview.vorabpauschale).toBe(0)
      expect(taxOverview.capitalGainsTax).toBe(0)
      expect(taxOverview.freibetragUsed).toBe(0)
      expect(taxOverview.freibetragRemaining).toBe(0)
    })

    it('should use default Freibetrag when not configured', () => {
      const contextWithoutFreibetrag = {
        ...mockContext,
        freibetragPerYear: {},
      }

      const taxOverview = calculateTaxOverview(mockSimulationResults, contextWithoutFreibetrag as unknown as SimulationContextState)

      expect(taxOverview.freibetragRemaining).toBe(1990) // 2000 - 10 (default)
    })
  })

  describe('generateReportMarkdown', () => {
    const reportData: ReportData = {
      context: mockContext as unknown as SimulationContextState,
      simulationResults: mockSimulationResults,
    }

    it('should generate markdown report with all sections', () => {
      const markdown = generateReportMarkdown(
        reportData,
        {
          portfolioSummary: true,
          performanceMetrics: true,
          taxOverview: true,
          savingsBreakdown: true,
          withdrawalProjections: false,
          riskAnalysis: true,
        },
        'Test Report',
      )

      expect(markdown).toContain('# Test Report')
      expect(markdown).toContain('## 📊 Portfolio-Übersicht')
      expect(markdown).toContain('## 📈 Performance-Kennzahlen')
      expect(markdown).toContain('## 💰 Steuer-Übersicht')
      expect(markdown).toContain('## 🏦 Sparplan-Aufschlüsselung')
      expect(markdown).toContain('## ⚠️ Risiko-Analyse')
    })

    it('should use default title when not provided', () => {
      const markdown = generateReportMarkdown(reportData, DEFAULT_REPORT_CONFIG.content)

      expect(markdown).toContain('# Portfolio-Bericht')
    })

    it('should only include selected sections', () => {
      const markdown = generateReportMarkdown(reportData, {
        portfolioSummary: true,
        performanceMetrics: false,
        taxOverview: false,
        savingsBreakdown: false,
        withdrawalProjections: false,
        riskAnalysis: false,
      })

      expect(markdown).toContain('## 📊 Portfolio-Übersicht')
      expect(markdown).not.toContain('## 📈 Performance-Kennzahlen')
      expect(markdown).not.toContain('## 💰 Steuer-Übersicht')
    })

    it('should include date in report', () => {
      const markdown = generateReportMarkdown(reportData, DEFAULT_REPORT_CONFIG.content)

      expect(markdown).toContain('**Erstellt am:**')
      expect(markdown).toContain('*Stand:')
    })
  })

  describe('generateAndDownloadReport', () => {
    const reportData: ReportData = {
      context: mockContext as unknown as SimulationContextState,
      simulationResults: mockSimulationResults,
    }

    it('should generate markdown report', async () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        format: 'markdown',
      }

      const result = await generateAndDownloadReport(reportData, config)

      expect(result.success).toBe(true)
      expect(result.format).toBe('markdown')
      expect(result.filename).toContain('.md')
    })

    it('should generate PDF report', async () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        format: 'pdf',
      }

      const result = await generateAndDownloadReport(reportData, config)

      expect(result.success).toBe(true)
      expect(result.format).toBe('pdf')
      expect(result.filename).toContain('.pdf')
    })

    it('should generate Excel report', async () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        format: 'excel',
      }

      const result = await generateAndDownloadReport(reportData, config)

      expect(result.success).toBe(true)
      expect(result.format).toBe('excel')
      expect(result.filename).toContain('.xlsx')
    })

    it('should handle errors gracefully', async () => {
      const { downloadTextAsFile } = await import('../utils/data-export')
      vi.mocked(downloadTextAsFile).mockImplementation(() => {
        throw new Error('Test error')
      })

      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        format: 'markdown',
      }

      const result = await generateAndDownloadReport(reportData, config)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Test error')
    })

    it('should include timestamp in result', async () => {
      const config: ReportConfiguration = {
        ...DEFAULT_REPORT_CONFIG,
        format: 'markdown',
      }

      const before = new Date()
      const result = await generateAndDownloadReport(reportData, config)
      const after = new Date()

      expect(result.generatedAt).toBeTruthy()
      const generatedDate = new Date(result.generatedAt)
      expect(generatedDate.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(generatedDate.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })
})
