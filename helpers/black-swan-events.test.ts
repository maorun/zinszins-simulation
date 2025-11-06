import { describe, it, expect } from 'vitest'
import {
  BLACK_SWAN_EVENTS,
  applyBlackSwanEvent,
  calculateCumulativeImpact,
  mergeBlackSwanReturns,
  getAvailableBlackSwanEvents,
  getBlackSwanEvent,
} from './black-swan-events'

describe('Black Swan Events', () => {
  describe('BLACK_SWAN_EVENTS', () => {
    it('should have all predefined events', () => {
      expect(BLACK_SWAN_EVENTS['dotcom-crash-2000']).toBeDefined()
      expect(BLACK_SWAN_EVENTS['financial-crisis-2008']).toBeDefined()
      expect(BLACK_SWAN_EVENTS['covid-crash-2020']).toBeDefined()
      expect(BLACK_SWAN_EVENTS.custom).toBeDefined()
    })

    it('should have correct dotcom crash data', () => {
      const event = BLACK_SWAN_EVENTS['dotcom-crash-2000']
      expect(event.name).toBe('Dotcom-Blase (2000-2003)')
      expect(event.startYear).toBe(2000)
      expect(event.duration).toBe(3)
      expect(event.yearlyReturns[0]).toBe(-0.09)
      expect(event.yearlyReturns[1]).toBe(-0.19)
      expect(event.yearlyReturns[2]).toBe(-0.44)
      expect(event.recoveryYears).toBe(5)
    })

    it('should have correct financial crisis data', () => {
      const event = BLACK_SWAN_EVENTS['financial-crisis-2008']
      expect(event.name).toBe('Finanzkrise (2008-2009)')
      expect(event.startYear).toBe(2008)
      expect(event.duration).toBe(2)
      expect(event.yearlyReturns[0]).toBe(-0.4)
      expect(event.yearlyReturns[1]).toBe(-0.25)
      expect(event.recoveryYears).toBe(4)
    })

    it('should have correct COVID crash data', () => {
      const event = BLACK_SWAN_EVENTS['covid-crash-2020']
      expect(event.name).toBe('COVID-19 Pandemie (2020)')
      expect(event.startYear).toBe(2020)
      expect(event.duration).toBe(1)
      expect(event.yearlyReturns[0]).toBe(-0.08)
      expect(event.recoveryYears).toBe(1)
    })
  })

  describe('applyBlackSwanEvent', () => {
    it('should apply event to specified base year', () => {
      const event = BLACK_SWAN_EVENTS['financial-crisis-2008']
      const returns = applyBlackSwanEvent(2030, event)

      expect(returns[2030]).toBe(-0.4)
      expect(returns[2031]).toBe(-0.25)
      expect(Object.keys(returns)).toHaveLength(2)
    })

    it('should handle multi-year events correctly', () => {
      const event = BLACK_SWAN_EVENTS['dotcom-crash-2000']
      const returns = applyBlackSwanEvent(2025, event)

      expect(returns[2025]).toBe(-0.09)
      expect(returns[2026]).toBe(-0.19)
      expect(returns[2027]).toBe(-0.44)
      expect(Object.keys(returns)).toHaveLength(3)
    })

    it('should handle single-year events', () => {
      const event = BLACK_SWAN_EVENTS['covid-crash-2020']
      const returns = applyBlackSwanEvent(2035, event)

      expect(returns[2035]).toBe(-0.08)
      expect(Object.keys(returns)).toHaveLength(1)
    })

    it('should use fallback value for missing year data', () => {
      const customEvent = {
        ...BLACK_SWAN_EVENTS.custom,
        duration: 3,
        yearlyReturns: {
          0: -0.3,
          // Missing entries for years 1 and 2
        },
      }

      const returns = applyBlackSwanEvent(2040, customEvent)

      expect(returns[2040]).toBe(-0.3)
      expect(returns[2041]).toBe(-0.2) // Fallback
      expect(returns[2042]).toBe(-0.2) // Fallback
    })
  })

  describe('calculateCumulativeImpact', () => {
    it('should calculate cumulative impact for dotcom crash', () => {
      const event = BLACK_SWAN_EVENTS['dotcom-crash-2000']
      const impact = calculateCumulativeImpact(event)

      // (1 - 0.09) * (1 - 0.19) * (1 - 0.44) - 1
      // = 0.91 * 0.81 * 0.56 - 1
      expect(impact).toBeCloseTo(-0.587224, 3)
    })

    it('should calculate cumulative impact for financial crisis', () => {
      const event = BLACK_SWAN_EVENTS['financial-crisis-2008']
      const impact = calculateCumulativeImpact(event)

      // (1 - 0.40) * (1 - 0.25) - 1
      // = 0.60 * 0.75 - 1 = 0.45 - 1 = -0.55
      expect(impact).toBeCloseTo(-0.55, 4)
    })

    it('should calculate cumulative impact for COVID crash', () => {
      const event = BLACK_SWAN_EVENTS['covid-crash-2020']
      const impact = calculateCumulativeImpact(event)

      // (1 - 0.08) - 1 = 0.92 - 1 = -0.08
      expect(impact).toBeCloseTo(-0.08, 4)
    })

    it('should handle positive returns in calculation', () => {
      const customEvent = {
        ...BLACK_SWAN_EVENTS.custom,
        duration: 2,
        yearlyReturns: {
          0: -0.3,
          1: 0.2, // Recovery year
        },
      }

      const impact = calculateCumulativeImpact(customEvent)

      // (1 - 0.30) * (1 + 0.20) - 1
      // = 0.70 * 1.20 - 1 = 0.84 - 1 = -0.16
      expect(impact).toBeCloseTo(-0.16, 4)
    })
  })

  describe('mergeBlackSwanReturns', () => {
    it('should merge Black Swan returns with existing returns', () => {
      const existingReturns = {
        2030: 0.07,
        2031: 0.07,
        2032: 0.07,
        2033: 0.07,
      }

      const blackSwanReturns = {
        2031: -0.4,
        2032: -0.25,
      }

      const merged = mergeBlackSwanReturns(existingReturns, blackSwanReturns)

      expect(merged[2030]).toBe(0.07) // Unchanged
      expect(merged[2031]).toBe(-0.4) // Overridden
      expect(merged[2032]).toBe(-0.25) // Overridden
      expect(merged[2033]).toBe(0.07) // Unchanged
    })

    it('should preserve all existing returns when no overlap', () => {
      const existingReturns = {
        2025: 0.05,
        2026: 0.06,
      }

      const blackSwanReturns = {
        2030: -0.3,
      }

      const merged = mergeBlackSwanReturns(existingReturns, blackSwanReturns)

      expect(merged[2025]).toBe(0.05)
      expect(merged[2026]).toBe(0.06)
      expect(merged[2030]).toBe(-0.3)
      expect(Object.keys(merged)).toHaveLength(3)
    })

    it('should handle empty existing returns', () => {
      const existingReturns = {}
      const blackSwanReturns = {
        2030: -0.4,
        2031: -0.25,
      }

      const merged = mergeBlackSwanReturns(existingReturns, blackSwanReturns)

      expect(merged[2030]).toBe(-0.4)
      expect(merged[2031]).toBe(-0.25)
      expect(Object.keys(merged)).toHaveLength(2)
    })
  })

  describe('getAvailableBlackSwanEvents', () => {
    it('should return all predefined events except custom', () => {
      const events = getAvailableBlackSwanEvents()

      expect(events).toHaveLength(3)
      expect(events.some((e) => e.id === 'dotcom-crash-2000')).toBe(true)
      expect(events.some((e) => e.id === 'financial-crisis-2008')).toBe(true)
      expect(events.some((e) => e.id === 'covid-crash-2020')).toBe(true)
      expect(events.some((e) => e.id === 'custom')).toBe(false)
    })

    it('should return events with all required properties', () => {
      const events = getAvailableBlackSwanEvents()

      events.forEach((event) => {
        expect(event.id).toBeDefined()
        expect(event.name).toBeDefined()
        expect(event.description).toBeDefined()
        expect(event.startYear).toBeGreaterThan(1990)
        expect(event.duration).toBeGreaterThan(0)
        expect(event.yearlyReturns).toBeDefined()
        expect(Object.keys(event.yearlyReturns).length).toBeGreaterThan(0)
      })
    })
  })

  describe('getBlackSwanEvent', () => {
    it('should return event by ID', () => {
      const event = getBlackSwanEvent('financial-crisis-2008')

      expect(event).toBeDefined()
      expect(event?.id).toBe('financial-crisis-2008')
      expect(event?.name).toBe('Finanzkrise (2008-2009)')
    })

    it('should return undefined for non-existent ID', () => {
      const event = getBlackSwanEvent('non-existent' as any)

      expect(event).toBeUndefined()
    })

    it('should return custom event', () => {
      const event = getBlackSwanEvent('custom')

      expect(event).toBeDefined()
      expect(event?.id).toBe('custom')
      expect(event?.name).toBe('Benutzerdefiniertes Szenario')
    })
  })

  describe('Historical Accuracy', () => {
    it('should have realistic return values for all events', () => {
      const events = Object.values(BLACK_SWAN_EVENTS)

      events.forEach((event) => {
        Object.values(event.yearlyReturns).forEach((returnRate) => {
          // Returns should be between -50% and +50% (extreme but realistic)
          expect(returnRate).toBeGreaterThanOrEqual(-0.5)
          expect(returnRate).toBeLessThanOrEqual(0.5)
        })
      })
    })

    it('should have negative returns for crisis years', () => {
      const dotcom = BLACK_SWAN_EVENTS['dotcom-crash-2000']
      const financial = BLACK_SWAN_EVENTS['financial-crisis-2008']
      const covid = BLACK_SWAN_EVENTS['covid-crash-2020']

      // All crisis events should have at least one negative return year
      expect(Math.min(...Object.values(dotcom.yearlyReturns))).toBeLessThan(0)
      expect(Math.min(...Object.values(financial.yearlyReturns))).toBeLessThan(0)
      expect(Math.min(...Object.values(covid.yearlyReturns))).toBeLessThan(0)
    })
  })
})
