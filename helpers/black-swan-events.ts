/**
 * Black Swan Event simulation utilities
 * Historical extreme market events for stress testing portfolios
 */

export type BlackSwanEventId = 'dotcom-crash-2000' | 'financial-crisis-2008' | 'covid-crash-2020' | 'custom'

export interface BlackSwanEvent {
  id: BlackSwanEventId
  name: string
  description: string
  startYear: number
  duration: number // years
  yearlyReturns: Record<number, number> // Map of relative year offset to return rate
  recoveryYears?: number // Optional: years needed for recovery
}

/**
 * Predefined historical Black Swan events
 * Returns are based on historical DAX/MSCI World performance
 */
export const BLACK_SWAN_EVENTS: Record<BlackSwanEventId, BlackSwanEvent> = {
  'dotcom-crash-2000': {
    id: 'dotcom-crash-2000',
    name: 'Dotcom-Blase (2000-2003)',
    description: 'Platzen der Dotcom-Blase mit erheblichen Verlusten bei Technologieaktien',
    startYear: 2000,
    duration: 3,
    yearlyReturns: {
      0: -0.09, // 2000: -9%
      1: -0.19, // 2001: -19%
      2: -0.44, // 2002: -44%
    },
    recoveryYears: 5,
  },
  'financial-crisis-2008': {
    id: 'financial-crisis-2008',
    name: 'Finanzkrise (2008-2009)',
    description: 'Globale Finanzkrise mit Zusammenbruch des Immobilienmarktes und Bankenkrise',
    startYear: 2008,
    duration: 2,
    yearlyReturns: {
      0: -0.4, // 2008: -40%
      1: -0.25, // 2009: -25% (Märkte begannen sich zu erholen, aber noch negativ)
    },
    recoveryYears: 4,
  },
  'covid-crash-2020': {
    id: 'covid-crash-2020',
    name: 'COVID-19 Pandemie (2020)',
    description: 'Schneller Markteinbruch durch COVID-19 Pandemie mit rascher Erholung',
    startYear: 2020,
    duration: 1,
    yearlyReturns: {
      0: -0.08, // 2020: -8% (schnelle Erholung im selben Jahr)
    },
    recoveryYears: 1,
  },
  custom: {
    id: 'custom',
    name: 'Benutzerdefiniertes Szenario',
    description: 'Erstellen Sie Ihr eigenes Black Swan Szenario',
    startYear: 2024,
    duration: 1,
    yearlyReturns: {
      0: -0.3, // Default: -30%
    },
  },
} as const

/**
 * Apply a Black Swan event to a specific year in the simulation
 * @param baseYear - The year in the simulation when the event should occur
 * @param event - The Black Swan event to apply
 * @returns Map of year to return rate for the event period
 */
export function applyBlackSwanEvent(baseYear: number, event: BlackSwanEvent): Record<number, number> {
  const returns: Record<number, number> = {}

  for (let offset = 0; offset < event.duration; offset++) {
    const year = baseYear + offset
    returns[year] = event.yearlyReturns[offset] ?? -0.2 // Fallback to -20% if not defined
  }

  return returns
}

/**
 * Calculate the cumulative impact of a Black Swan event
 * @param event - The Black Swan event
 * @returns Cumulative return over the event period (e.g., -0.5 for -50% total loss)
 */
export function calculateCumulativeImpact(event: BlackSwanEvent): number {
  let cumulativeReturn = 1.0

  for (let offset = 0; offset < event.duration; offset++) {
    const yearReturn = event.yearlyReturns[offset] ?? 0
    cumulativeReturn *= 1 + yearReturn
  }

  return cumulativeReturn - 1 // Convert back to return rate
}

/**
 * Merge Black Swan event returns with existing return configuration
 * @param existingReturns - Existing yearly returns
 * @param blackSwanReturns - Black Swan event returns to overlay
 * @returns Merged returns with Black Swan event applied
 */
export function mergeBlackSwanReturns(
  existingReturns: Record<number, number>,
  blackSwanReturns: Record<number, number>,
): Record<number, number> {
  return {
    ...existingReturns,
    ...blackSwanReturns, // Black Swan returns override existing returns
  }
}

/**
 * Get all available Black Swan events
 */
export function getAvailableBlackSwanEvents(): BlackSwanEvent[] {
  return Object.values(BLACK_SWAN_EVENTS).filter(event => event.id !== 'custom')
}

/**
 * Get a Black Swan event by ID
 */
export function getBlackSwanEvent(id: BlackSwanEventId): BlackSwanEvent | undefined {
  return BLACK_SWAN_EVENTS[id]
}
