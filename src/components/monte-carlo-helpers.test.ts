import { describe, it, expect } from 'vitest'
import {
  createScenarios,
  calculateBlackSwanScenario,
} from './monte-carlo-helpers'
import type { RandomReturnConfig } from '../utils/random-returns'
import { formatPercent } from '../utils/currency'

describe('monte-carlo-helpers', () => {
  describe('formatPercent', () => {
    it('formats decimal values as percentages', () => {
      expect(formatPercent(0.05)).toBe('5.0%')
      expect(formatPercent(0.123)).toBe('12.3%')
      expect(formatPercent(0.0789)).toBe('7.9%')
      expect(formatPercent(-0.05)).toBe('-5.0%')
    })
  })

  describe('createScenarios', () => {
    it('creates all five standard scenarios', () => {
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
      }

      const scenarios = createScenarios(config)

      expect(scenarios).toHaveLength(5)
      expect(scenarios[0].scenario).toBe('Worst Case (5% Perzentil)')
      expect(scenarios[1].scenario).toBe('Pessimistisches Szenario (25% Perzentil)')
      expect(scenarios[2].scenario).toBe('Median-Szenario (50% Perzentil)')
      expect(scenarios[3].scenario).toBe('Optimistisches Szenario (75% Perzentil)')
      expect(scenarios[4].scenario).toBe('Best Case (95% Perzentil)')
    })

    it('calculates correct expected returns for each scenario', () => {
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
      }

      const scenarios = createScenarios(config)

      expect(scenarios[0].description).toContain('-17.7%') // Worst case
      expect(scenarios[2].description).toContain('7.0%') // Median
      expect(scenarios[4].description).toContain('31.7%') // Best case
    })

    it('uses default standard deviation of 0.15 when not provided', () => {
      const config: RandomReturnConfig = {
        averageReturn: 0.05,
      }

      const scenarios = createScenarios(config)

      expect(scenarios[0].description).toContain('-19.7%') // 0.05 - 1.645 * 0.15
      expect(scenarios[4].description).toContain('29.7%') // 0.05 + 1.645 * 0.15
    })
  })

  describe('calculateBlackSwanScenario', () => {
    it('returns null when blackSwanReturns is null', () => {
      const result = calculateBlackSwanScenario(null, 'Test Event')
      expect(result).toBeNull()
    })

    it('returns null when blackSwanReturns is undefined', () => {
      const result = calculateBlackSwanScenario(undefined, 'Test Event')
      expect(result).toBeNull()
    })

    it('returns null when blackSwanReturns is empty', () => {
      const result = calculateBlackSwanScenario({}, 'Test Event')
      expect(result).toBeNull()
    })

    it('calculates cumulative return for single year', () => {
      const blackSwanReturns = { 2020: -0.3 }
      const result = calculateBlackSwanScenario(blackSwanReturns, 'COVID-19 Crash')

      expect(result).not.toBeNull()
      expect(result?.scenario).toBe('🦢 Black Swan: COVID-19 Crash')
      expect(result?.description).toContain('1 Jahr')
      expect(result?.description).toContain('2020')
      expect(result?.description).toContain('-30.0%')
      expect(result?.isBlackSwan).toBe(true)
    })

    it('calculates cumulative return for multiple years', () => {
      const blackSwanReturns = {
        2000: -0.1,
        2001: -0.15,
        2002: -0.2,
      }
      const result = calculateBlackSwanScenario(blackSwanReturns, 'Dotcom Crash')

      expect(result).not.toBeNull()
      expect(result?.scenario).toBe('🦢 Black Swan: Dotcom Crash')
      expect(result?.description).toContain('3 Jahre')
      expect(result?.description).toContain('2000-2002')
      // Cumulative: (1 - 0.1) * (1 - 0.15) * (1 - 0.2) - 1 = 0.9 * 0.85 * 0.8 - 1 = -0.388
      expect(result?.description).toContain('-38.8%')
      expect(result?.probability).toBe('Historisches Extremszenario zur Stresstestung')
    })

    it('uses default event name when not provided', () => {
      const blackSwanReturns = { 2020: -0.25 }
      const result = calculateBlackSwanScenario(blackSwanReturns, undefined)

      expect(result).not.toBeNull()
      expect(result?.scenario).toBe('🦢 Black Swan: Krisenszenario')
    })

    it('correctly handles positive returns in Black Swan scenario', () => {
      const blackSwanReturns = {
        2020: -0.3,
        2021: 0.5, // Recovery year
      }
      const result = calculateBlackSwanScenario(blackSwanReturns, 'V-shaped Recovery')

      expect(result).not.toBeNull()
      // Cumulative: (1 - 0.3) * (1 + 0.5) - 1 = 0.7 * 1.5 - 1 = 0.05
      expect(result?.description).toContain('5.0%')
    })
  })
})
