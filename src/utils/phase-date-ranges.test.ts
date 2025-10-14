import { describe, it, expect } from 'vitest'
import { calculatePhaseDateRanges } from './phase-date-ranges'
import type { Sparplan } from './sparplan-utils'

describe('calculatePhaseDateRanges', () => {
  it('should calculate correct date ranges with valid sparplan', () => {
    const sparplan: Sparplan[] = [
      {
        id: 1,
        start: new Date(2024, 0, 1),
        end: new Date(2054, 11, 31),
        einzahlung: 12000,
        ter: 0.2,
      },
      {
        id: 2,
        start: new Date(2025, 0, 1),
        end: new Date(2054, 11, 31),
        einzahlung: 6000,
        ter: 0.2,
      },
    ]
    const startEnd: [number, number] = [2054, 2090]
    const endOfLife = 2090

    const result = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

    expect(result.savingsStartYear).toBe(2024)
    expect(result.savingsEndYear).toBe(2054)
    expect(result.withdrawalStartYear).toBe(2055)
    expect(result.withdrawalEndYear).toBe(2090)
  })

  it('should use current year when sparplan is empty', () => {
    const sparplan: Sparplan[] = []
    const startEnd: [number, number] = [2054, 2090]
    const endOfLife = 2090
    const currentYear = new Date().getFullYear()

    const result = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

    expect(result.savingsStartYear).toBe(currentYear)
    expect(result.savingsEndYear).toBe(2054)
    expect(result.withdrawalStartYear).toBe(2055)
    expect(result.withdrawalEndYear).toBe(2090)
  })

  it('should find the earliest start year from multiple sparplans', () => {
    const sparplan: Sparplan[] = [
      {
        id: 1,
        start: new Date(2030, 0, 1),
        end: new Date(2054, 11, 31),
        einzahlung: 12000,
        ter: 0.2,
      },
      {
        id: 2,
        start: new Date(2020, 0, 1),
        end: new Date(2054, 11, 31),
        einzahlung: 6000,
        ter: 0.2,
      },
      {
        id: 3,
        start: new Date(2025, 0, 1),
        end: new Date(2054, 11, 31),
        einzahlung: 3000,
        ter: 0.2,
      },
    ]
    const startEnd: [number, number] = [2054, 2090]
    const endOfLife = 2090

    const result = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

    expect(result.savingsStartYear).toBe(2020)
    expect(result.savingsEndYear).toBe(2054)
    expect(result.withdrawalStartYear).toBe(2055)
    expect(result.withdrawalEndYear).toBe(2090)
  })

  it('should handle single sparplan correctly', () => {
    const sparplan: Sparplan[] = [
      {
        id: 1,
        start: new Date(2024, 5, 15), // Mid-year start
        end: new Date(2054, 11, 31),
        einzahlung: 12000,
        ter: 0.2,
      },
    ]
    const startEnd: [number, number] = [2054, 2090]
    const endOfLife = 2090

    const result = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

    expect(result.savingsStartYear).toBe(2024)
    expect(result.savingsEndYear).toBe(2054)
    expect(result.withdrawalStartYear).toBe(2055)
    expect(result.withdrawalEndYear).toBe(2090)
  })
})
