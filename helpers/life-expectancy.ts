/**
 * Helper functions for calculating end of life year from birth year and life expectancy
 */

/**
 * Calculate end of life year from birth year and expected lifespan
 * @param birthYear - The birth year (e.g., 1974)
 * @param expectedLifespan - Expected age at death (e.g., 85)
 * @returns The calculated end of life year (e.g., 2059)
 */
export function calculateEndOfLifeYear(birthYear: number, expectedLifespan: number): number {
  return birthYear + expectedLifespan
}

/**
 * Calculate current age from birth year
 * @param birthYear - The birth year (e.g., 1974)
 * @param currentYear - Current year (defaults to current year)
 * @returns Current age
 */
export function calculateCurrentAge(birthYear: number, currentYear: number = new Date().getFullYear()): number {
  return currentYear - birthYear
}

/**
 * Calculate age at given year
 * @param birthYear - The birth year (e.g., 1974)
 * @param targetYear - The target year (e.g., 2080)
 * @returns Age at the target year
 */
export function calculateAgeAtYear(birthYear: number, targetYear: number): number {
  return targetYear - birthYear
}

/**
 * Get default life expectancy based on current age and gender
 * Based on German life expectancy statistics
 * @param currentAge - Current age
 * @param gender - Gender (optional, defaults to average)
 * @returns Estimated life expectancy
 */
export function getDefaultLifeExpectancy(currentAge: number, gender?: 'male' | 'female'): number {
  // German life expectancy approximations (simplified)
  // These are rough estimates for planning purposes
  const baseLifeExpectancy = gender === 'male' ? 78 : gender === 'female' ? 83 : 80.5

  // Adjust for current age (people who have already reached a certain age tend to live longer)
  let adjustedLifeExpectancy = baseLifeExpectancy

  if (currentAge >= 65) {
    adjustedLifeExpectancy += 2
  } else if (currentAge >= 50) {
    adjustedLifeExpectancy += 1
  }

  return Math.round(adjustedLifeExpectancy)
}
