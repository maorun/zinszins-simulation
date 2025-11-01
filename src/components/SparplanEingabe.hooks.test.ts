import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useSparplanState, useEditState, useSparplanHandlers } from './SparplanEingabe.hooks'
import { SimulationAnnual } from '../utils/simulate'
import type { Sparplan } from '../utils/sparplan-utils'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
  },
}))

describe('SparplanEingabe Hooks', () => {
  describe('useSparplanState', () => {
    it('should initialize with provided sparplans', () => {
      const testSparplans: Sparplan[] = [
        {
          id: 1,
          start: new Date('2024-01-01'),
          end: null,
          einzahlung: 24000,
        },
      ]

      const { result } = renderHook(() => useSparplanState(testSparplans))

      expect(result.current.sparplans).toEqual(testSparplans)
      expect(result.current.singleFormValue.einzahlung).toBe('')
      expect(result.current.sparplanFormValues.einzahlung).toBe('')
    })
  })

  describe('useEditState', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useEditState())

      expect(result.current.editingSparplan).toBeNull()
      expect(result.current.isEditMode).toBe(false)
      expect(result.current.isSparplanFormOpen).toBe(false)
      expect(result.current.isSingleFormOpen).toBe(false)
    })
  })

  describe('useSparplanHandlers', () => {
    it('should provide all handler functions', () => {
      const mockDispatch = vi.fn()
      const testSparplans: Sparplan[] = []

      const { result } = renderHook(() => {
        const state = useSparplanState(testSparplans)
        const editState = useEditState()

        return useSparplanHandlers({
          sparplans: state.sparplans,
          setSparplans: state.setSparplans,
          dispatch: mockDispatch,
          sparplanFormValues: state.sparplanFormValues,
          setSparplanFormValues: state.setSparplanFormValues,
          singleFormValue: state.singleFormValue,
          setSingleFormValue: state.setSingleFormValue,
          editingSparplan: editState.editingSparplan,
          setEditingSparplan: editState.setEditingSparplan,
          isEditMode: editState.isEditMode,
          setIsEditMode: editState.setIsEditMode,
          simulationAnnual: SimulationAnnual.yearly,
        })
      })

      expect(typeof result.current.handleSparplanSubmit).toBe('function')
      expect(typeof result.current.handleSinglePaymentSubmit).toBe('function')
      expect(typeof result.current.handleDeleteSparplan).toBe('function')
      expect(typeof result.current.handleEditSparplan).toBe('function')
      expect(typeof result.current.handleSaveEdit).toBe('function')
      expect(typeof result.current.handleCancelEdit).toBe('function')
    })
  })
})
