import { describe, test, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRiskEventHandlers } from './useRiskEventHandlers'

describe('useRiskEventHandlers', () => {
  test('handleBlackSwanChange calls appropriate functions', () => {
    const setBlackSwanReturns = vi.fn()
    const setBlackSwanEventName = vi.fn()
    const setInflationScenarioRates = vi.fn()
    const setInflationScenarioReturnModifiers = vi.fn()
    const setInflationScenarioName = vi.fn()
    const performSimulation = vi.fn()

    const { result } = renderHook(() => useRiskEventHandlers({
      setBlackSwanReturns,
      setBlackSwanEventName,
      setInflationScenarioRates,
      setInflationScenarioReturnModifiers,
      setInflationScenarioName,
      performSimulation,
    }))

    const eventReturns = { 2020: -0.3, 2021: -0.2 }
    result.current.handleBlackSwanChange(eventReturns, 'Test Event')

    expect(setBlackSwanReturns).toHaveBeenCalledWith(eventReturns)
    expect(setBlackSwanEventName).toHaveBeenCalledWith('Test Event')
    expect(performSimulation).toHaveBeenCalled()
  })

  test('handleBlackSwanChange uses empty string when eventName is not provided', () => {
    const setBlackSwanReturns = vi.fn()
    const setBlackSwanEventName = vi.fn()
    const performSimulation = vi.fn()

    const { result } = renderHook(() => useRiskEventHandlers({
      setBlackSwanReturns,
      setBlackSwanEventName,
      setInflationScenarioRates: vi.fn(),
      setInflationScenarioReturnModifiers: vi.fn(),
      setInflationScenarioName: vi.fn(),
      performSimulation,
    }))

    result.current.handleBlackSwanChange(null)

    expect(setBlackSwanReturns).toHaveBeenCalledWith(null)
    expect(setBlackSwanEventName).toHaveBeenCalledWith('')
    expect(performSimulation).toHaveBeenCalled()
  })

  test('handleInflationScenarioChange calls appropriate functions', () => {
    const setBlackSwanReturns = vi.fn()
    const setBlackSwanEventName = vi.fn()
    const setInflationScenarioRates = vi.fn()
    const setInflationScenarioReturnModifiers = vi.fn()
    const setInflationScenarioName = vi.fn()
    const performSimulation = vi.fn()

    const { result } = renderHook(() => useRiskEventHandlers({
      setBlackSwanReturns,
      setBlackSwanEventName,
      setInflationScenarioRates,
      setInflationScenarioReturnModifiers,
      setInflationScenarioName,
      performSimulation,
    }))

    const inflationRates = { 2020: 0.05, 2021: 0.06 }
    const returnModifiers = { 2020: -0.02, 2021: -0.03 }
    result.current.handleInflationScenarioChange(inflationRates, returnModifiers, 'High Inflation')

    expect(setInflationScenarioRates).toHaveBeenCalledWith(inflationRates)
    expect(setInflationScenarioReturnModifiers).toHaveBeenCalledWith(returnModifiers)
    expect(setInflationScenarioName).toHaveBeenCalledWith('High Inflation')
    expect(performSimulation).toHaveBeenCalled()
  })

  test('handleInflationScenarioChange uses empty string when scenarioName is not provided', () => {
    const setInflationScenarioRates = vi.fn()
    const setInflationScenarioReturnModifiers = vi.fn()
    const setInflationScenarioName = vi.fn()
    const performSimulation = vi.fn()

    const { result } = renderHook(() => useRiskEventHandlers({
      setBlackSwanReturns: vi.fn(),
      setBlackSwanEventName: vi.fn(),
      setInflationScenarioRates,
      setInflationScenarioReturnModifiers,
      setInflationScenarioName,
      performSimulation,
    }))

    result.current.handleInflationScenarioChange(null, null)

    expect(setInflationScenarioRates).toHaveBeenCalledWith(null)
    expect(setInflationScenarioReturnModifiers).toHaveBeenCalledWith(null)
    expect(setInflationScenarioName).toHaveBeenCalledWith('')
    expect(performSimulation).toHaveBeenCalled()
  })
})
