import { describe, it, expect } from 'vitest'
import { getEnhancedOverviewSummary } from './enhanced-summary'

describe('getEnhancedOverviewSummary', () => {
  it('should return null if no simulation data is provided', () => {
    const result = getEnhancedOverviewSummary(null, [2040, 2080], null, 5, 26.375, 30)
    expect(result).toBeNull()
  })
})
