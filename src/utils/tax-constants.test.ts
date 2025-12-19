import { describe, it, expect } from 'vitest'
import { FREIBETRAG_CONSTANTS, getFreibetragForPlanningMode, isStandardFreibetragValue } from './tax-constants'

describe('tax-constants', () => {
  describe('FREIBETRAG_CONSTANTS', () => {
    it('should define individual Freibetrag as 2000€', () => {
      expect(FREIBETRAG_CONSTANTS.INDIVIDUAL).toBe(2000)
    })

    it('should define couple Freibetrag as 4000€', () => {
      expect(FREIBETRAG_CONSTANTS.COUPLE).toBe(4000)
    })

    it('should define legacy individual Freibetrag as 1000€', () => {
      expect(FREIBETRAG_CONSTANTS.LEGACY_INDIVIDUAL).toBe(1000)
    })

    it('should define legacy couple Freibetrag as 2000€', () => {
      expect(FREIBETRAG_CONSTANTS.LEGACY_COUPLE).toBe(2000)
    })

    it('should have couple amount exactly double the individual amount', () => {
      expect(FREIBETRAG_CONSTANTS.COUPLE).toBe(FREIBETRAG_CONSTANTS.INDIVIDUAL * 2)
    })

    it('should have legacy couple amount exactly double the legacy individual amount', () => {
      expect(FREIBETRAG_CONSTANTS.LEGACY_COUPLE).toBe(FREIBETRAG_CONSTANTS.LEGACY_INDIVIDUAL * 2)
    })
  })

  describe('getFreibetragForPlanningMode', () => {
    it('should return individual Freibetrag for individual planning mode', () => {
      expect(getFreibetragForPlanningMode('individual')).toBe(2000)
    })

    it('should return couple Freibetrag for couple planning mode', () => {
      expect(getFreibetragForPlanningMode('couple')).toBe(4000)
    })

    it('should return couple amount that is double the individual amount', () => {
      const individual = getFreibetragForPlanningMode('individual')
      const couple = getFreibetragForPlanningMode('couple')
      expect(couple).toBe(individual * 2)
    })
  })

  describe('isStandardFreibetragValue', () => {
    it('should return true for individual Freibetrag (2000)', () => {
      expect(isStandardFreibetragValue(2000)).toBe(true)
    })

    it('should return true for couple Freibetrag (4000)', () => {
      expect(isStandardFreibetragValue(4000)).toBe(true)
    })

    it('should return true for legacy individual Freibetrag (1000)', () => {
      expect(isStandardFreibetragValue(1000)).toBe(true)
    })

    it('should return true for legacy couple Freibetrag (2000)', () => {
      expect(isStandardFreibetragValue(2000)).toBe(true)
    })

    it('should return false for custom amounts', () => {
      expect(isStandardFreibetragValue(1500)).toBe(false)
      expect(isStandardFreibetragValue(3000)).toBe(false)
      expect(isStandardFreibetragValue(5000)).toBe(false)
    })

    it('should return false for zero', () => {
      expect(isStandardFreibetragValue(0)).toBe(false)
    })

    it('should return false for negative amounts', () => {
      expect(isStandardFreibetragValue(-1000)).toBe(false)
    })
  })

  describe('constants immutability', () => {
    it('should have all constants as const values', () => {
      // TypeScript enforces immutability via "as const"
      expect(FREIBETRAG_CONSTANTS.INDIVIDUAL).toBe(2000)
      expect(FREIBETRAG_CONSTANTS.COUPLE).toBe(4000)
      expect(FREIBETRAG_CONSTANTS.LEGACY_INDIVIDUAL).toBe(1000)
      expect(FREIBETRAG_CONSTANTS.LEGACY_COUPLE).toBe(2000)
    })
  })
})
