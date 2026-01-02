import type { EventFormValues } from './EventFormFields'

/**
 * Create a mock EventFormValues object with all required fields
 * This helper ensures all tests use consistent mock data
 */
export function createMockEventFormValues(overrides?: Partial<EventFormValues>): EventFormValues {
  return {
    date: new Date('2024-01-01'),
    eventType: 'inheritance',
    phase: 'sparphase',
    relationshipType: 'child',
    grossAmount: '',
    expenseType: 'car',
    expenseAmount: '',
    useCredit: false,
    interestRate: '',
    termYears: '',
    careLevel: 2,
    customMonthlyCosts: '',
    careDurationYears: '',
    careInflationRate: '3',
    description: '',
    ...overrides,
  }
}
