/**
 * Error Message Constants
 *
 * Centralized error messages for export and data operations.
 * Provides consistency across the application and makes localization easier in the future.
 */

/**
 * Export-related error messages
 */
export const EXPORT_ERRORS = {
  /** No simulation data available */
  NO_SIMULATION_DATA: 'Keine Simulationsdaten verfügbar',
  
  /** No simulation data available with instruction to run simulation first */
  NO_SIMULATION_DATA_WITH_INSTRUCTION: 'Keine Simulationsdaten verfügbar. Bitte führen Sie zuerst eine Simulation durch.',
  
  /** No savings plan data available */
  NO_SAVINGS_DATA: 'Keine Sparplan-Daten verfügbar',
  
  /** No savings plan data available with instruction to run simulation first */
  NO_SAVINGS_DATA_WITH_INSTRUCTION: 'Keine Sparplan-Daten verfügbar. Bitte führen Sie zuerst eine Simulation durch.',
  
  /** No simulation elements available */
  NO_SIMULATION_ELEMENTS: 'Keine Simulationselemente verfügbar',
  
  /** No withdrawal data available */
  NO_WITHDRAWAL_DATA: 'Keine Entnahme-Daten verfügbar',
  
  /** No withdrawal data available with instruction to configure withdrawal strategy */
  NO_WITHDRAWAL_DATA_WITH_INSTRUCTION: 'Keine Entnahme-Daten verfügbar. Bitte konfigurieren Sie eine Entnahmestrategie.',
} as const

/**
 * Type for export error keys
 */
export type ExportErrorKey = keyof typeof EXPORT_ERRORS

/**
 * Helper function to get export error message by key
 *
 * @param key - The error key
 * @returns The corresponding error message
 *
 * @example
 * ```typescript
 * throw new Error(getExportError('NO_SAVINGS_DATA'))
 * ```
 */
export function getExportError(key: ExportErrorKey): string {
  return EXPORT_ERRORS[key]
}
