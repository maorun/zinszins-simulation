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
import type { SimulationResultElement } from '../utils/simulate'

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
 * Extracts simulation results from sparplan elements
 */
function extractSimulationResults(sparplanElements: unknown[]): SimulationResultElement[] {
  return sparplanElements
    .map(element => {
      if (element && typeof element === 'object' && 'simulation' in element && element.simulation) {
        // Extract year results from simulation object
        return Object.values(element.simulation as Record<string, SimulationResultElement>)
      }
      return []
    })
    .flat()
}

/**
 * Prepares report data from simulation context
 */
function prepareReportData(simulation: ReturnType<typeof useSimulation>): ReportData {
  const sparplanElements = simulation.simulationData?.sparplanElements || []
  const simulationResults = extractSimulationResults(sparplanElements)

  return {
    context: simulation,
    simulationResults,
    withdrawalData: simulation.withdrawalResults || undefined,
  }
}

/**
 * Handles successful report generation
 */
function handleReportSuccess(
  result: ReportGenerationResult,
  config: ReportConfiguration,
  setConfig: (config: ReportConfiguration) => void
): void {
  if (result.success) {
    const updatedConfig = updateLastGenerated(config)
    setConfig(updatedConfig)
    saveReportConfig(updatedConfig)
  }
}

/**
 * Creates error result for report generation
 */
function createErrorResult(error: unknown, config: ReportConfiguration): ReportGenerationResult {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    generatedAt: new Date().toISOString(),
    format: config.format,
  }
}

/**
 * Hook for managing report generation
 *
 * Provides functionality to generate portfolio reports with configurable content and format.
 * Integrates with the simulation context to access current portfolio data.
 */
export function useReportGeneration(): UseReportGenerationResult {
  const simulation = useSimulation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastResult, setLastResult] = useState<ReportGenerationResult | null>(null)
  const [config, setConfig] = useState<ReportConfiguration>(() => loadReportConfig())

  const updateConfig = useCallback((newConfig: Partial<ReportConfiguration>) => {
    setConfig(prevConfig => {
      const updated = { ...prevConfig, ...newConfig }
      saveReportConfig(updated)
      return updated
    })
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_REPORT_CONFIG)
    saveReportConfig(DEFAULT_REPORT_CONFIG)
  }, [])

  const generateReport = useCallback(async () => {
    if (isGenerating) return

    setIsGenerating(true)
    setLastResult(null)

    try {
      const reportData = prepareReportData(simulation)
      const result = await generateAndDownloadReport(reportData, config)

      setLastResult(result)
      handleReportSuccess(result, config, setConfig)
    } catch (error) {
      setLastResult(createErrorResult(error, config))
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
