import { describe, it, expect } from 'vitest'
import {
  formatDateForInput,
  isSinglePaymentSparplan,
  isEditingSparplan,
  isEditingSinglePayment,
} from './SparplanEingabe.utils'
import type { Sparplan } from '../utils/sparplan-utils'

describe('SparplanEingabe Utils', () => {
  describe('formatDateForInput', () => {
    it('should format date to YYYY-MM-DD format', () => {
      const date = new Date('2024-06-15')
      expect(formatDateForInput(date, 'yyyy-MM-dd')).toBe('2024-06-15')
    })

    it('should format date to YYYY-MM format', () => {
      const date = new Date('2024-06-15')
      expect(formatDateForInput(date, 'yyyy-MM')).toBe('2024-06')
    })

    it('should handle null date', () => {
      expect(formatDateForInput(null, 'yyyy-MM-dd')).toBe('')
    })

    it('should handle invalid date', () => {
      expect(formatDateForInput('invalid', 'yyyy-MM-dd')).toBe('')
    })
  })

  describe('isSinglePaymentSparplan', () => {
    it('should return true for single payment (same start and end date)', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-06-15'),
        end: new Date('2024-06-15'),
        einzahlung: 5000,
      }
      expect(isSinglePaymentSparplan(sparplan)).toBe(true)
    })

    it('should return false for regular sparplan (different dates)', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: new Date('2030-12-31'),
        einzahlung: 24000,
      }
      expect(isSinglePaymentSparplan(sparplan)).toBe(false)
    })

    it('should return false when end date is null', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 24000,
      }
      expect(isSinglePaymentSparplan(sparplan)).toBe(false)
    })
  })

  describe('isEditingSparplan', () => {
    it('should return false when editingSparplan is null', () => {
      expect(isEditingSparplan(null)).toBe(false)
    })

    it('should return true when editing a regular sparplan', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: new Date('2030-12-31'),
        einzahlung: 24000,
      }
      expect(isEditingSparplan(sparplan)).toBe(true)
    })

    it('should return false when editing a single payment', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-06-15'),
        end: new Date('2024-06-15'),
        einzahlung: 5000,
      }
      expect(isEditingSparplan(sparplan)).toBe(false)
    })
  })

  describe('isEditingSinglePayment', () => {
    it('should return false when editingSparplan is null', () => {
      expect(isEditingSinglePayment(null)).toBe(false)
    })

    it('should return true when editing a single payment', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-06-15'),
        end: new Date('2024-06-15'),
        einzahlung: 5000,
      }
      expect(isEditingSinglePayment(sparplan)).toBe(true)
    })

    it('should return false when editing a regular sparplan', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: new Date('2030-12-31'),
        einzahlung: 24000,
      }
      expect(isEditingSinglePayment(sparplan)).toBe(false)
    })
  })
})
