/**
 * Utility functions for withdrawal strategy display and formatting
 */

/**
 * Get display name for withdrawal strategy type
 * Maps internal strategy identifiers to user-friendly German names
 */
export function getStrategyDisplayName(strategy: string): string {
  switch (strategy) {
    case '4prozent':
      return '4% Regel'
    case '3prozent':
      return '3% Regel'
    case 'variabel_prozent':
      return 'Variable Prozent'
    case 'monatlich_fest':
      return 'Monatlich fest'
    case 'dynamisch':
      return 'Dynamische Strategie'
    case 'bucket_strategie':
      return 'Drei-Eimer-Strategie'
    case 'rmd':
      return 'RMD (Lebenserwartung)'
    case 'kapitalerhalt':
      return 'Kapitalerhalt / Ewige Rente'
    default:
      return strategy
  }
}
