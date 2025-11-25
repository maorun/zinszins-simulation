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
import {
  exportSavingsDataToExcel,
  exportWithdrawalDataToExcel,
  exportCompleteDataToExcel,
} from '../utils/excel-export'
import {
  exportSavingsDataToPDF,
  exportWithdrawalDataToPDF,
  exportAllDataToPDF,
  downloadPDFBlob,
} from '../utils/pdf-export'

export interface DataExportState {
  isExporting: boolean
  lastExportResult: 'success' | 'error' | null
  exportType: 'csv' | 'markdown' | 'clipboard' | 'excel' | 'pdf' | null
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
function canGenerateWithdrawalData(savingsData: SavingsData | undefined, context: SimulationContextState): boolean {
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
 * Helper to calculate savings phase filename
 */
function getSavingsPhaseFilename(context: SimulationContextState): string {
  const currentYear = new Date().getFullYear()
  const savingsStartYear = Math.min(
    currentYear,
    ...context.sparplanElemente.map(plan => new Date(plan.start).getFullYear()),
  )
  const savingsEndYear = context.startEnd[0] // End of savings phase = start of withdrawal
  const dateStr = new Date().toISOString().slice(0, 10)
  return `sparphase_${savingsStartYear}-${savingsEndYear}_${dateStr}.csv`
}

/**
 * Export savings data to CSV
 */
async function performSavingsCSVExport(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'csv')

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
    const filename = getSavingsPhaseFilename(context)

    downloadTextAsFile(csvContent, filename, 'text/csv;charset=utf-8')
    setResultStateHelper(updateState, true, 'csv')
    return true
  } catch (error) {
    console.error('Failed to export savings data as CSV:', error)
    setResultStateHelper(updateState, false, 'csv')
    return false
  }
}

/**
 * Helper to generate withdrawal data from config
 */
function generateWithdrawalDataFromConfig(context: SimulationContextState) {
  if (!context.withdrawalConfig?.formValue || !context.simulationData?.sparplanElements) {
    return null
  }

  return generateWithdrawalFromConfig(
    context.simulationData.sparplanElements,
    context,
    context.withdrawalConfig.formValue.strategie,
    context.withdrawalConfig.formValue.rendite / 100,
    context.endOfLife,
    context.withdrawalConfig.formValue.withdrawalFrequency,
  )
}

/**
 * Helper to generate withdrawal data with default strategy
 */
function generateWithdrawalDataWithDefault(context: SimulationContextState) {
  if (!context.simulationData?.sparplanElements || !context.withdrawalConfig) {
    return null
  }

  return generateWithdrawalFromConfig(
    context.simulationData.sparplanElements,
    context,
    '4prozent',
    0.05,
    context.startEnd[1],
    'yearly',
  )
}

/**
 * Helper to get or generate withdrawal data for export
 */
function getWithdrawalDataHelper(context: SimulationContextState) {
  // Return existing withdrawal results if available
  if (context.withdrawalResults) {
    return context.withdrawalResults
  }

  // Try to generate from config
  const dataFromConfig = generateWithdrawalDataFromConfig(context)
  if (dataFromConfig) {
    return dataFromConfig
  }

  // Fallback to default strategy
  return generateWithdrawalDataWithDefault(context)
}

/**
 * Export withdrawal data to CSV
 */
async function performWithdrawalCSVExport(
  context: SimulationContextState,
  updateState: StateUpdater,
): Promise<boolean> {
  setExportingStateHelper(updateState, 'csv')

  try {
    const withdrawalData = getWithdrawalDataHelper(context)

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
    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `entnahmephase_${startYear}-${endYear}_${dateStr}.csv`

    downloadTextAsFile(csvContent, filename, 'text/csv;charset=utf-8')
    setResultStateHelper(updateState, true, 'csv')
    return true
  } catch (error) {
    console.error('Failed to export withdrawal data as CSV:', error)
    setResultStateHelper(updateState, false, 'csv')
    return false
  }
}

/**
 * Export all data (savings + withdrawal) to CSV
 */
async function performAllDataCSVExport(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'csv')

  try {
    const savingsData = context.simulationData ?? undefined
    const withdrawalData = getWithdrawalDataForExport(savingsData, context)

    validateExportData(savingsData, withdrawalData, context)

    const csvContent = buildCombinedCSVContent(savingsData, withdrawalData, context)
    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `simulation_komplett_${context.startEnd[0]}-${context.endOfLife}_${dateStr}.csv`

    downloadTextAsFile(csvContent, filename, 'text/csv;charset=utf-8')
    setResultStateHelper(updateState, true, 'csv')
    return true
  } catch (error) {
    console.error('Failed to export all data as CSV:', error)
    setResultStateHelper(updateState, false, 'csv')
    return false
  }
}

/**
 * Export data to Markdown format
 */
async function performMarkdownExport(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'markdown')

  try {
    const { withdrawalData, hasSavingsData, hasWithdrawalData } = prepareMarkdownExportData(context)

    const exportData: ExportData = {
      savingsData: hasSavingsData && context.simulationData ? context.simulationData : undefined,
      withdrawalData: hasWithdrawalData ? withdrawalData || undefined : undefined,
      context,
    }

    const markdownContent = exportDataToMarkdown(exportData)
    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `simulation_${context.startEnd[0]}-${context.endOfLife}_${dateStr}.md`

    downloadTextAsFile(markdownContent, filename, 'text/markdown;charset=utf-8')
    setResultStateHelper(updateState, true, 'markdown')
    return true
  } catch (error) {
    console.error('Failed to export data as Markdown:', error)
    setResultStateHelper(updateState, false, 'markdown')
    return false
  }
}

/**
 * Copy calculation explanations to clipboard
 */
async function performClipboardCopy(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'clipboard')

  try {
    const explanations = generateCalculationExplanations(context)
    const success = await copyTextToClipboard(explanations)
    setResultStateHelper(updateState, success, 'clipboard')
    return success
  } catch (error) {
    console.error('Failed to copy calculation explanations:', error)
    setResultStateHelper(updateState, false, 'clipboard')
    return false
  }
}

/**
 * Export savings data as Excel
 */
async function performSavingsExcelExport(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'excel')

  try {
    if (!context.simulationData?.sparplanElements) {
      throw new Error('Keine Sparplan-Daten verfügbar. Bitte führen Sie zuerst eine Simulation durch.')
    }

    exportSavingsDataToExcel(context.simulationData, context)
    setResultStateHelper(updateState, true, 'excel')
    return true
  } catch (error) {
    console.error('Failed to export savings data as Excel:', error)
    setResultStateHelper(updateState, false, 'excel')
    return false
  }
}

/**
 * Export withdrawal data as Excel
 */
async function performWithdrawalExcelExport(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'excel')

  try {
    const withdrawalData = getWithdrawalDataHelper(context)

    if (!withdrawalData) {
      throw new Error('Keine Entnahme-Daten verfügbar.')
    }

    exportWithdrawalDataToExcel(withdrawalData, context)
    setResultStateHelper(updateState, true, 'excel')
    return true
  } catch (error) {
    console.error('Failed to export withdrawal data as Excel:', error)
    setResultStateHelper(updateState, false, 'excel')
    return false
  }
}

/**
 * Export all data (savings + withdrawal) as Excel
 */
async function performAllDataExcelExport(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'excel')

  try {
    if (!context.simulationData?.sparplanElements) {
      throw new Error('Keine Sparplan-Daten verfügbar.')
    }

    const withdrawalData = getWithdrawalDataHelper(context)

    if (!withdrawalData) {
      throw new Error('Keine Entnahme-Daten verfügbar.')
    }

    exportCompleteDataToExcel(context.simulationData, withdrawalData, context)
    setResultStateHelper(updateState, true, 'excel')
    return true
  } catch (error) {
    console.error('Failed to export all data as Excel:', error)
    setResultStateHelper(updateState, false, 'excel')
    return false
  }
}

/**
 * Export savings data as PDF
 */
async function performSavingsPDFExport(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'pdf')

  try {
    if (!context.simulationData?.sparplanElements) {
      throw new Error('Keine Sparplan-Daten verfügbar. Bitte führen Sie zuerst eine Simulation durch.')
    }

    const exportData: ExportData = {
      savingsData: context.simulationData,
      context,
    }

    const pdfBlob = exportSavingsDataToPDF(exportData)
    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `sparphase_${context.startEnd[0]}-${context.startEnd[1]}_${dateStr}.pdf`

    downloadPDFBlob(pdfBlob, filename)
    setResultStateHelper(updateState, true, 'pdf')
    return true
  } catch (error) {
    console.error('Failed to export savings data as PDF:', error)
    setResultStateHelper(updateState, false, 'pdf')
    return false
  }
}

/**
 * Export withdrawal data as PDF
 */
async function performWithdrawalPDFExport(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'pdf')

  try {
    const withdrawalData = getWithdrawalDataHelper(context)

    if (!withdrawalData) {
      throw new Error('Keine Entnahme-Daten verfügbar.')
    }

    const exportData: ExportData = {
      withdrawalData,
      context,
    }

    const pdfBlob = exportWithdrawalDataToPDF(exportData)
    const startYear = context.startEnd[0]
    const endYear = context.endOfLife
    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `entnahmephase_${startYear}-${endYear}_${dateStr}.pdf`

    downloadPDFBlob(pdfBlob, filename)
    setResultStateHelper(updateState, true, 'pdf')
    return true
  } catch (error) {
    console.error('Failed to export withdrawal data as PDF:', error)
    setResultStateHelper(updateState, false, 'pdf')
    return false
  }
}

/**
 * Export all data (savings + withdrawal) as PDF
 */
async function performAllDataPDFExport(context: SimulationContextState, updateState: StateUpdater): Promise<boolean> {
  setExportingStateHelper(updateState, 'pdf')

  try {
    if (!context.simulationData?.sparplanElements) {
      throw new Error('Keine Sparplan-Daten verfügbar.')
    }

    const withdrawalData = getWithdrawalDataHelper(context)

    if (!withdrawalData) {
      throw new Error('Keine Entnahme-Daten verfügbar.')
    }

    const exportData: ExportData = {
      savingsData: context.simulationData,
      withdrawalData,
      context,
    }

    const pdfBlob = exportAllDataToPDF(exportData)
    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `simulation_komplett_${context.startEnd[0]}-${context.endOfLife}_${dateStr}.pdf`

    downloadPDFBlob(pdfBlob, filename)
    setResultStateHelper(updateState, true, 'pdf')
    return true
  } catch (error) {
    console.error('Failed to export all data as PDF:', error)
    setResultStateHelper(updateState, false, 'pdf')
    return false
  }
}

/**
 * Helper function to prepare data for markdown export
 */
function prepareMarkdownExportData(context: SimulationContextState) {
  const {
    hasSavingsData,
    hasWithdrawalData: initialWithdrawalData,
    hasWithdrawalConfig,
  } = checkDataAvailability(context)

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
 * Type for state setter function
 */
type StateUpdater = (state: Partial<DataExportState>) => void

/**
 * Helper to set exporting state
 */
function setExportingStateHelper(setState: StateUpdater, exportType: 'csv' | 'markdown' | 'clipboard' | 'excel' | 'pdf') {
  setState({
    isExporting: true,
    lastExportResult: null,
    exportType,
  })
}

/**
 * Helper to set result state and schedule clearing
 */
function setResultStateHelper(
  setState: StateUpdater,
  success: boolean,
  exportType: 'csv' | 'markdown' | 'clipboard' | 'excel' | 'pdf',
) {
  setState({
    isExporting: false,
    lastExportResult: success ? 'success' : 'error',
    exportType,
  })

  // Clear result after delay
  setTimeout(() => {
    setState({ lastExportResult: null, exportType: null })
  }, 3000)
}

/**
 * Helper to create export callback with context and state
 */
function createExportCallback(
  exportFn: (context: SimulationContextState, updateState: StateUpdater) => Promise<boolean>,
  context: SimulationContextState,
  updateState: StateUpdater,
) {
  return async () => exportFn(context, updateState)
}

/**
 * Custom hook for exporting simulation data in various formats
 */
export function useDataExport() {
  const context = useSimulation()
  const [state, setState] = useState<DataExportState>({
    isExporting: false,
    lastExportResult: null,
    exportType: null,
  })
  const updateState = useCallback((updates: Partial<DataExportState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])
  // CSV exports
  const exportSavingsDataCSV = useCallback(() => createExportCallback(performSavingsCSVExport, context, updateState)(), [
    context,
    updateState,
  ])
  const exportWithdrawalDataCSV = useCallback(
    () => createExportCallback(performWithdrawalCSVExport, context, updateState)(),
    [context, updateState],
  )
  const exportAllDataCSV = useCallback(() => createExportCallback(performAllDataCSVExport, context, updateState)(), [
    context,
    updateState,
  ])
  // Other exports
  const exportDataMarkdown = useCallback(() => createExportCallback(performMarkdownExport, context, updateState)(), [
    context,
    updateState,
  ])
  const copyCalculationExplanations = useCallback(
    () => createExportCallback(performClipboardCopy, context, updateState)(),
    [context, updateState],
  )
  // Excel exports
  const exportSavingsDataExcel = useCallback(
    () => createExportCallback(performSavingsExcelExport, context, updateState)(),
    [context, updateState],
  )
  const exportWithdrawalDataExcel = useCallback(
    () => createExportCallback(performWithdrawalExcelExport, context, updateState)(),
    [context, updateState],
  )
  const exportAllDataExcel = useCallback(() => createExportCallback(performAllDataExcelExport, context, updateState)(), [
    context,
    updateState,
  ])
  // PDF exports
  const exportSavingsDataPDF = useCallback(
    () => createExportCallback(performSavingsPDFExport, context, updateState)(),
    [context, updateState],
  )
  const exportWithdrawalDataPDF = useCallback(
    () => createExportCallback(performWithdrawalPDFExport, context, updateState)(),
    [context, updateState],
  )
  const exportAllDataPDF = useCallback(() => createExportCallback(performAllDataPDFExport, context, updateState)(), [
    context,
    updateState,
  ])
  return { exportSavingsDataCSV, exportWithdrawalDataCSV, exportAllDataCSV, exportDataMarkdown, copyCalculationExplanations, exportSavingsDataExcel, exportWithdrawalDataExcel, exportAllDataExcel, exportSavingsDataPDF, exportWithdrawalDataPDF, exportAllDataPDF, ...state }
}
