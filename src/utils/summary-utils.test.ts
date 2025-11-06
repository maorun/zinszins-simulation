import { describe, expect, test } from 'vitest'
import { getYearlyPortfolioProgression } from './summary-utils'
import { convertSparplanToElements, type Sparplan } from './sparplan-utils'
import { SimulationAnnual } from './simulate'

describe('summary-utils - getYearlyPortfolioProgression', () => {
  test('should not show contributions for years after Sparplan ends', () => {
    // Create a realistic scenario using convertSparplanToElements
    const sparplans: Sparplan[] = [
      {
        id: 1,
        start: new Date('2026-01-01'),
        end: new Date('2028-12-31'), // Ends after 2028
        einzahlung: 12000,
      },
    ]

    const elements = convertSparplanToElements(sparplans, [2030, 2080], SimulationAnnual.yearly)

    // Elements should only be created for 2026, 2027, 2028 (3 elements)
    expect(elements).toHaveLength(3)

    // Add realistic simulation data for these elements and beyond
    elements[0].simulation = {
      2026: {
        startkapital: 0,
        zinsen: 600,
        endkapital: 12600,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
      // This element continues to compound even after its Sparplan ends
      2029: {
        startkapital: 12600,
        zinsen: 630,
        endkapital: 13230,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    }

    elements[1].simulation = {
      2027: {
        startkapital: 12600,
        zinsen: 1230,
        endkapital: 25830,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
      2029: {
        startkapital: 25830,
        zinsen: 1292,
        endkapital: 27122,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    }

    elements[2].simulation = {
      2028: {
        startkapital: 25830,
        zinsen: 1892,
        endkapital: 39722,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
      2029: {
        startkapital: 39722,
        zinsen: 1986,
        endkapital: 41708,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    }

    const progression = getYearlyPortfolioProgression(elements)

    // Should have data for all years that exist in simulation: 2026, 2027, 2028, 2029
    expect(progression).toHaveLength(4)

    // Check contributions by year
    const contributionsByYear = progression.reduce(
      (acc, p) => {
        acc[p.year] = p.yearlyContribution
        return acc
      },
      {} as Record<number, number>,
    )

    // 2026-2028: Should show contributions (12000 each year)
    expect(contributionsByYear[2026]).toBe(12000)
    expect(contributionsByYear[2027]).toBe(12000)
    expect(contributionsByYear[2028]).toBe(12000)

    // 2029: Should show NO contributions (0) - only compound growth
    expect(contributionsByYear[2029]).toBe(0)

    // But interest should still accrue in 2029
    const progression2029 = progression.find(p => p.year === 2029)!
    expect(progression2029.yearlyInterest).toBeGreaterThan(0)

    // Total capital should still be calculated correctly
    expect(progression2029.totalCapital).toBeGreaterThan(0)
  })

  test('should handle multiple Sparpläne starting in the same year', () => {
    const sparplans: Sparplan[] = [
      // Two Sparpläne starting in 2026
      {
        id: 1,
        start: new Date('2026-01-01'),
        end: new Date('2026-12-31'),
        einzahlung: 10000,
      },
      {
        id: 2,
        start: new Date('2026-01-01'),
        end: new Date('2026-12-31'),
        einzahlung: 5000,
      },
    ]

    const elements = convertSparplanToElements(sparplans, [2030, 2080], SimulationAnnual.yearly)

    // Should create 2 elements both starting in 2026
    expect(elements).toHaveLength(2)

    // Add simulation data
    elements.forEach(element => {
      element.simulation = {
        2026: {
          startkapital: 0,
          zinsen: element.einzahlung * 0.05,
          endkapital: element.einzahlung * 1.05,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      }
    })

    const progression = getYearlyPortfolioProgression(elements)

    expect(progression).toHaveLength(1)
    expect(progression[0].year).toBe(2026)

    // Should correctly sum both Sparpläne: 10000 + 5000 = 15000
    expect(progression[0].yearlyContribution).toBe(15000)
  })

  test('should handle multiple Sparpläne with different end dates', () => {
    const sparplans: Sparplan[] = [
      // First Sparplan: 2026-2027 (2 years)
      {
        id: 1,
        start: new Date('2026-01-01'),
        end: new Date('2027-12-31'),
        einzahlung: 10000,
      },
      // Second Sparplan: 2028-2029 (different years to avoid overlap)
      {
        id: 2,
        start: new Date('2028-01-01'),
        end: new Date('2029-12-31'),
        einzahlung: 5000,
      },
    ]

    const elements = convertSparplanToElements(sparplans, [2030, 2080], SimulationAnnual.yearly)

    // Should create:
    // - First Sparplan: 2 elements (2026, 2027)
    // - Second Sparplan: 2 elements (2028, 2029)
    // Total: 4 elements
    expect(elements).toHaveLength(4)

    // Add simulation data
    elements.forEach(element => {
      const year = new Date(element.start).getFullYear()
      element.simulation = {
        [year]: {
          startkapital: 0,
          zinsen: element.einzahlung * 0.05,
          endkapital: element.einzahlung * 1.05,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      }
    })

    const progression = getYearlyPortfolioProgression(elements)

    const contributionsByYear = progression.reduce(
      (acc, p) => {
        acc[p.year] = p.yearlyContribution
        return acc
      },
      {} as Record<number, number>,
    )

    // 2026: Only first Sparplan active
    expect(contributionsByYear[2026]).toBe(10000)

    // 2027: Only first Sparplan active
    expect(contributionsByYear[2027]).toBe(10000)

    // 2028: Only second Sparplan active
    expect(contributionsByYear[2028]).toBe(5000)

    // 2029: Only second Sparplan active
    expect(contributionsByYear[2029]).toBe(5000)
  })

  test('should handle one-time payments correctly', () => {
    const sparplans: Sparplan[] = [
      // Regular Sparplan
      {
        id: 1,
        start: new Date('2026-01-01'),
        end: new Date('2026-12-31'),
        einzahlung: 6000,
      },
      // One-time payment (same start and end date)
      {
        id: 2,
        start: new Date('2026-01-01'),
        end: new Date('2026-01-01'),
        einzahlung: 50000,
      },
    ]

    const elements = convertSparplanToElements(sparplans, [2030, 2080], SimulationAnnual.yearly)

    // Should create 2 elements: 1 sparplan + 1 one-time payment
    expect(elements).toHaveLength(2)

    // Add simulation data
    elements.forEach(element => {
      element.simulation = {
        2026: {
          startkapital: element.type === 'einmalzahlung' ? element.einzahlung : 0,
          zinsen: element.einzahlung * 0.05,
          endkapital: element.einzahlung * 1.05,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      }
    })

    const progression = getYearlyPortfolioProgression(elements)

    expect(progression).toHaveLength(1)
    expect(progression[0].year).toBe(2026)

    // Should include both Sparplan and one-time payment
    expect(progression[0].yearlyContribution).toBe(56000) // 6000 + 50000
  })

  test('should handle empty or undefined elements', () => {
    expect(getYearlyPortfolioProgression([])).toEqual([])
    expect(getYearlyPortfolioProgression(undefined)).toEqual([])
  })

  test('should calculate cumulative values correctly', () => {
    const sparplans: Sparplan[] = [
      {
        id: 1,
        start: new Date('2026-01-01'),
        end: new Date('2027-12-31'),
        einzahlung: 1000,
      },
    ]

    const elements = convertSparplanToElements(sparplans, [2030, 2080], SimulationAnnual.yearly)

    // Add simulation data for both years
    elements[0].simulation = {
      2026: {
        startkapital: 0,
        zinsen: 50,
        endkapital: 1050,
        bezahlteSteuer: 10,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    }

    elements[1].simulation = {
      2027: {
        startkapital: 1050,
        zinsen: 103,
        endkapital: 2153,
        bezahlteSteuer: 15,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    }

    const progression = getYearlyPortfolioProgression(elements)

    expect(progression).toHaveLength(2)

    // 2026
    expect(progression[0].cumulativeContributions).toBe(1000)
    expect(progression[0].cumulativeInterest).toBe(50)
    expect(progression[0].cumulativeTax).toBe(10)

    // 2027
    expect(progression[1].cumulativeContributions).toBe(2000) // 1000 + 1000
    expect(progression[1].cumulativeInterest).toBe(153) // 50 + 103
    expect(progression[1].cumulativeTax).toBe(25) // 10 + 15
  })
})
