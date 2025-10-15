/**
 * Utility functions for withdrawal strategy display and formatting
 */

/**
 * Map of withdrawal strategy identifiers to user-friendly German names
 */
const strategyDisplayNames: Record<string, string> = {
  '4prozent': '4% Regel',
  '3prozent': '3% Regel',
  'variabel_prozent': 'Variable Prozent',
  'monatlich_fest': 'Monatlich fest',
  'dynamisch': 'Dynamische Strategie',
  'bucket_strategie': 'Drei-Eimer-Strategie',
  'rmd': 'RMD (Lebenserwartung)',
  'kapitalerhalt': 'Kapitalerhalt / Ewige Rente',
  'steueroptimiert': 'Steueroptimiert',
}

/**
 * Get display name for withdrawal strategy type
 * Maps internal strategy identifiers to user-friendly German names
 */
export function getStrategyDisplayName(strategy: string): string {
  return strategyDisplayNames[strategy] ?? strategy
}
