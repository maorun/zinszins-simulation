import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLifeExpectancyCalculation } from './useLifeExpectancyCalculation'

// Mock the helper functions
vi.mock('../../../helpers/life-expectancy', () => ({
  calculateEndOfLifeYear: vi.fn((birthYear: number, expectedLifespan: number) => birthYear + expectedLifespan),
  calculateCurrentAge: vi.fn((birthYear: number) => new Date().getFullYear() - birthYear),
}))

vi.mock('../../../helpers/rmd-tables', () => ({
  calculateJointLifeExpectancy: vi.fn(() => 30),
}))

describe('useLifeExpectancyCalculation', () => {
  const mockSetEndOfLife = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Individual Planning Mode', () => {
    it('calculates end of life when automatic calculation is enabled', () => {
      const { result } = renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: 1980,
          expectedLifespan: 85,
          planningMode: 'individual',
          gender: 'male',
          spouse: undefined,
          useAutomaticCalculation: true,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(result.current.calculateEndOfLife).toBeDefined()
      expect(mockSetEndOfLife).toHaveBeenCalled()
    })

    it('does not calculate when automatic calculation is disabled', () => {
      renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: 1980,
          expectedLifespan: 85,
          planningMode: 'individual',
          gender: 'male',
          spouse: undefined,
          useAutomaticCalculation: false,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(mockSetEndOfLife).not.toHaveBeenCalled()
    })

    it('does not calculate when birth year is missing', () => {
      renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: undefined,
          expectedLifespan: 85,
          planningMode: 'individual',
          gender: 'male',
          spouse: undefined,
          useAutomaticCalculation: true,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(mockSetEndOfLife).not.toHaveBeenCalled()
    })

    it('does not calculate when expected lifespan is missing', () => {
      renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: 1980,
          expectedLifespan: undefined,
          planningMode: 'individual',
          gender: 'male',
          spouse: undefined,
          useAutomaticCalculation: true,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(mockSetEndOfLife).not.toHaveBeenCalled()
    })
  })

  describe('Couple Planning Mode', () => {
    it('calculates end of life for couple when automatic calculation is enabled', () => {
      renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: 1980,
          expectedLifespan: 85,
          planningMode: 'couple',
          gender: 'male',
          spouse: {
            birthYear: 1982,
            gender: 'female',
            expectedLifespan: 87,
          },
          useAutomaticCalculation: true,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(mockSetEndOfLife).toHaveBeenCalled()
    })

    it('does not calculate when spouse data is missing', () => {
      renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: 1980,
          expectedLifespan: 85,
          planningMode: 'couple',
          gender: 'male',
          spouse: undefined,
          useAutomaticCalculation: true,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(mockSetEndOfLife).not.toHaveBeenCalled()
    })

    it('does not calculate when spouse birth year is missing', () => {
      renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: 1980,
          expectedLifespan: 85,
          planningMode: 'couple',
          gender: 'male',
          spouse: {
            birthYear: undefined,
            gender: 'female',
            expectedLifespan: 87,
          },
          useAutomaticCalculation: true,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(mockSetEndOfLife).not.toHaveBeenCalled()
    })

    it('does not calculate when gender is missing', () => {
      renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: 1980,
          expectedLifespan: 85,
          planningMode: 'couple',
          gender: undefined,
          spouse: {
            birthYear: 1982,
            gender: 'female',
            expectedLifespan: 87,
          },
          useAutomaticCalculation: true,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(mockSetEndOfLife).not.toHaveBeenCalled()
    })
  })

  describe('Manual Callbacks', () => {
    it('provides calculateEndOfLife callback', () => {
      const { result } = renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: 1980,
          expectedLifespan: 85,
          planningMode: 'individual',
          gender: 'male',
          spouse: undefined,
          useAutomaticCalculation: false,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(result.current.calculateEndOfLife).toBeInstanceOf(Function)

      // Call the callback manually
      result.current.calculateEndOfLife()
      expect(mockSetEndOfLife).toHaveBeenCalled()
    })

    it('calculateEndOfLife works for couple mode', () => {
      const { result } = renderHook(() =>
        useLifeExpectancyCalculation({
          birthYear: 1980,
          expectedLifespan: 85,
          planningMode: 'couple',
          gender: 'male',
          spouse: {
            birthYear: 1982,
            gender: 'female',
            expectedLifespan: 87,
          },
          useAutomaticCalculation: false,
          setEndOfLife: mockSetEndOfLife,
        }),
      )

      expect(result.current.calculateEndOfLife).toBeInstanceOf(Function)

      // Call the callback manually
      result.current.calculateEndOfLife()
      expect(mockSetEndOfLife).toHaveBeenCalled()
    })
  })

  describe('Reactivity', () => {
    it('recalculates when birth year changes', () => {
      const { rerender } = renderHook(
        ({ birthYear }) =>
          useLifeExpectancyCalculation({
            birthYear,
            expectedLifespan: 85,
            planningMode: 'individual',
            gender: 'male',
            spouse: undefined,
            useAutomaticCalculation: true,
            setEndOfLife: mockSetEndOfLife,
          }),
        { initialProps: { birthYear: 1980 } },
      )

      expect(mockSetEndOfLife).toHaveBeenCalledTimes(1)

      // Change birth year
      rerender({ birthYear: 1990 })
      expect(mockSetEndOfLife).toHaveBeenCalledTimes(2)
    })

    it('recalculates when planning mode changes', () => {
      type PlanningMode = 'individual' | 'couple'
      const { rerender } = renderHook(
        ({ planningMode }: { planningMode: PlanningMode }) =>
          useLifeExpectancyCalculation({
            birthYear: 1980,
            expectedLifespan: 85,
            planningMode,
            gender: 'male',
            spouse: {
              birthYear: 1982,
              gender: 'female',
              expectedLifespan: 87,
            },
            useAutomaticCalculation: true,
            setEndOfLife: mockSetEndOfLife,
          }),
        { initialProps: { planningMode: 'individual' as PlanningMode } },
      )

      expect(mockSetEndOfLife).toHaveBeenCalledTimes(1)

      // Change planning mode
      rerender({ planningMode: 'couple' as PlanningMode })
      expect(mockSetEndOfLife).toHaveBeenCalledTimes(2)
    })
  })
})
