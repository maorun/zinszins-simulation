import { describe, it, expect } from 'vitest'
import {
  createNewSparplan,
  createNewSinglePayment,
  isEinmalzahlung,
  updateExistingSparplan,
  getInitialSingleFormValue,
  getInitialSparplanFormValue,
  populateSingleFormFromSparplan,
  populateSparplanFormFromSparplan,
} from './SparplanEingabe.helpers'
import { SimulationAnnual } from '../utils/simulate'
import type { Sparplan } from '../utils/sparplan-utils'

describe('SparplanEingabe.helpers', () => {
  describe('createNewSparplan', () => {
    it('should create a new sparplan with yearly simulation', () => {
      const formValues = {
        start: new Date('2024-01-01'),
        end: new Date('2030-12-31'),
        einzahlung: '1000',
        ter: '0.5',
        transactionCostPercent: '0.25',
        transactionCostAbsolute: '1.5',
      }

      const result = createNewSparplan({
        formValues,
        simulationAnnual: SimulationAnnual.yearly,
        existingSparplans: [],
      })

      expect(result).toHaveLength(1)
      expect(result[0].einzahlung).toBe(1000)
      expect(result[0].ter).toBe(0.5)
      expect(result[0].transactionCostPercent).toBe(0.25)
      expect(result[0].transactionCostAbsolute).toBe(1.5)
    })

    it('should convert monthly to yearly amount', () => {
      const formValues = {
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: '100',
        ter: '',
        transactionCostPercent: '',
        transactionCostAbsolute: '',
      }

      const result = createNewSparplan({
        formValues,
        simulationAnnual: SimulationAnnual.monthly,
        existingSparplans: [],
      })

      expect(result[0].einzahlung).toBe(1200) // 100 * 12
    })

    it('should append to existing sparplans', () => {
      const existing: Sparplan[] = [
        { id: 1, start: new Date('2023-01-01'), end: null, einzahlung: 500 },
      ]

      const formValues = {
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: '200',
        ter: '',
        transactionCostPercent: '',
        transactionCostAbsolute: '',
      }

      const result = createNewSparplan({
        formValues,
        simulationAnnual: SimulationAnnual.yearly,
        existingSparplans: existing,
      })

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].einzahlung).toBe(200)
    })
  })

  describe('createNewSinglePayment', () => {
    it('should create a single payment with same start and end date', () => {
      const formValues = {
        date: new Date('2024-06-15'),
        einzahlung: '5000',
        ter: '0.75',
        transactionCostPercent: '',
        transactionCostAbsolute: '2',
      }

      const result = createNewSinglePayment({
        formValues,
        existingSparplans: [],
      })

      expect(result).toHaveLength(1)
      expect(result[0].start).toEqual(formValues.date)
      expect(result[0].end).toEqual(formValues.date)
      expect(result[0].einzahlung).toBe(5000)
      expect(result[0].ter).toBe(0.75)
      expect(result[0].transactionCostAbsolute).toBe(2)
    })
  })

  describe('isEinmalzahlung', () => {
    it('should return true for single payment', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: new Date('2024-01-01'),
        einzahlung: 1000,
      }

      expect(isEinmalzahlung(sparplan)).toBe(true)
    })

    it('should return false for recurring sparplan', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: new Date('2030-12-31'),
        einzahlung: 1000,
      }

      expect(isEinmalzahlung(sparplan)).toBe(false)
    })

    it('should return false when end is null', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 1000,
      }

      expect(isEinmalzahlung(sparplan)).toBe(false)
    })
  })

  describe('updateExistingSparplan', () => {
    it('should update a single payment', () => {
      const editingSparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: new Date('2024-01-01'),
        einzahlung: 1000,
      }

      const singleFormValues = {
        date: new Date('2024-06-15'),
        einzahlung: '2000',
        ter: '0.5',
        transactionCostPercent: '',
        transactionCostAbsolute: '',
      }

      const result = updateExistingSparplan({
        editingSparplan,
        sparplanFormValues: getInitialSparplanFormValue(),
        singleFormValues,
        simulationAnnual: SimulationAnnual.yearly,
        existingSparplans: [editingSparplan],
      })

      expect(result[0].id).toBe(1)
      expect(result[0].einzahlung).toBe(2000)
      expect(result[0].start).toEqual(new Date('2024-06-15'))
    })

    it('should update a recurring sparplan with yearly values', () => {
      const editingSparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: new Date('2030-12-31'),
        einzahlung: 1000,
      }

      const sparplanFormValues = {
        start: new Date('2025-01-01'),
        end: new Date('2035-12-31'),
        einzahlung: '1500',
        ter: '',
        transactionCostPercent: '',
        transactionCostAbsolute: '',
      }

      const result = updateExistingSparplan({
        editingSparplan,
        sparplanFormValues,
        singleFormValues: getInitialSingleFormValue(),
        simulationAnnual: SimulationAnnual.yearly,
        existingSparplans: [editingSparplan],
      })

      expect(result[0].einzahlung).toBe(1500)
      expect(result[0].start).toEqual(new Date('2025-01-01'))
    })

    it('should convert monthly to yearly for sparplan update', () => {
      const editingSparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 1200,
      }

      const sparplanFormValues = {
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: '200', // monthly
        ter: '',
        transactionCostPercent: '',
        transactionCostAbsolute: '',
      }

      const result = updateExistingSparplan({
        editingSparplan,
        sparplanFormValues,
        singleFormValues: getInitialSingleFormValue(),
        simulationAnnual: SimulationAnnual.monthly,
        existingSparplans: [editingSparplan],
      })

      expect(result[0].einzahlung).toBe(2400) // 200 * 12
    })
  })

  describe('getInitialSingleFormValue', () => {
    it('should return initial empty form values', () => {
      const result = getInitialSingleFormValue()

      expect(result.einzahlung).toBe('')
      expect(result.ter).toBe('')
      expect(result.transactionCostPercent).toBe('')
      expect(result.transactionCostAbsolute).toBe('')
      expect(result.date).toBeInstanceOf(Date)
    })
  })

  describe('getInitialSparplanFormValue', () => {
    it('should return initial empty form values', () => {
      const result = getInitialSparplanFormValue()

      expect(result.einzahlung).toBe('')
      expect(result.end).toBeNull()
      expect(result.start).toBeInstanceOf(Date)
    })
  })

  describe('populateSingleFormFromSparplan', () => {
    it('should populate form with sparplan values', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-06-15'),
        end: new Date('2024-06-15'),
        einzahlung: 5000,
        ter: 0.75,
        transactionCostPercent: 0.25,
        transactionCostAbsolute: 1.5,
      }

      const result = populateSingleFormFromSparplan(sparplan)

      expect(result.einzahlung).toBe('5000')
      expect(result.ter).toBe('0.75')
      expect(result.transactionCostPercent).toBe('0.25')
      expect(result.transactionCostAbsolute).toBe('1.5')
    })
  })

  describe('populateSparplanFormFromSparplan', () => {
    it('should populate form with yearly values', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: new Date('2030-12-31'),
        einzahlung: 1200,
      }

      const result = populateSparplanFormFromSparplan(
        sparplan,
        SimulationAnnual.yearly,
      )

      expect(result.einzahlung).toBe('1200')
      expect(result.start).toEqual(new Date('2024-01-01'))
    })

    it('should convert yearly to monthly for display', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 1200,
      }

      const result = populateSparplanFormFromSparplan(
        sparplan,
        SimulationAnnual.monthly,
      )

      expect(result.einzahlung).toBe('100') // 1200 / 12
    })

    it('should not convert for one-time payments even in monthly mode', () => {
      const sparplan: Sparplan = {
        id: 1,
        start: new Date('2024-01-01'),
        end: new Date('2024-01-01'),
        einzahlung: 1200,
      }

      const result = populateSparplanFormFromSparplan(
        sparplan,
        SimulationAnnual.monthly,
      )

      expect(result.einzahlung).toBe('1200') // Not divided
    })
  })
})
