/**
 * Helper functions for calculating Sparerpauschbetrag (tax allowance) based on planning mode
 *
 * According to German tax law, each person has an annual Sparerpauschbetrag of 2000€.
 * For couples, this means a combined allowance of 4000€.
 */

export type PlanningMode = 'individual' | 'couple'

/**
 * Calculate the appropriate Sparerpauschbetrag based on planning mode
 * @param planningMode - Whether planning for individual or couple
 * @param individualFreibetrag - Base freibetrag per person (default: 2000€)
 * @returns Total freibetrag amount for the planning scenario
 */
export function calculateFreibetragForPlanningMode(planningMode: PlanningMode, individualFreibetrag = 2000): number {
  switch (planningMode) {
    case 'individual':
      return individualFreibetrag
    case 'couple':
      return individualFreibetrag * 2 // Two people = double the allowance
    default:
      return individualFreibetrag
  }
}

/**
 * Create a freibetragPerYear object with planning mode-aware amounts
 * @param startYear - First year to include
 * @param endYear - Last year to include
 * @param planningMode - Whether planning for individual or couple
 * @param customFreibetragPerYear - Optional custom overrides for specific years
 * @param individualFreibetrag - Base freibetrag per person (default: 2000€)
 * @returns Object mapping years to freibetrag amounts
 */
export function createPlanningModeAwareFreibetragPerYear(
  startYear: number,
  endYear: number,
  planningMode: PlanningMode,
  customFreibetragPerYear?: { [year: number]: number },
  individualFreibetrag = 2000,
): { [year: number]: number } {
  const freibetragPerYear: { [year: number]: number } = {}
  const defaultAmount = calculateFreibetragForPlanningMode(planningMode, individualFreibetrag)

  for (let year = startYear; year <= endYear; year++) {
    // Use custom override if provided, otherwise use planning mode-aware default
    freibetragPerYear[year] = customFreibetragPerYear?.[year] ?? defaultAmount
  }

  return freibetragPerYear
}

/**
 * Update existing freibetragPerYear object to use planning mode-aware defaults
 * Only affects years that use the standard 2000€ amount (not custom overrides)
 * @param existingFreibetragPerYear - Current freibetrag configuration
 * @param planningMode - Whether planning for individual or couple
 * @param individualFreibetrag - Base freibetrag per person (default: 2000€)
 * @returns Updated freibetragPerYear object
 */
export function updateFreibetragForPlanningMode(
  existingFreibetragPerYear: { [year: number]: number },
  planningMode: PlanningMode,
  individualFreibetrag = 2000,
): { [year: number]: number } {
  const updatedFreibetrag: { [year: number]: number } = { ...existingFreibetragPerYear }
  const planningModeAmount = calculateFreibetragForPlanningMode(planningMode, individualFreibetrag)

  // Update years that are using the old default individual amount (2000€)
  // Leave custom amounts unchanged
  Object.keys(updatedFreibetrag).forEach(yearStr => {
    const year = parseInt(yearStr)
    const currentAmount = updatedFreibetrag[year]

    // If current amount is exactly 2000€ (old individual default) or 4000€ (old couple default)
    // update it to the new planning mode-aware amount
    if (currentAmount === 2000 || currentAmount === 4000) {
      updatedFreibetrag[year] = planningModeAmount
    }
  })

  return updatedFreibetrag
}
