/**
 * Utility functions for withdrawal strategy display and formatting
 */

import type { ReadonlyRecord } from '../types'

/**
 * Map of withdrawal strategy identifiers to user-friendly German names
 * Provides consistent naming across the application
 */
const strategyDisplayNames: ReadonlyRecord<string, string> = {
  '4prozent': '4% Regel',
  '3prozent': '3% Regel',
  variabel_prozent: 'Variable Prozent',
  monatlich_fest: 'Monatlich fest',
  dynamisch: 'Dynamische Strategie',
  bucket_strategie: 'Drei-Eimer-Strategie',
  rmd: 'RMD (Lebenserwartung)',
  kapitalerhalt: 'Kapitalerhalt / Ewige Rente',
  steueroptimiert: 'Steueroptimiert',
}

/**
 * Get display name for withdrawal strategy type
 * Maps internal strategy identifiers to user-friendly German names
 *
 * @param strategy - The withdrawal strategy identifier
 * @returns German display name for the strategy, or the original string if not found
 *
 * @example
 * ```typescript
 * getStrategyDisplayName('4prozent') // Returns: "4% Regel"
 * getStrategyDisplayName('bucket_strategie') // Returns: "Drei-Eimer-Strategie"
 * getStrategyDisplayName('unknown') // Returns: "unknown" (fallback for unknown strategies)
 * ```
 */
export function getStrategyDisplayName(strategy: string): string {
  return strategyDisplayNames[strategy] ?? strategy
}
