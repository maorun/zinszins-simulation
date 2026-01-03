/**
 * Custom hook for managing automated report generation
 */

import { useState, useCallback } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import { DEFAULT_REPORT_CONFIG, type ReportConfiguration, type ReportGenerationResult } from '../types/automated-report'
import {
  loadReportConfig,
  saveReportConfig,
  updateLastGenerated,
} from '../utils/report-config-storage'
import {
  generateAndDownloadReport,
  type ReportData,
} from '../services/report-generation'

export interface UseReportGenerationResult {
  /** Whether a report is currently being generated */
  isGenerating: boolean
  /** Result of the last report generation attempt */
  lastResult: ReportGenerationResult | null
  /** Current report configuration */
  config: ReportConfiguration
  /** Generate and download a report with current settings */
  generateReport: () => Promise<void>
  /** Update report configuration */
  updateConfig: (newConfig: Partial<ReportConfiguration>) => void
  /** Reset configuration to defaults */
  resetConfig: () => void
}

/**
 * Hook for managing report generation
 *
 * Provides functionality to generate portfolio reports with configurable content and format.
 * Integrates with the simulation context to access current portfolio data.
 *
 * Note: This hook has justified complexity due to comprehensive report generation logic.
 */
// eslint-disable-next-line max-lines-per-function
export function useReportGeneration(): UseReportGenerationResult {
  const simulation = useSimulation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastResult, setLastResult] = useState<ReportGenerationResult | null>(null)
  const [config, setConfig] = useState<ReportConfiguration>(() => loadReportConfig())

  /**
   * Update report configuration and persist to storage
   */
  const updateConfig = useCallback((newConfig: Partial<ReportConfiguration>) => {
    setConfig(prevConfig => {
      const updated = { ...prevConfig, ...newConfig }
      saveReportConfig(updated)
      return updated
    })
  }, [])

  /**
   * Reset configuration to defaults
   */
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_REPORT_CONFIG)
    saveReportConfig(DEFAULT_REPORT_CONFIG)
  }, [])

  /**
   * Generate and download a report with current simulation data
   */
  const generateReport = useCallback(async () => {
    if (isGenerating) {
      return
    }

    setIsGenerating(true)
    setLastResult(null)

    try {
      // Extract simulation results - sparplanElements contain the simulation data
      const sparplanElements = simulation.simulationData?.sparplanElements || []

      // Extract simulation result elements from sparplan elements
      const simulationResults = sparplanElements
        .map(element => {
          if ('simulation' in element && element.simulation) {
            // Extract year results from simulation object
            return Object.values(element.simulation)
          }
          return []
        })
        .flat()

      // Prepare report data
      const reportData: ReportData = {
        context: simulation,
        simulationResults,
        withdrawalData: simulation.withdrawalResults || undefined,
      }

      // Generate and download the report
      const result = await generateAndDownloadReport(reportData, config)

      setLastResult(result)

      // Update last generated timestamp if successful
      if (result.success) {
        const updatedConfig = updateLastGenerated(config)
        setConfig(updatedConfig)
        saveReportConfig(updatedConfig)
      }
    } catch (error) {
      setLastResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        generatedAt: new Date().toISOString(),
        format: config.format,
      })
    } finally {
      setIsGenerating(false)
    }
  }, [isGenerating, simulation, config])

  return {
    isGenerating,
    lastResult,
    config,
    generateReport,
    updateConfig,
    resetConfig,
  }
}
