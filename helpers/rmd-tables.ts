/**
 * German Life Expectancy Tables and RMD Divisor Calculations
 * Based on German Federal Statistical Office (Destatis) mortality tables
 */

/**
 * German life expectancy data (2020-2022 average) - Gender-neutral
 * Source: Destatis Sterbetafel 2020/22
 * Represents remaining life expectancy in years for each age
 */
export const GERMAN_LIFE_EXPECTANCY_2020_22: Record<number, number> = {
  // Ages 50-100+ with remaining life expectancy
  50: 32.8,
  51: 31.9,
  52: 30.9,
  53: 30.0,
  54: 29.1,
  55: 28.2,
  56: 27.3,
  57: 26.4,
  58: 25.5,
  59: 24.6,
  60: 23.7,
  61: 22.8,
  62: 22.0,
  63: 21.1,
  64: 20.3,
  65: 19.4,
  66: 18.6,
  67: 17.8,
  68: 17.0,
  69: 16.2,
  70: 15.4,
  71: 14.6,
  72: 13.9,
  73: 13.1,
  74: 12.4,
  75: 11.7,
  76: 11.0,
  77: 10.3,
  78: 9.7,
  79: 9.1,
  80: 8.5,
  81: 7.9,
  82: 7.4,
  83: 6.9,
  84: 6.4,
  85: 5.9,
  86: 5.5,
  87: 5.1,
  88: 4.7,
  89: 4.3,
  90: 4.0,
  91: 3.7,
  92: 3.4,
  93: 3.1,
  94: 2.9,
  95: 2.7,
  96: 2.5,
  97: 2.3,
  98: 2.1,
  99: 1.9,
  100: 1.8,
}

/**
 * German life expectancy data for males (2020-2022 average)
 * Source: Destatis Sterbetafel 2020/22 - Männer
 * Represents remaining life expectancy in years for each age
 */
export const GERMAN_LIFE_EXPECTANCY_MALE_2020_22: Record<number, number> = {
  50: 30.2,
  51: 29.3,
  52: 28.4,
  53: 27.5,
  54: 26.6,
  55: 25.7,
  56: 24.8,
  57: 23.9,
  58: 23.0,
  59: 22.1,
  60: 21.3,
  61: 20.4,
  62: 19.6,
  63: 18.8,
  64: 18.0,
  65: 17.2,
  66: 16.4,
  67: 15.6,
  68: 14.9,
  69: 14.1,
  70: 13.4,
  71: 12.7,
  72: 12.0,
  73: 11.3,
  74: 10.6,
  75: 10.0,
  76: 9.4,
  77: 8.8,
  78: 8.2,
  79: 7.7,
  80: 7.1,
  81: 6.6,
  82: 6.2,
  83: 5.7,
  84: 5.3,
  85: 4.9,
  86: 4.5,
  87: 4.2,
  88: 3.8,
  89: 3.5,
  90: 3.2,
  91: 2.9,
  92: 2.7,
  93: 2.4,
  94: 2.2,
  95: 2.0,
  96: 1.8,
  97: 1.7,
  98: 1.5,
  99: 1.4,
  100: 1.3,
}

/**
 * German life expectancy data for females (2020-2022 average)
 * Source: Destatis Sterbetafel 2020/22 - Frauen
 * Represents remaining life expectancy in years for each age
 */
export const GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22: Record<number, number> = {
  50: 35.3,
  51: 34.3,
  52: 33.4,
  53: 32.4,
  54: 31.5,
  55: 30.5,
  56: 29.6,
  57: 28.6,
  58: 27.7,
  59: 26.8,
  60: 25.8,
  61: 24.9,
  62: 24.0,
  63: 23.1,
  64: 22.2,
  65: 21.3,
  66: 20.4,
  67: 19.6,
  68: 18.7,
  69: 17.9,
  70: 17.0,
  71: 16.2,
  72: 15.4,
  73: 14.6,
  74: 13.8,
  75: 13.0,
  76: 12.2,
  77: 11.5,
  78: 10.8,
  79: 10.1,
  80: 9.4,
  81: 8.8,
  82: 8.2,
  83: 7.6,
  84: 7.0,
  85: 6.5,
  86: 6.0,
  87: 5.5,
  88: 5.1,
  89: 4.6,
  90: 4.2,
  91: 3.9,
  92: 3.5,
  93: 3.2,
  94: 2.9,
  95: 2.7,
  96: 2.4,
  97: 2.2,
  98: 2.0,
  99: 1.8,
  100: 1.7,
}

/**
 * Calculate joint life expectancy for couples
 * This represents the probability that at least one spouse will still be alive
 * Uses actuarial formula: Joint Life Expectancy ≈ Individual1 + Individual2
 * - (Individual1 * Individual2 / (Individual1 + Individual2 + constant))
 */
export function calculateJointLifeExpectancy(
  age1: number,
  age2: number,
  gender1: 'male' | 'female' = 'male',
  gender2: 'male' | 'female' = 'female',
): number {
  const table1 = gender1 === 'male' ? GERMAN_LIFE_EXPECTANCY_MALE_2020_22 : GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22
  const table2 = gender2 === 'male' ? GERMAN_LIFE_EXPECTANCY_MALE_2020_22 : GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22

  const lifeExp1 = getLifeExpectancyFromTable(age1, table1)
  const lifeExp2 = getLifeExpectancyFromTable(age2, table2)

  // Actuarial joint life expectancy approximation
  // This gives the expected remaining years until both people have died
  // For retirement planning, we want the expectation of the maximum (last survivor)
  const jointLifeExpectancy = Math.max(lifeExp1, lifeExp2) + Math.min(lifeExp1, lifeExp2) * 0.3

  return Math.round(jointLifeExpectancy * 10) / 10 // Round to 1 decimal place
}

/**
 * Helper function to get life expectancy from a specific table
 */
function getLifeExpectancyFromTable(age: number, table: Record<number, number>): number {
  const lifeExpectancy = table[age]

  if (lifeExpectancy === undefined) {
    // For ages outside our table, use conservative estimates
    if (age < 50) {
      // Young ages: use age 50 data
      return table[50] || 30
    } else {
      // Very old ages: use minimum expectancy
      return 1.0
    }
  }

  return lifeExpectancy
}

/**
 * Calculate RMD divisor based on age and life expectancy table
 * Similar to US IRS Uniform Lifetime Table but using German mortality data
 */
export function calculateRMDDivisor(
  age: number,
  table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom' = 'german_2020_22',
  customLifeExpectancy?: number,
): number {
  if (table === 'custom' && customLifeExpectancy !== undefined) {
    return Math.max(1.0, customLifeExpectancy)
  }

  // Select the appropriate table based on gender specification
  let selectedTable: Record<number, number>
  switch (table) {
    case 'german_male_2020_22':
      selectedTable = GERMAN_LIFE_EXPECTANCY_MALE_2020_22
      break
    case 'german_female_2020_22':
      selectedTable = GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22
      break
    case 'german_2020_22':
    default:
      selectedTable = GERMAN_LIFE_EXPECTANCY_2020_22
      break
  }

  return Math.max(1.0, getLifeExpectancyFromTable(age, selectedTable))
}

/**
 * Calculate RMD withdrawal amount for a given portfolio value and age
 */
export function calculateRMDWithdrawal(
  portfolioValue: number,
  age: number,
  table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom' = 'german_2020_22',
  customLifeExpectancy?: number,
): number {
  const divisor = calculateRMDDivisor(age, table, customLifeExpectancy)
  return portfolioValue / divisor
}

/**
 * Get user-friendly description of the RMD approach
 */
export function getRMDDescription(age: number): string {
  const divisor = calculateRMDDivisor(age)
  const percentage = ((1 / divisor) * 100).toFixed(1)

  return `Bei Alter ${age}: Entnahme von ${percentage}% des Portfoliowerts (Divisor: ${divisor.toFixed(1)})`
}
