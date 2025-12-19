import { describe, it, expect } from 'vitest'
import {
  DEFAULT_LOCALE,
  DEFAULT_CURRENCY,
  CURRENCY_DECIMAL_PLACES,
  CURRENCY_WHOLE_DECIMAL_PLACES,
  PERCENTAGE_DECIMAL_PLACES,
  PERCENTAGE_COMPACT_DECIMAL_PLACES,
  CURRENCY_FORMAT_THRESHOLDS,
} from './locale-constants'

describe('locale-constants', () => {
  describe('DEFAULT_LOCALE', () => {
    it('should be German locale', () => {
      expect(DEFAULT_LOCALE).toBe('de-DE')
    })

    it('should be a const value', () => {
      // TypeScript ensures this is readonly, but we can verify the value exists
      expect(typeof DEFAULT_LOCALE).toBe('string')
    })
  })

  describe('DEFAULT_CURRENCY', () => {
    it('should be EUR', () => {
      expect(DEFAULT_CURRENCY).toBe('EUR')
    })

    it('should be a const value', () => {
      expect(typeof DEFAULT_CURRENCY).toBe('string')
    })
  })

  describe('CURRENCY_DECIMAL_PLACES', () => {
    it('should be 2 decimal places for standard currency formatting', () => {
      expect(CURRENCY_DECIMAL_PLACES).toBe(2)
    })
  })

  describe('CURRENCY_WHOLE_DECIMAL_PLACES', () => {
    it('should be 0 decimal places for whole currency amounts', () => {
      expect(CURRENCY_WHOLE_DECIMAL_PLACES).toBe(0)
    })
  })

  describe('PERCENTAGE_DECIMAL_PLACES', () => {
    it('should be 2 decimal places for standard percentage formatting', () => {
      expect(PERCENTAGE_DECIMAL_PLACES).toBe(2)
    })
  })

  describe('PERCENTAGE_COMPACT_DECIMAL_PLACES', () => {
    it('should be 1 decimal place for compact percentage formatting', () => {
      expect(PERCENTAGE_COMPACT_DECIMAL_PLACES).toBe(1)
    })
  })

  describe('CURRENCY_FORMAT_THRESHOLDS', () => {
    it('should define million threshold as 1,000,000', () => {
      expect(CURRENCY_FORMAT_THRESHOLDS.MILLION).toBe(1_000_000)
    })

    it('should define thousand threshold as 1,000', () => {
      expect(CURRENCY_FORMAT_THRESHOLDS.THOUSAND).toBe(1_000)
    })

    it('should define million decimal places as 1', () => {
      expect(CURRENCY_FORMAT_THRESHOLDS.MILLION_DECIMAL_PLACES).toBe(1)
    })

    it('should define thousand decimal places as 0', () => {
      expect(CURRENCY_FORMAT_THRESHOLDS.THOUSAND_DECIMAL_PLACES).toBe(0)
    })

    it('should have million threshold greater than thousand threshold', () => {
      expect(CURRENCY_FORMAT_THRESHOLDS.MILLION).toBeGreaterThan(CURRENCY_FORMAT_THRESHOLDS.THOUSAND)
    })
  })

  describe('constants immutability', () => {
    it('should have all constants as const values', () => {
      // This is a compile-time check enforced by TypeScript's "as const"
      // We verify the values exist and are of expected types
      expect(DEFAULT_LOCALE).toEqual('de-DE')
      expect(DEFAULT_CURRENCY).toEqual('EUR')
      expect(CURRENCY_DECIMAL_PLACES).toEqual(2)
      expect(CURRENCY_WHOLE_DECIMAL_PLACES).toEqual(0)
      expect(PERCENTAGE_DECIMAL_PLACES).toEqual(2)
      expect(PERCENTAGE_COMPACT_DECIMAL_PLACES).toEqual(1)
      expect(CURRENCY_FORMAT_THRESHOLDS.MILLION).toEqual(1_000_000)
      expect(CURRENCY_FORMAT_THRESHOLDS.THOUSAND).toEqual(1_000)
    })
  })
})
