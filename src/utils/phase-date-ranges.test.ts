/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest'
import { calculatePhaseDateRanges } from './phase-date-ranges'
import type { Sparplan } from './sparplan-utils'

describe('calculatePhaseDateRanges', () => {
  it('should calculate date ranges with savings plans', () => {
    const sparplan: Sparplan[] = [
      {
        id: 1,
        start: new Date(2020, 0, 1),
        end: new Date(2040, 11, 31),
        einzahlung: 12000,
        ter: 0.2,
      },
      {
        id: 2,
        start: new Date(2025, 0, 1),
        end: new Date(2040, 11, 31),
        einzahlung: 6000,
        ter: 0.2,
      },
    ]

    const startEnd: [number, number] = [2040, 2070]
    const endOfLife = 2070

    const result = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

    expect(result).toEqual({
      savingsStartYear: 2020,
      savingsEndYear: 2040,
      withdrawalStartYear: 2041,
      withdrawalEndYear: 2070,
    })
  })

  it('should use current year when no savings plans exist', () => {
    const sparplan: Sparplan[] = []
    const startEnd: [number, number] = [2040, 2070]
    const endOfLife = 2070
    const currentYear = new Date().getFullYear()

    const result = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

    expect(result).toEqual({
      savingsStartYear: currentYear,
      savingsEndYear: 2040,
      withdrawalStartYear: 2041,
      withdrawalEndYear: 2070,
    })
  })

  it('should find earliest start year from multiple plans', () => {
    const sparplan: Sparplan[] = [
      {
        id: 1,
        start: new Date(2030, 0, 1),
        end: new Date(2040, 11, 31),
        einzahlung: 12000,
        ter: 0.2,
      },
      {
        id: 2,
        start: new Date(2015, 6, 15), // Earliest
        end: new Date(2040, 11, 31),
        einzahlung: 6000,
        ter: 0.2,
      },
      {
        id: 3,
        start: new Date(2025, 3, 1),
        end: new Date(2040, 11, 31),
        einzahlung: 3000,
        ter: 0.2,
      },
    ]

    const startEnd: [number, number] = [2040, 2070]
    const endOfLife = 2070

    const result = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

    expect(result.savingsStartYear).toBe(2015)
  })

  it('should handle different end of life values', () => {
    const sparplan: Sparplan[] = [
      {
        id: 1,
        start: new Date(2020, 0, 1),
        end: new Date(2040, 11, 31),
        einzahlung: 12000,
        ter: 0.2,
      },
    ]

    const startEnd: [number, number] = [2040, 2070]
    const endOfLife = 2085 // Extended life expectancy

    const result = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

    expect(result.withdrawalEndYear).toBe(2085)
  })

  it('should calculate withdrawal start as one year after savings end', () => {
    const sparplan: Sparplan[] = [
      {
        id: 1,
        start: new Date(2020, 0, 1),
        end: new Date(2050, 11, 31),
        einzahlung: 12000,
        ter: 0.2,
      },
    ]

    const startEnd: [number, number] = [2050, 2080]
    const endOfLife = 2080

    const result = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

    expect(result.savingsEndYear).toBe(2050)
    expect(result.withdrawalStartYear).toBe(2051)
  })
})
