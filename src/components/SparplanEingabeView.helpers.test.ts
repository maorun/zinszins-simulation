import { describe, test, expect, vi } from 'vitest'
import {
  getSparplanFormProps,
  getSinglePaymentFormProps,
  getSharedUtilitiesProps,
  getSavedSparplansListProps,
  computeViewProps,
  type SparplanEingabeViewProps,
} from './SparplanEingabeView.helpers'
import { SimulationAnnual } from '../utils/simulate'
import type { SparplanFormValue, SingleFormValue } from './SparplanEingabe.helpers'

describe('SparplanEingabeView.helpers', () => {
  describe('getSparplanFormProps', () => {
    test('should compute sparplan form props with edit mode active', () => {
      const setIsOpen = vi.fn()
      const setFormValues = vi.fn()
      const handleSubmit = vi.fn()
      const isEditingSparplan = vi.fn(() => true)
      const editingSparplan = { id: 1, start: new Date(), einzahlung: 100 } as any

      const props = getSparplanFormProps(
        true,
        setIsOpen,
        {} as SparplanFormValue,
        setFormValues,
        handleSubmit,
        true,
        editingSparplan,
        isEditingSparplan,
      )

      expect(props.isOpen).toBe(true)
      expect(props.isEditMode).toBe(true)
      expect(props.showCancelButton).toBe(true)
      expect(isEditingSparplan).toHaveBeenCalledWith(editingSparplan)
    })

    test('should compute sparplan form props without edit mode', () => {
      const isEditingSparplan = vi.fn(() => false)

      const props = getSparplanFormProps(
        false,
        vi.fn(),
        {} as SparplanFormValue,
        vi.fn(),
        vi.fn(),
        false,
        null,
        isEditingSparplan,
      )

      expect(props.isOpen).toBe(false)
      expect(props.isEditMode).toBe(false)
      expect(props.showCancelButton).toBe(false)
    })
  })

  describe('getSinglePaymentFormProps', () => {
    test('should compute single payment form props with edit mode active', () => {
      const isEditingSinglePayment = vi.fn(() => true)
      const editingSparplan = { id: 1, start: new Date(), einzahlung: 100 } as any

      const props = getSinglePaymentFormProps(
        true,
        vi.fn(),
        {} as SingleFormValue,
        vi.fn(),
        vi.fn(),
        true,
        editingSparplan,
        isEditingSinglePayment,
      )

      expect(props.isEditMode).toBe(true)
      expect(props.showCancelButton).toBe(true)
      expect(isEditingSinglePayment).toHaveBeenCalledWith(editingSparplan)
    })
  })

  describe('getSharedUtilitiesProps', () => {
    test('should return shared utilities props', () => {
      const formatDateForInput = vi.fn()
      const handleDateChange = vi.fn()
      const handleNumberChange = vi.fn()
      const handleCancelEdit = vi.fn()
      const simulationAnnual = SimulationAnnual.yearly

      const props = getSharedUtilitiesProps(
        simulationAnnual,
        formatDateForInput,
        handleDateChange,
        handleNumberChange,
        handleCancelEdit,
      )

      expect(props.simulationAnnual).toBe(simulationAnnual)
      expect(props.formatDateForInput).toBe(formatDateForInput)
      expect(props.handleDateChange).toBe(handleDateChange)
      expect(props.handleNumberChange).toBe(handleNumberChange)
      expect(props.handleCancelEdit).toBe(handleCancelEdit)
    })
  })

  describe('getSavedSparplansListProps', () => {
    test('should map handler props correctly', () => {
      const handleEditSparplan = vi.fn()
      const handleDeleteSparplan = vi.fn()
      const handleSaveEdit = vi.fn()
      const handleCancelEdit = vi.fn()
      const setSparplanFormValues = vi.fn()
      const setSingleFormValue = vi.fn()
      const simulationAnnual = SimulationAnnual.yearly

      const props = getSavedSparplansListProps(
        [],
        simulationAnnual,
        false,
        null,
        {} as SparplanFormValue,
        {} as SingleFormValue,
        vi.fn(),
        vi.fn(),
        handleEditSparplan,
        handleDeleteSparplan,
        handleSaveEdit,
        handleCancelEdit,
        setSparplanFormValues,
        setSingleFormValue,
      )

      expect(props.onEdit).toBe(handleEditSparplan)
      expect(props.onDelete).toBe(handleDeleteSparplan)
      expect(props.onSaveEdit).toBe(handleSaveEdit)
      expect(props.onCancelEdit).toBe(handleCancelEdit)
      expect(props.onSparplanFormChange).toBe(setSparplanFormValues)
      expect(props.onSingleFormChange).toBe(setSingleFormValue)
    })
  })

  describe('computeViewProps', () => {
    test('should compute all view props correctly', () => {
      const mockProps: SparplanEingabeViewProps = {
        isSparplanFormOpen: true,
        setIsSparplanFormOpen: vi.fn(),
        sparplanFormValues: {} as SparplanFormValue,
        setSparplanFormValues: vi.fn(),
        isSingleFormOpen: false,
        setIsSingleFormOpen: vi.fn(),
        singleFormValue: {} as SingleFormValue,
        setSingleFormValue: vi.fn(),
        isEditMode: true,
        editingSparplan: { id: 1, start: new Date(), einzahlung: 100 } as any,
        sparplans: [],
        simulationAnnual: SimulationAnnual.yearly,
        handleSparplanSubmit: vi.fn(),
        handleSinglePaymentSubmit: vi.fn(),
        handleDeleteSparplan: vi.fn(),
        handleEditSparplan: vi.fn(),
        handleSaveEdit: vi.fn(),
        handleCancelEdit: vi.fn(),
        formatDateForInput: vi.fn(),
        handleDateChange: vi.fn(),
        handleNumberChange: vi.fn(),
        isEditingSparplan: vi.fn(() => true),
        isEditingSinglePayment: vi.fn(() => false),
      }

      const viewProps = computeViewProps(mockProps)

      expect(viewProps.sparplanForm).toBeDefined()
      expect(viewProps.singlePaymentForm).toBeDefined()
      expect(viewProps.sharedUtilities).toBeDefined()
      expect(viewProps.savedSparplansList).toBeDefined()

      // Verify edit mode computation
      expect(viewProps.sparplanForm.isEditMode).toBe(true)
      expect(viewProps.singlePaymentForm.isEditMode).toBe(false)
    })
  })
})
