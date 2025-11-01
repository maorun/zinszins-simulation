import { describe, test, expect } from 'vitest'
import { getRiskConfig, getPhaseTitle } from './risk-assessment-helpers'

describe('risk-assessment-helpers', () => {
  describe('getRiskConfig', () => {
    test('returns provided config when config is defined', () => {
      const customConfig = {
        averageReturn: 0.08,
        standardDeviation: 0.15,
        seed: 54321,
      }

      const result = getRiskConfig('savings', customConfig, 7, 12, 12345)

      expect(result).toBe(customConfig)
    })

    test('returns default config for savings phase when config is undefined', () => {
      const result = getRiskConfig('savings', undefined, 7, 12, 12345)

      expect(result).toEqual({
        averageReturn: 0.07,
        standardDeviation: 0.12,
        seed: 12345,
      })
    })

    test('returns default config for withdrawal phase when config is undefined', () => {
      const result = getRiskConfig('withdrawal', undefined, 7, 12, 12345)

      expect(result).toEqual({
        averageReturn: 0.05,
        standardDeviation: 0.12,
        seed: 12345,
      })
    })

    test('converts percentage values correctly for savings phase', () => {
      const result = getRiskConfig('savings', undefined, 10, 20, 99999)

      expect(result.averageReturn).toBe(0.10)
      expect(result.standardDeviation).toBe(0.20)
      expect(result.seed).toBe(99999)
    })
  })

  describe('getPhaseTitle', () => {
    test('returns correct title for savings phase', () => {
      expect(getPhaseTitle('savings')).toBe('Ansparphase')
    })

    test('returns correct title for withdrawal phase', () => {
      expect(getPhaseTitle('withdrawal')).toBe('Entnahmephase')
    })
  })
})
