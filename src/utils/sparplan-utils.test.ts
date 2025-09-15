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
        einzahlung: 19800,
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

    test('should respect end date for monthly simulation', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2025-09-10'),
        end: new Date('2028-09-01'), // Should stop in September 2028
        einzahlung: 19800, // Annual amount
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
      elements.forEach((element) => {
        expect(element.einzahlung).toBeCloseTo(19800 / 12, 2)
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
          einzahlung: 19800,
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

      const elementsWithEnd = convertSparplanToElements(
        [sparplanWithEnd],
        [2040, 2080],
        SimulationAnnual.yearly,
      )

      // Should stop at 2028, not continue to 2040
      const yearsWithEnd = elementsWithEnd.map(el => new Date(el.start).getFullYear())
      expect(yearsWithEnd).not.toContain(2029)
      expect(yearsWithEnd).not.toContain(2040)
      expect(Math.max(...yearsWithEnd)).toBe(2028)
    })
  })
})
