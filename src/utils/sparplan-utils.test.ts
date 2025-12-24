import { describe, expect, test } from 'vitest'
import { convertSparplanToElements, initialSparplan, type Sparplan } from './sparplan-utils'
import { SimulationAnnual } from './simulate'

describe('sparplan-utils', () => {
  describe('convertSparplanToElements', () => {
    test('should respect end date for yearly simulation', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-09-10'),
        end: new Date('2028-09-01'), // Should stop in 2028
        einzahlung: 24000,
      }

      const startEnd: [number, number] = [2040, 2080] // Simulation goes until 2040

      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.yearly)

      // Should only create elements from 2025 to 2028 (4 years)
      expect(elements).toHaveLength(4)
      expect(elements[0].start).toEqual(new Date('2025-01-01'))
      expect(elements[1].start).toEqual(new Date('2026-01-01'))
      expect(elements[2].start).toEqual(new Date('2027-01-01'))
      expect(elements[3].start).toEqual(new Date('2028-01-01'))

      // Should not create elements for 2029-2040
      const years = elements.map(el => new Date(el.start).getFullYear())
      expect(years).not.toContain(2029)
      expect(years).not.toContain(2040)
    })

    test('should calculate partial year amounts correctly in yearly simulation', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-09-10'), // Starts in September
        end: new Date('2028-09-01'), // Ends in September
        einzahlung: 12000, // 12000€ per year
      }

      const startEnd: [number, number] = [2040, 2080]

      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.yearly)

      expect(elements).toHaveLength(4)

      // 2025: September (month 8) to December (month 11) = 4 months
      // Expected: (12000 * 4) / 12 = 4000€
      expect(elements[0].einzahlung).toBeCloseTo(4000, 2)

      // 2026 and 2027: Full years = 12000€ each
      expect(elements[1].einzahlung).toBeCloseTo(12000, 2)
      expect(elements[2].einzahlung).toBeCloseTo(12000, 2)

      // 2028: January (month 0) to September (month 8) = 9 months
      // Expected: (12000 * 9) / 12 = 9000€
      expect(elements[3].einzahlung).toBeCloseTo(9000, 2)

      // Verify years
      expect(new Date(elements[0].start).getFullYear()).toBe(2025)
      expect(new Date(elements[1].start).getFullYear()).toBe(2026)
      expect(new Date(elements[2].start).getFullYear()).toBe(2027)
      expect(new Date(elements[3].start).getFullYear()).toBe(2028)
    })

    test('should respect end date for monthly simulation', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-09-10'),
        end: new Date('2028-09-01'), // Should stop in September 2028
        einzahlung: 24000, // Annual amount
      }

      const startEnd: [number, number] = [2040, 2080] // Simulation goes until 2040

      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.monthly)

      // Should create monthly elements from Sep 2025 to Sep 2028
      // 2025: 4 months (Sep-Dec)
      // 2026: 12 months
      // 2027: 12 months
      // 2028: 9 months (Jan-Sep)
      // Total: 4 + 12 + 12 + 9 = 37 months
      expect(elements).toHaveLength(37)

      // Each monthly payment should be yearly amount / 12
      elements.forEach(element => {
        expect(element.einzahlung).toBeCloseTo(24000 / 12, 2)
      })

      // Should not create elements for October 2028 onwards
      const lastElement = elements[elements.length - 1]
      const lastDate = new Date(lastElement.start)
      expect(lastDate.getFullYear()).toBe(2028)
      expect(lastDate.getMonth()).toBe(8) // September (0-indexed)

      // Should not create elements for years after 2028
      const years = elements.map(el => new Date(el.start).getFullYear())
      expect(years).not.toContain(2029)
      expect(years).not.toContain(2040)
    })

    test('should handle sparplan without end date', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-01-01'),
        // No end date - should continue until simulation end
        einzahlung: 24000,
      }

      const startEnd: [number, number] = [2030, 2080]

      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.yearly)

      // Should create elements from 2025 to 2030 (6 years)
      expect(elements).toHaveLength(6)
      expect(elements[0].start).toEqual(new Date('2025-01-01'))
      expect(elements[5].start).toEqual(new Date('2030-01-01'))
    })

    test('should handle multiple sparpläne with different end dates', () => {
      const sparplans: Sparplan[] = [
        {
          id: 1,
          start: new Date('2025-09-10'),
          end: new Date('2028-09-01'), // Ends in 2028
          einzahlung: 24000,
        },
        {
          id: 2,
          start: new Date('2028-09-10'),
          end: new Date('2028-09-10'), // One-time payment
          einzahlung: 50000,
        },
        {
          id: 3,
          start: new Date('2025-09-10'),
          end: new Date('2025-09-10'), // One-time payment
          einzahlung: 285000,
        },
      ]

      const startEnd: [number, number] = [2040, 2080]

      const elements = convertSparplanToElements(sparplans, startEnd, SimulationAnnual.yearly)

      // Should create:
      // - Sparplan 1: 4 yearly elements (2025-2028)
      // - Sparplan 2: 1 one-time payment (2028)
      // - Sparplan 3: 1 one-time payment (2025)
      // Total: 6 elements
      expect(elements).toHaveLength(6)

      // Check that no elements exist after 2028
      const years = elements.map(el => new Date(el.start).getFullYear())
      expect(years.filter(year => year > 2028)).toHaveLength(0)
    })

    test('should handle edge case: end date in the same year as start', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-03-15'),
        end: new Date('2025-11-20'), // Same year
        einzahlung: 12000,
      }

      const startEnd: [number, number] = [2040, 2080]

      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.monthly)

      // Should create monthly elements from March to November 2025 (9 months)
      expect(elements).toHaveLength(9)

      // Verify months
      const months = elements.map(el => new Date(el.start).getMonth())
      expect(months).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]) // March (2) to November (10)
    })
    test('should fix the original issue: initialSparplan should not have hard-coded end date', () => {
      // This test confirms that the fix for the reported issue is working

      // The issue was that initialSparplan had end: new Date('2040-10-01')
      // But it should be null to make end dates truly optional
      expect(initialSparplan.end).toBeNull()

      // When no end date is provided, convertSparplanToElements should continue until startEnd[0]
      const elementsWithoutEnd = convertSparplanToElements(
        [{ ...initialSparplan }],
        [2030, 2080],
        SimulationAnnual.yearly,
      )

      // Should create elements from current year to 2030
      const currentYear = new Date().getFullYear()
      const expectedLength = 2030 - currentYear + 1
      expect(elementsWithoutEnd).toHaveLength(expectedLength)

      // Should include 2030 but not beyond
      const years = elementsWithoutEnd.map(el => new Date(el.start).getFullYear())
      expect(years).toContain(2030)
      expect(years).not.toContain(2031)

      // When an explicit end date is provided, it should be respected
      const sparplanWithEnd: Sparplan = {
        ...initialSparplan,
        end: new Date('2028-09-01'),
      }

      const elementsWithEnd = convertSparplanToElements([sparplanWithEnd], [2040, 2080], SimulationAnnual.yearly)

      // Should stop at 2028, not continue to 2040
      const yearsWithEnd = elementsWithEnd.map(el => new Date(el.start).getFullYear())
      expect(yearsWithEnd).not.toContain(2029)
      expect(yearsWithEnd).not.toContain(2040)
      expect(Math.max(...yearsWithEnd)).toBe(2028)
    })

    test('should not continue beyond end date when simulation extends further - reproduce maorun issue', () => {
      // Test case to reproduce @maorun's reported issue:
      // "wenn man ein sparplan von 2026 bis 203 anlegt. Da wird bis 2040 eingezahlt."

      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2026-01-01'),
        end: new Date('2030-12-31'), // Should stop in 2030
        einzahlung: 12000,
      }

      const startEnd: [number, number] = [2040, 2080] // Simulation goes until 2040

      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.yearly)

      // Should create elements only from 2026 to 2030 (5 years)
      expect(elements).toHaveLength(5)

      // Check years
      const years = elements.map(el => new Date(el.start).getFullYear())
      expect(years).toEqual([2026, 2027, 2028, 2029, 2030])

      // Should NOT continue beyond 2030
      expect(years).not.toContain(2031)
      expect(years).not.toContain(2032)
      expect(years).not.toContain(2040)

      // Verify the max year is 2030
      expect(Math.max(...years)).toBe(2030)
    })

    test('should handle multiple Sparpläne correctly - reproduce the exact UI scenario', () => {
      // Test the exact scenario from the UI that shows the bug
      const sparplans: Sparplan[] = [
        {
          id: 1,
          start: new Date('2025-09-15'), // September 2025 (first Sparplan, no end)
          end: null,
          einzahlung: 24000,
        },
        {
          id: 2,
          start: new Date('2026-01-01'), // January 2026 to December 2030
          end: new Date('2030-12-01'),
          einzahlung: 12000,
        },
      ]

      const startEnd: [number, number] = [2040, 2080] // Simulation goes until 2040

      const elements = convertSparplanToElements(sparplans, startEnd, SimulationAnnual.yearly)

      // Group elements by year to check totals
      const byYear: { [key: number]: number } = {}
      elements.forEach(el => {
        const year = new Date(el.start).getFullYear()
        if (!byYear[year]) byYear[year] = 0
        byYear[year] += el.einzahlung
      })

      // Check expected yearly amounts:
      // 2025: First Sparplan partial year (Sep-Dec = 4 months) = 24000 * 4/12 = 8000
      expect(byYear[2025]).toBeCloseTo(8000, 0)

      // 2026-2030: Both Sparpläne active = 24000 + 12000 = 36000 per year
      expect(byYear[2026]).toBeCloseTo(36000, 0)
      expect(byYear[2027]).toBeCloseTo(36000, 0)
      expect(byYear[2028]).toBeCloseTo(36000, 0)
      expect(byYear[2029]).toBeCloseTo(36000, 0)
      expect(byYear[2030]).toBeCloseTo(36000, 0)

      // 2031-2040: Only first Sparplan (second should have ended) = 24000 per year
      for (let year = 2031; year <= 2040; year++) {
        expect(byYear[year] || 0).toBeCloseTo(24000, 0)
      }

      // Should not have any contributions beyond 2040
      expect(byYear[2041]).toBeUndefined()
    })
  })

  describe('Income Pattern for Self-Employed (Fluctuating Income)', () => {
    test('should apply monthly income pattern multipliers correctly', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-01-01'),
        end: new Date('2025-12-31'),
        einzahlung: 24000, // 24000€ annually = 2000€/month base
        incomePattern: {
          enabled: true,
          type: 'monthly',
          // Seasonal pattern: higher income in Q1 and Q4, lower in summer
          monthlyMultipliers: [
            1.3,
            1.2,
            1.1, // Q1: High season (Jan-Mar)
            1.0,
            0.9,
            0.8, // Q2: Normal to low (Apr-Jun)
            0.7,
            0.8,
            0.9, // Q3: Low to normal (Jul-Sep)
            1.0,
            1.2,
            1.4, // Q4: Normal to high (Oct-Dec)
          ],
          description: 'Seasonal business pattern',
        },
      }

      const startEnd: [number, number] = [2025, 2080]
      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.monthly)

      // Should create 12 monthly elements
      expect(elements).toHaveLength(12)

      // Base monthly amount is 2000€ (24000/12)
      const baseMonthly = 2000

      // Verify each month has correct multiplier applied
      expect(elements[0].einzahlung).toBeCloseTo(baseMonthly * 1.3, 2) // Jan: +30%
      expect(elements[1].einzahlung).toBeCloseTo(baseMonthly * 1.2, 2) // Feb: +20%
      expect(elements[2].einzahlung).toBeCloseTo(baseMonthly * 1.1, 2) // Mar: +10%
      expect(elements[3].einzahlung).toBeCloseTo(baseMonthly * 1.0, 2) // Apr: Normal
      expect(elements[4].einzahlung).toBeCloseTo(baseMonthly * 0.9, 2) // May: -10%
      expect(elements[5].einzahlung).toBeCloseTo(baseMonthly * 0.8, 2) // Jun: -20%
      expect(elements[6].einzahlung).toBeCloseTo(baseMonthly * 0.7, 2) // Jul: -30%
      expect(elements[7].einzahlung).toBeCloseTo(baseMonthly * 0.8, 2) // Aug: -20%
      expect(elements[8].einzahlung).toBeCloseTo(baseMonthly * 0.9, 2) // Sep: -10%
      expect(elements[9].einzahlung).toBeCloseTo(baseMonthly * 1.0, 2) // Oct: Normal
      expect(elements[10].einzahlung).toBeCloseTo(baseMonthly * 1.2, 2) // Nov: +20%
      expect(elements[11].einzahlung).toBeCloseTo(baseMonthly * 1.4, 2) // Dec: +40%

      // Total reflects the actual fluctuating income (sum of all multipliers * base)
      // Sum of multipliers: 1.3+1.2+1.1+1.0+0.9+0.8+0.7+0.8+0.9+1.0+1.2+1.4 = 12.3
      // Expected total: 2000 * 12.3 = 24,600€
      const total = elements.reduce((sum, el) => sum + el.einzahlung, 0)
      expect(total).toBeCloseTo(24600, 2)
    })

    test('should apply quarterly income pattern multipliers correctly', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-01-01'),
        end: new Date('2025-12-31'),
        einzahlung: 24000, // 24000€ annually
        incomePattern: {
          enabled: true,
          type: 'quarterly',
          // Q1: Low, Q2: Medium, Q3: High, Q4: Medium
          quarterlyMultipliers: [0.8, 1.0, 1.3, 0.9],
          description: 'Quarterly business cycle',
        },
      }

      const startEnd: [number, number] = [2025, 2080]
      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.monthly)

      expect(elements).toHaveLength(12)

      const baseMonthly = 2000 // 24000/12

      // Q1 (Jan-Mar): 0.8 multiplier
      for (let i = 0; i < 3; i++) {
        expect(elements[i].einzahlung).toBeCloseTo(baseMonthly * 0.8, 2)
      }

      // Q2 (Apr-Jun): 1.0 multiplier
      for (let i = 3; i < 6; i++) {
        expect(elements[i].einzahlung).toBeCloseTo(baseMonthly * 1.0, 2)
      }

      // Q3 (Jul-Sep): 1.3 multiplier
      for (let i = 6; i < 9; i++) {
        expect(elements[i].einzahlung).toBeCloseTo(baseMonthly * 1.3, 2)
      }

      // Q4 (Oct-Dec): 0.9 multiplier
      for (let i = 9; i < 12; i++) {
        expect(elements[i].einzahlung).toBeCloseTo(baseMonthly * 0.9, 2)
      }

      // Total reflects the actual fluctuating income
      // (3*0.8 + 3*1.0 + 3*1.3 + 3*0.9) * 2000 = 12.0 * 2000 = 24,000€
      const total = elements.reduce((sum, el) => sum + el.einzahlung, 0)
      expect(total).toBeCloseTo(24000, 2)
    })

    test('should not apply income pattern when disabled', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-01-01'),
        end: new Date('2025-12-31'),
        einzahlung: 24000,
        incomePattern: {
          enabled: false, // Pattern is disabled
          type: 'monthly',
          monthlyMultipliers: [1.5, 1.5, 1.5, 1.5, 0.5, 0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0],
        },
      }

      const startEnd: [number, number] = [2025, 2080]
      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.monthly)

      expect(elements).toHaveLength(12)

      const baseMonthly = 2000

      // All months should have the same base amount (pattern disabled)
      elements.forEach(el => {
        expect(el.einzahlung).toBeCloseTo(baseMonthly, 2)
      })
    })

    test('should handle income pattern with yearly simulation (pattern not applied)', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-01-01'),
        end: new Date('2027-12-31'),
        einzahlung: 24000,
        incomePattern: {
          enabled: true,
          type: 'monthly',
          monthlyMultipliers: [1.5, 1.5, 1.5, 1.5, 0.5, 0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0],
        },
      }

      const startEnd: [number, number] = [2027, 2080]
      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.yearly)

      // Should create yearly elements (pattern only applies to monthly)
      expect(elements).toHaveLength(3)

      // Each year should have the full annual amount
      elements.forEach(el => {
        expect(el.einzahlung).toBeCloseTo(24000, 2)
      })
    })

    test('should handle missing multipliers gracefully (use 1.0 as default)', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-01-01'),
        end: new Date('2025-12-31'),
        einzahlung: 24000,
        incomePattern: {
          enabled: true,
          type: 'monthly',
          // Missing multipliers - should default to 1.0
        },
      }

      const startEnd: [number, number] = [2025, 2080]
      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.monthly)

      expect(elements).toHaveLength(12)

      const baseMonthly = 2000

      // All months should use default multiplier of 1.0
      elements.forEach(el => {
        expect(el.einzahlung).toBeCloseTo(baseMonthly, 2)
      })
    })

    test('should handle income pattern across multiple years', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-01-01'),
        end: new Date('2026-12-31'),
        einzahlung: 24000,
        incomePattern: {
          enabled: true,
          type: 'quarterly',
          quarterlyMultipliers: [1.2, 1.0, 0.8, 1.0],
        },
      }

      const startEnd: [number, number] = [2026, 2080]
      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.monthly)

      // Should create 24 monthly elements (2 years * 12 months)
      expect(elements).toHaveLength(24)

      const baseMonthly = 2000

      // Verify pattern repeats correctly in both years
      // 2025 Q1
      expect(elements[0].einzahlung).toBeCloseTo(baseMonthly * 1.2, 2)
      expect(elements[1].einzahlung).toBeCloseTo(baseMonthly * 1.2, 2)

      // 2026 Q1 (should repeat same pattern)
      expect(elements[12].einzahlung).toBeCloseTo(baseMonthly * 1.2, 2)
      expect(elements[13].einzahlung).toBeCloseTo(baseMonthly * 1.2, 2)
    })

    test('should combine income pattern with partial year calculation', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-06-01'), // Starts mid-year
        end: new Date('2025-12-31'),
        einzahlung: 24000, // Annual amount
        incomePattern: {
          enabled: true,
          type: 'monthly',
          monthlyMultipliers: [1.0, 1.0, 1.0, 1.0, 1.0, 1.5, 1.5, 1.5, 1.0, 1.0, 0.5, 0.5],
        },
      }

      const startEnd: [number, number] = [2025, 2080]
      const elements = convertSparplanToElements([sparplan], startEnd, SimulationAnnual.monthly)

      // Should only create elements from June (month 5) to December (month 11) = 7 months
      expect(elements).toHaveLength(7)

      const baseMonthly = 2000

      // June (index 5): 1.5 multiplier
      expect(elements[0].einzahlung).toBeCloseTo(baseMonthly * 1.5, 2)
      // July (index 6): 1.5 multiplier
      expect(elements[1].einzahlung).toBeCloseTo(baseMonthly * 1.5, 2)
      // November (index 10): 0.5 multiplier
      expect(elements[5].einzahlung).toBeCloseTo(baseMonthly * 0.5, 2)
      // December (index 11): 0.5 multiplier
      expect(elements[6].einzahlung).toBeCloseTo(baseMonthly * 0.5, 2)
    })
  })
})
