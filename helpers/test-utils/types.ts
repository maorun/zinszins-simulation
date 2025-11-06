/**
 * Utility types for helper tests
 * Provides type-safe alternatives to `any` in helper test files
 */

import type { CareLevel } from '../care-cost-simulation'

/**
 * Care level test result type
 * Generic type for testing care cost simulation results
 */
export interface CareLevelTestResult<T = unknown> {
  level: CareLevel
  result: T
}
