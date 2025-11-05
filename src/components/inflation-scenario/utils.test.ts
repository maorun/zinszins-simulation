import { describe, it, expect } from 'vitest'
import { formatPercent, getScenarioColors } from './utils'
import type { InflationScenario } from '../../../helpers/inflation-scenarios'

describe('utils', () => {
  describe('formatPercent', () => {
    it('should format positive values with + sign', () => {
      expect(formatPercent(0.05)).toBe('+5.0%')
      expect(formatPercent(0.123)).toBe('+12.3%')
    })

    it('should format negative values with - sign', () => {
      expect(formatPercent(-0.05)).toBe('-5.0%')
      expect(formatPercent(-0.123)).toBe('-12.3%')
    })

    it('should format zero without sign', () => {
      expect(formatPercent(0)).toBe('+0.0%')
    })
  })

  describe('getScenarioColors', () => {
    it('should return red colors for hyperinflation', () => {
      const scenario: InflationScenario = {
        id: 'hyperinflation',
        name: 'Test',
        description: 'Test',
        startYear: 0,
        duration: 1,
        yearlyInflationRates: {},
      }

      const colors = getScenarioColors(scenario)
      expect(colors.bg).toBe('bg-red-50 border-red-200')
      expect(colors.text).toBe('text-red-900')
    })

    it('should return blue colors for deflation', () => {
      const scenario: InflationScenario = {
        id: 'deflation',
        name: 'Test',
        description: 'Test',
        startYear: 0,
        duration: 1,
        yearlyInflationRates: {},
      }

      const colors = getScenarioColors(scenario)
      expect(colors.bg).toBe('bg-blue-50 border-blue-200')
      expect(colors.text).toBe('text-blue-900')
    })

    it('should return default colors for other scenarios', () => {
      const scenario: InflationScenario = {
        id: 'stagflation' as any,
        name: 'Test',
        description: 'Test',
        startYear: 0,
        duration: 1,
        yearlyInflationRates: {},
      }

      const colors = getScenarioColors(scenario)
      expect(colors.bg).toBe('bg-orange-50 border-orange-200')
      expect(colors.text).toBe('text-orange-900')
    })

    it('should return default colors for null scenario', () => {
      const colors = getScenarioColors(null)
      expect(colors.bg).toBe('bg-orange-50 border-orange-200')
      expect(colors.text).toBe('text-orange-900')
    })
  })
})
