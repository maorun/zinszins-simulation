import { describe, it, expect } from 'vitest'
import { calculateWithdrawalEndYear } from './overview-calculations'
import type { EnhancedSummary } from './summary-utils'

describe('calculateWithdrawalEndYear', () => {
  it('should return global end year when no enhanced summary is provided', () => {
    const result = calculateWithdrawalEndYear(null, undefined, 2080)
    expect(result).toBe(2080)
  })

  it('should return endOfLife when provided and no segmented withdrawal', () => {
    const enhancedSummary: Partial<EnhancedSummary> = {
      isSegmentedWithdrawal: false,
    }
    const result = calculateWithdrawalEndYear(
      enhancedSummary as EnhancedSummary,
      2075,
      2080,
    )
    expect(result).toBe(2075)
  })

  it('should return global end year when endOfLife is not provided and no segmented withdrawal', () => {
    const enhancedSummary: Partial<EnhancedSummary> = {
      isSegmentedWithdrawal: false,
    }
    const result = calculateWithdrawalEndYear(
      enhancedSummary as EnhancedSummary,
      undefined,
      2080,
    )
    expect(result).toBe(2080)
  })

  it('should return the latest segment end year when segmented withdrawal is active', () => {
    const enhancedSummary: Partial<EnhancedSummary> = {
      isSegmentedWithdrawal: true,
      withdrawalSegments: [
        {
          id: '1',
          name: 'Phase 1',
          startYear: 2040,
          endYear: 2060,
          strategy: '4prozent',
          startkapital: 500000,
          endkapital: 400000,
          totalWithdrawn: 100000,
          averageMonthlyWithdrawal: 1500,
        },
        {
          id: '2',
          name: 'Phase 2',
          startYear: 2061,
          endYear: 2075,
          strategy: '3prozent',
          startkapital: 400000,
          endkapital: 300000,
          totalWithdrawn: 100000,
          averageMonthlyWithdrawal: 1200,
        },
      ],
    }
    const result = calculateWithdrawalEndYear(
      enhancedSummary as EnhancedSummary,
      2070,
      2080,
    )
    // Should use the latest segment end year (2075) instead of endOfLife (2070)
    expect(result).toBe(2075)
  })

  it('should handle empty segments array and fall back to endOfLife', () => {
    const enhancedSummary: Partial<EnhancedSummary> = {
      isSegmentedWithdrawal: true,
      withdrawalSegments: [],
    }
    const result = calculateWithdrawalEndYear(
      enhancedSummary as EnhancedSummary,
      2070,
      2080,
    )
    expect(result).toBe(2070)
  })

  it('should filter out invalid segment end years', () => {
    const enhancedSummary: Partial<EnhancedSummary> = {
      isSegmentedWithdrawal: true,
      withdrawalSegments: [
        {
          id: '1',
          name: 'Phase 1',
          startYear: 2040,
          endYear: NaN as any,
          strategy: '4prozent',
          startkapital: 500000,
          endkapital: 400000,
          totalWithdrawn: 100000,
          averageMonthlyWithdrawal: 1500,
        },
        {
          id: '2',
          name: 'Phase 2',
          startYear: 2061,
          endYear: 2075,
          strategy: '3prozent',
          startkapital: 400000,
          endkapital: 300000,
          totalWithdrawn: 100000,
          averageMonthlyWithdrawal: 1200,
        },
      ],
    }
    const result = calculateWithdrawalEndYear(
      enhancedSummary as EnhancedSummary,
      2070,
      2080,
    )
    // Should use the valid segment end year (2075)
    expect(result).toBe(2075)
  })

  it('should handle segments with only invalid end years', () => {
    const enhancedSummary: Partial<EnhancedSummary> = {
      isSegmentedWithdrawal: true,
      withdrawalSegments: [
        {
          id: '1',
          name: 'Phase 1',
          startYear: 2040,
          endYear: NaN as any,
          strategy: '4prozent',
          startkapital: 500000,
          endkapital: 400000,
          totalWithdrawn: 100000,
          averageMonthlyWithdrawal: 1500,
        },
      ],
    }
    const result = calculateWithdrawalEndYear(
      enhancedSummary as EnhancedSummary,
      2070,
      2080,
    )
    // Should fall back to endOfLife when all segment years are invalid
    expect(result).toBe(2070)
  })
})
