import { describe, it, expect } from 'vitest'
import { isSubmitDisabled, getSubmitButtonText } from './event-form-utils'
import { createMockEventFormValues } from './test-utils'

describe('event-form-utils', () => {
  describe('isSubmitDisabled', () => {
    describe('inheritance events', () => {
      it('should be disabled when grossAmount is empty', () => {
        const formValues = createMockEventFormValues({
          eventType: 'inheritance',
          grossAmount: '',
        })
        
        expect(isSubmitDisabled(formValues)).toBe(true)
      })

      it('should be enabled when grossAmount is provided', () => {
        const formValues = createMockEventFormValues({
          eventType: 'inheritance',
          grossAmount: '100000',
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should be enabled when grossAmount is zero', () => {
        const formValues = createMockEventFormValues({
          eventType: 'inheritance',
          grossAmount: '0',
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should be enabled when grossAmount is negative', () => {
        const formValues = createMockEventFormValues({
          eventType: 'inheritance',
          grossAmount: '-5000',
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })
    })

    describe('expense events', () => {
      it('should be disabled when expenseAmount is empty', () => {
        const formValues = createMockEventFormValues({
          eventType: 'expense',
          expenseAmount: '',
        })
        
        expect(isSubmitDisabled(formValues)).toBe(true)
      })

      it('should be enabled when expenseAmount is provided', () => {
        const formValues = createMockEventFormValues({
          eventType: 'expense',
          expenseAmount: '5000',
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should be enabled when expenseAmount is zero', () => {
        const formValues = createMockEventFormValues({
          eventType: 'expense',
          expenseAmount: '0',
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should be enabled when expenseAmount is negative', () => {
        const formValues = createMockEventFormValues({
          eventType: 'expense',
          expenseAmount: '-1000',
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })
    })

    describe('care_costs events', () => {
      it('should be disabled when careLevel is not set (undefined)', () => {
        const formValues = createMockEventFormValues({
          eventType: 'care_costs',
          careLevel: undefined,
        })
        
        expect(isSubmitDisabled(formValues)).toBe(true)
      })

      it('should be disabled when careLevel is null', () => {
        const formValues = createMockEventFormValues({
          eventType: 'care_costs',
        })
        // Delete careLevel to test validation
        delete (formValues as any).careLevel
        
        expect(isSubmitDisabled(formValues)).toBe(true)
      })

      it('should be enabled when careLevel is 1', () => {
        const formValues = createMockEventFormValues({
          eventType: 'care_costs',
          careLevel: 1,
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should be enabled when careLevel is 2', () => {
        const formValues = createMockEventFormValues({
          eventType: 'care_costs',
          careLevel: 2,
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should be enabled when careLevel is 3', () => {
        const formValues = createMockEventFormValues({
          eventType: 'care_costs',
          careLevel: 3,
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should be enabled when careLevel is 4', () => {
        const formValues = createMockEventFormValues({
          eventType: 'care_costs',
          careLevel: 4,
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should be enabled when careLevel is 5', () => {
        const formValues = createMockEventFormValues({
          eventType: 'care_costs',
          careLevel: 5,
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should be disabled when careLevel is invalid (0)', () => {
        const formValues = createMockEventFormValues({
          eventType: 'care_costs',
        })
        // Set careLevel to invalid value
        ;(formValues as any).careLevel = 0
        
        expect(isSubmitDisabled(formValues)).toBe(true)
      })
    })

    describe('other/unknown event types', () => {
      it('should always be enabled for unknown event types', () => {
        const formValues = createMockEventFormValues({
          eventType: 'unknown' as any,
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })

      it('should handle empty string event type', () => {
        const formValues = createMockEventFormValues({
          eventType: '' as any,
        })
        
        expect(isSubmitDisabled(formValues)).toBe(false)
      })
    })
  })

  describe('getSubmitButtonText', () => {
    it('should return correct text for inheritance event', () => {
      expect(getSubmitButtonText('inheritance')).toBe('💰 Erbschaft hinzufügen')
    })

    it('should return correct text for expense event', () => {
      expect(getSubmitButtonText('expense')).toBe('💸 Ausgabe hinzufügen')
    })

    it('should return correct text for care_costs event', () => {
      expect(getSubmitButtonText('care_costs')).toBe('🏥 Pflegekosten hinzufügen')
    })

    it('should return default text for unknown event type', () => {
      expect(getSubmitButtonText('unknown' as any)).toBe('Hinzufügen')
    })

    it('should return default text for empty string event type', () => {
      expect(getSubmitButtonText('' as any)).toBe('Hinzufügen')
    })

    it('should return default text for null event type', () => {
      expect(getSubmitButtonText(null as any)).toBe('Hinzufügen')
    })

    it('should return default text for undefined event type', () => {
      expect(getSubmitButtonText(undefined as any)).toBe('Hinzufügen')
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete inheritance event form', () => {
      const formValues = createMockEventFormValues({
        eventType: 'inheritance',
        grossAmount: '50000',
        relationshipType: 'child',
        phase: 'sparphase',
      })
      
      expect(isSubmitDisabled(formValues)).toBe(false)
      expect(getSubmitButtonText(formValues.eventType)).toBe('💰 Erbschaft hinzufügen')
    })

    it('should handle complete expense event form', () => {
      const formValues = createMockEventFormValues({
        eventType: 'expense',
        expenseAmount: '25000',
        expenseType: 'car',
        phase: 'sparphase',
      })
      
      expect(isSubmitDisabled(formValues)).toBe(false)
      expect(getSubmitButtonText(formValues.eventType)).toBe('💸 Ausgabe hinzufügen')
    })

    it('should handle complete care_costs event form', () => {
      const formValues = createMockEventFormValues({
        eventType: 'care_costs',
        careLevel: 3,
        careDurationYears: '5',
        careInflationRate: '3',
      })
      
      expect(isSubmitDisabled(formValues)).toBe(false)
      expect(getSubmitButtonText(formValues.eventType)).toBe('🏥 Pflegekosten hinzufügen')
    })

    it('should handle incomplete forms correctly', () => {
      const incompleteInheritance = createMockEventFormValues({
        eventType: 'inheritance',
        grossAmount: '',
      })
      expect(isSubmitDisabled(incompleteInheritance)).toBe(true)
      
      const incompleteExpense = createMockEventFormValues({
        eventType: 'expense',
        expenseAmount: '',
      })
      expect(isSubmitDisabled(incompleteExpense)).toBe(true)
      
      const incompleteCare = createMockEventFormValues({
        eventType: 'care_costs',
      })
      ;(incompleteCare as any).careLevel = 0
      expect(isSubmitDisabled(incompleteCare)).toBe(true)
    })
  })
})
