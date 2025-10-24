import { useCallback, useState } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import type { SimulationContextState } from '../contexts/SimulationContext'
import { calculateWithdrawal, type WithdrawalStrategy } from '../../helpers/withdrawal'
import {
  exportSavingsDataToCSV,
  exportWithdrawalDataToCSV,
  exportDataToMarkdown,
  generateCalculationExplanations,
  downloadTextAsFile,
  copyTextToClipboard,
  type ExportData,
  type SavingsData,
} from '../utils/data-export'

export interface DataExportState {
  isExporting: boolean
  lastExportResult: 'success' | 'error' | null
  exportType: 'csv' | 'markdown' | 'clipboard' | null
}

/**
 * Helper to generate withdrawal data from config
 */
function generateWithdrawalFromConfig(
  elements: SavingsData['sparplanElements'],
  context: SimulationContextState,
  strategy: WithdrawalStrategy,
  returnRate: number,
  endYear: number,
  frequency: 'yearly' | 'monthly',
) {
  const { result } = calculateWithdrawal({
    elements,
    startYear: context.startEnd[0],
    endYear,
    strategy,
    returnConfig: { mode: 'fixed', fixedRate: returnRate },
    taxRate: context.steuerlast / 100,
    teilfreistellungsquote: context.teilfreistellungsquote / 100,
    freibetragPerYear: context.freibetragPerYear,
    withdrawalFrequency: frequency,
  })
  return result
}

/**
 * Helper to check if we can generate withdrawal data from config
 */
function canGenerateWithdrawalData(
  savingsData: SavingsData | undefined,
  context: SimulationContextState,
): boolean {
  return !!(savingsData?.sparplanElements && context.withdrawalConfig?.formValue)
}

/**
 * Helper function to get or generate withdrawal data for export
 */
function getWithdrawalDataForExport(savingsData: SavingsData | undefined, context: SimulationContextState) {
  // Return existing results if available
  if (context.withdrawalResults) {
    return context.withdrawalResults
  }

  const hasSavings = savingsData?.sparplanElements

  // Generate withdrawal data from explicit config
  if (canGenerateWithdrawalData(savingsData, context)) {
    return generateWithdrawalFromConfig(
      savingsData!.sparplanElements,
      context,
      context.withdrawalConfig!.formValue.strategie,
      context.withdrawalConfig!.formValue.rendite / 100,
      context.endOfLife,
      context.withdrawalConfig!.formValue.withdrawalFrequency,
    )
  }

  // Generate default withdrawal data if we have savings and basic config
  if (hasSavings && context.withdrawalConfig) {
    return generateWithdrawalFromConfig(
      savingsData!.sparplanElements,
      context,
      '4prozent',
      0.05,
      context.startEnd[1],
      'yearly',
    )
  }

  return undefined
}

/**
 * Helper function to validate export data availability
 */
function validateExportData(
  savingsData: SavingsData | undefined,
  withdrawalData: ExportData['withdrawalData'] | undefined,
  context: SimulationContextState,
) {
  if (!savingsData?.sparplanElements && !withdrawalData && !context.withdrawalConfig?.formValue) {
    throw new Error('Keine Simulationsdaten verfügbar')
  }
}

/**
 * Helper to check if separator should be added between phases
 */
function shouldAddPhaseSeparator(hasSavings: boolean, hasWithdrawal: boolean): boolean {
  return hasSavings && hasWithdrawal
}

/**
 * Helper function to build combined CSV content
 */
function buildCombinedCSVContent(
  savingsData: SavingsData | undefined,
  withdrawalData: ExportData['withdrawalData'] | undefined,
  context: SimulationContextState,
): string {
  const parts: string[] = []
  const hasSavings = Boolean(savingsData?.sparplanElements)
  const hasWithdrawal = Boolean(withdrawalData || context.withdrawalConfig?.formValue)

  // Export savings phase if available
  if (hasSavings) {
    const exportData: ExportData = { savingsData, context }
    parts.push(exportSavingsDataToCSV(exportData))
  }

  // Add separator between phases
  if (shouldAddPhaseSeparator(hasSavings, hasWithdrawal)) {
    parts.push('\n\n# ========================================\n')
  }

  // Export withdrawal phase if available
  if (withdrawalData) {
    const exportData: ExportData = { withdrawalData, context }
    parts.push(exportWithdrawalDataToCSV(exportData))
  }

  return parts.join('\n')
}

/**
 * Helper to check data availability
 */
function checkDataAvailability(context: SimulationContextState) {
  return {
    hasSavingsData: (context.simulationData?.sparplanElements?.length ?? 0) > 0,
    hasWithdrawalData: context.withdrawalResults && Object.keys(context.withdrawalResults).length > 0,
    hasWithdrawalConfig: Boolean(context.withdrawalConfig?.formValue),
  }
}

/**
 * Helper function to prepare data for markdown export
 */
function prepareMarkdownExportData(context: SimulationContextState) {
  const { hasSavingsData, hasWithdrawalData: initialWithdrawalData, hasWithdrawalConfig }
    = checkDataAvailability(context)

  let withdrawalData = context.withdrawalResults
  let hasWithdrawalData = initialWithdrawalData

  // Generate withdrawal data if needed and possible
  if (!hasWithdrawalData && hasWithdrawalConfig && context.simulationData?.sparplanElements) {
    withdrawalData = generateWithdrawalFromConfig(
      context.simulationData.sparplanElements,
      context,
      context.withdrawalConfig!.formValue.strategie,
      context.withdrawalConfig!.formValue.rendite / 100,
      context.endOfLife,
      context.withdrawalConfig!.formValue.withdrawalFrequency,
    )
    hasWithdrawalData = true
  }

  // Validate we have some data to export
  if (!hasSavingsData && !hasWithdrawalData && !hasWithdrawalConfig) {
    throw new Error('Keine Simulationsdaten verfügbar. Bitte führen Sie zuerst eine Simulation durch.')
  }

  return { withdrawalData, hasSavingsData, hasWithdrawalData }
}

/**
 * Custom hook for exporting simulation data in various formats
 */
// eslint-disable-next-line max-lines-per-function -- Large component function
export function useDataExport() {
  const context = useSimulation()
  const [state, setState] = useState<DataExportState>({
    isExporting: false,
    lastExportResult: null,
    exportType: null,
  })

  const clearResultAfterDelay = useCallback(() => {
    setTimeout(() => {
      setState(prev => ({ ...prev, lastExportResult: null, exportType: null }))
    }, 3000)
  }, [])

  const setExportingState = useCallback((exportType: 'csv' | 'markdown' | 'clipboard') => {
    setState(prev => ({
      ...prev,
      isExporting: true,
      lastExportResult: null,
      exportType,
    }))
  }, [])

  const setResultState = useCallback((success: boolean, exportType: 'csv' | 'markdown' | 'clipboard') => {
    setState({
      isExporting: false,
      lastExportResult: success ? 'success' : 'error',
      exportType,
    })
    clearResultAfterDelay()
  }, [clearResultAfterDelay])

  const exportSavingsDataCSV = useCallback(async () => {
    setExportingState('csv')

    try {
      // Ensure we have savings data available
      if (!context.simulationData?.sparplanElements) {
        throw new Error('Keine Sparplan-Daten verfügbar. Bitte führen Sie zuerst eine Simulation durch.')
      }

      const exportData: ExportData = {
        savingsData: context.simulationData,
        context,
      }

      const csvContent = exportSavingsDataToCSV(exportData)

      // Calculate correct savings phase period for filename
      const currentYear = new Date().getFullYear()
      const savingsStartYear = Math.min(currentYear,
        ...context.sparplanElemente.map(plan => new Date(plan.start).getFullYear()),
      )
      const savingsEndYear = context.startEnd[0] // End of savings phase = start of withdrawal
      const filename = `sparphase_${savingsStartYear}-${savingsEndYear}_${new Date().toISOString().slice(0, 10)}.csv`

      downloadTextAsFile(csvContent, filename, 'text/csv;charset=utf-8')
      setResultState(true, 'csv')
      return true
    }
    catch (error) {
      console.error('Failed to export savings data as CSV:', error)
      setResultState(false, 'csv')
      return false
    }
  }, [context, setExportingState, setResultState])

  // Helper to generate withdrawal data from configuration
  const generateFromConfig = useCallback((ctx: typeof context) => {
    if (!ctx.withdrawalConfig?.formValue || !ctx.simulationData?.sparplanElements) {
      return null
    }

    return generateWithdrawalFromConfig(
      ctx.simulationData.sparplanElements,
      ctx,
      ctx.withdrawalConfig.formValue.strategie,
      ctx.withdrawalConfig.formValue.rendite / 100,
      ctx.endOfLife,
      ctx.withdrawalConfig.formValue.withdrawalFrequency,
    )
  }, [])

  // Helper to generate withdrawal data with default strategy
  const generateWithDefaultStrategy = useCallback((ctx: typeof context) => {
    if (!ctx.simulationData?.sparplanElements || !ctx.withdrawalConfig) {
      return null
    }

    return generateWithdrawalFromConfig(
      ctx.simulationData.sparplanElements,
      ctx,
      '4prozent',
      0.05,
      ctx.startEnd[1],
      'yearly',
    )
  }, [])

  // Helper to get or generate withdrawal data for export
  const getWithdrawalData = useCallback((ctx: typeof context) => {
    // Return existing withdrawal results if available
    if (ctx.withdrawalResults) {
      return ctx.withdrawalResults
    }

    // Try to generate from config
    const dataFromConfig = generateFromConfig(ctx)
    if (dataFromConfig) {
      return dataFromConfig
    }

    // Fallback to default strategy
    return generateWithDefaultStrategy(ctx)
  }, [generateFromConfig, generateWithDefaultStrategy])

  const exportWithdrawalDataCSV = useCallback(async () => {
    setExportingState('csv')

    try {
      const withdrawalData = getWithdrawalData(context)

      if (!withdrawalData) {
        throw new Error('Keine Entnahme-Daten verfügbar. Bitte konfigurieren Sie eine Entnahmestrategie.')
      }

      const exportData: ExportData = {
        withdrawalData,
        context,
      }

      const csvContent = exportWithdrawalDataToCSV(exportData)
      const startYear = context.startEnd[0]
      const endYear = context.endOfLife
      const filename = `entnahmephase_${startYear}-${endYear}_${new Date().toISOString().slice(0, 10)}.csv`

      downloadTextAsFile(csvContent, filename, 'text/csv;charset=utf-8')
      setResultState(true, 'csv')
      return true
    }
    catch (error) {
      console.error('Failed to export withdrawal data as CSV:', error)
      setResultState(false, 'csv')
      return false
    }
  }, [context, setExportingState, setResultState, getWithdrawalData])

  const exportAllDataCSV = useCallback(async () => {
    setExportingState('csv')

    try {
      const savingsData = context.simulationData ?? undefined
      const withdrawalData = getWithdrawalDataForExport(savingsData, context)

      validateExportData(savingsData, withdrawalData, context)

      const csvContent = buildCombinedCSVContent(savingsData, withdrawalData, context)
      const filename = `simulation_komplett_${context.startEnd[0]}-${context.endOfLife}_${new Date().toISOString().slice(0, 10)}.csv`

      downloadTextAsFile(csvContent, filename, 'text/csv;charset=utf-8')
      setResultState(true, 'csv')
      return true
    }
    catch (error) {
      console.error('Failed to export all data as CSV:', error)
      setResultState(false, 'csv')
      return false
    }
  }, [context, setExportingState, setResultState])

  const exportDataMarkdown = useCallback(async () => {
    setExportingState('markdown')

    try {
      const { withdrawalData, hasSavingsData, hasWithdrawalData } = prepareMarkdownExportData(context)

      const exportData: ExportData = {
        savingsData: hasSavingsData && context.simulationData ? context.simulationData : undefined,
        withdrawalData: hasWithdrawalData ? withdrawalData || undefined : undefined,
        context,
      }

      const markdownContent = exportDataToMarkdown(exportData)
      const filename = `simulation_${context.startEnd[0]}-${context.endOfLife}_${new Date().toISOString().slice(0, 10)}.md`

      downloadTextAsFile(markdownContent, filename, 'text/markdown;charset=utf-8')
      setResultState(true, 'markdown')
      return true
    }
    catch (error) {
      console.error('Failed to export data as Markdown:', error)
      setResultState(false, 'markdown')
      return false
    }
  }, [context, setExportingState, setResultState])

  const copyCalculationExplanations = useCallback(async () => {
    setExportingState('clipboard')

    try {
      const explanations = generateCalculationExplanations(context)
      const success = await copyTextToClipboard(explanations)
      setResultState(success, 'clipboard')
      return success
    }
    catch (error) {
      console.error('Failed to copy calculation explanations:', error)
      setResultState(false, 'clipboard')
      return false
    }
  }, [context, setExportingState, setResultState])

  return {
    exportSavingsDataCSV,
    exportWithdrawalDataCSV,
    exportAllDataCSV,
    exportDataMarkdown,
    copyCalculationExplanations,
    ...state,
  }
}
