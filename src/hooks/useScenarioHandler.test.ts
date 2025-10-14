import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useScenarioHandler } from './useScenarioHandler'
import type { FinancialScenario } from '../data/scenarios'

describe('useScenarioHandler', () => {
  it('should apply a fixed return scenario', () => {
    const mockSetters = {
      setStartEnd: vi.fn(),
      setReturnMode: vi.fn(),
      setRendite: vi.fn(),
      setAverageReturn: vi.fn(),
      setStandardDeviation: vi.fn(),
      setSteuerlast: vi.fn(),
      setTeilfreistellungsquote: vi.fn(),
      setFreibetragPerYear: vi.fn(),
      setInflationAktivSparphase: vi.fn(),
      setInflationsrateSparphase: vi.fn(),
      setSparplan: vi.fn(),
      performSimulation: vi.fn(),
    }

    const { result } = renderHook(() => useScenarioHandler(mockSetters))

    const scenario: FinancialScenario = {
      id: 'test-scenario',
      name: 'Test Scenario',
      description: 'Test Description',
      category: 'balanced',
      icon: '📊',
      config: {
        startYear: 2024,
        retirementYear: 2054,
        returnMode: 'fixed',
        expectedReturn: 7,
        monthlyContribution: 1000,
        ter: 0.2,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetrag: 1000,
        inflationRate: 2,
      },
      learningPoints: ['Test learning'],
      risks: ['Test risk'],
      suitableFor: ['Test user'],
    }

    act(() => {
      result.current.handleApplyScenario(scenario)
    })

    expect(mockSetters.setStartEnd).toHaveBeenCalledWith([2054, 2084])
    expect(mockSetters.setReturnMode).toHaveBeenCalledWith('fixed')
    expect(mockSetters.setRendite).toHaveBeenCalledWith(7)
    expect(mockSetters.setSteuerlast).toHaveBeenCalledWith(26.375)
    expect(mockSetters.setTeilfreistellungsquote).toHaveBeenCalledWith(30)
    expect(mockSetters.setFreibetragPerYear).toHaveBeenCalledWith({ 2024: 1000 })
    expect(mockSetters.setInflationAktivSparphase).toHaveBeenCalledWith(true)
    expect(mockSetters.setInflationsrateSparphase).toHaveBeenCalledWith(2)
    expect(mockSetters.setSparplan).toHaveBeenCalled()
  })

  it('should apply a random return scenario with volatility', () => {
    const mockSetters = {
      setStartEnd: vi.fn(),
      setReturnMode: vi.fn(),
      setRendite: vi.fn(),
      setAverageReturn: vi.fn(),
      setStandardDeviation: vi.fn(),
      setSteuerlast: vi.fn(),
      setTeilfreistellungsquote: vi.fn(),
      setFreibetragPerYear: vi.fn(),
      setInflationAktivSparphase: vi.fn(),
      setInflationsrateSparphase: vi.fn(),
      setSparplan: vi.fn(),
      performSimulation: vi.fn(),
    }

    const { result } = renderHook(() => useScenarioHandler(mockSetters))

    const scenario: FinancialScenario = {
      id: 'test-random',
      name: 'Random Scenario',
      description: 'Test Random',
      category: 'aggressive',
      icon: '🎲',
      config: {
        startYear: 2024,
        retirementYear: 2054,
        returnMode: 'random',
        expectedReturn: 7,
        volatility: 15,
        monthlyContribution: 1000,
        ter: 0.2,
      },
      learningPoints: ['Test learning'],
      risks: ['Test risk'],
      suitableFor: ['Test user'],
    }

    act(() => {
      result.current.handleApplyScenario(scenario)
    })

    expect(mockSetters.setReturnMode).toHaveBeenCalledWith('random')
    expect(mockSetters.setAverageReturn).toHaveBeenCalledWith(7)
    expect(mockSetters.setStandardDeviation).toHaveBeenCalledWith(15)
  })

  it('should create savings plan with initial investment and monthly contribution', () => {
    const mockSetters = {
      setStartEnd: vi.fn(),
      setReturnMode: vi.fn(),
      setRendite: vi.fn(),
      setAverageReturn: vi.fn(),
      setStandardDeviation: vi.fn(),
      setSteuerlast: vi.fn(),
      setTeilfreistellungsquote: vi.fn(),
      setFreibetragPerYear: vi.fn(),
      setInflationAktivSparphase: vi.fn(),
      setInflationsrateSparphase: vi.fn(),
      setSparplan: vi.fn(),
      performSimulation: vi.fn(),
    }

    const { result } = renderHook(() => useScenarioHandler(mockSetters))

    const scenario: FinancialScenario = {
      id: 'test-investment',
      name: 'Investment Scenario',
      description: 'Test Investment',
      category: 'balanced',
      icon: '💰',
      config: {
        startYear: 2024,
        retirementYear: 2054,
        returnMode: 'fixed',
        expectedReturn: 7,
        initialInvestment: 10000,
        monthlyContribution: 500,
        ter: 0.2,
      },
      learningPoints: ['Test learning'],
      risks: ['Test risk'],
      suitableFor: ['Test user'],
    }

    act(() => {
      result.current.handleApplyScenario(scenario)
    })

    const setSparplanCall = mockSetters.setSparplan.mock.calls[0][0]
    expect(setSparplanCall).toHaveLength(2)
    expect(setSparplanCall[0].einzahlung).toBe(10000)
    expect(setSparplanCall[1].einzahlung).toBe(6000) // 500 * 12
  })

  it('should trigger simulation after timeout', () => {
    vi.useFakeTimers()

    const mockSetters = {
      setStartEnd: vi.fn(),
      setReturnMode: vi.fn(),
      setRendite: vi.fn(),
      setAverageReturn: vi.fn(),
      setStandardDeviation: vi.fn(),
      setSteuerlast: vi.fn(),
      setTeilfreistellungsquote: vi.fn(),
      setFreibetragPerYear: vi.fn(),
      setInflationAktivSparphase: vi.fn(),
      setInflationsrateSparphase: vi.fn(),
      setSparplan: vi.fn(),
      performSimulation: vi.fn(),
    }

    const { result } = renderHook(() => useScenarioHandler(mockSetters))

    const scenario: FinancialScenario = {
      id: 'test-timeout',
      name: 'Timeout Test',
      description: 'Test Timeout',
      category: 'conservative',
      icon: '⏱️',
      config: {
        startYear: 2024,
        retirementYear: 2054,
        returnMode: 'fixed',
        expectedReturn: 7,
        monthlyContribution: 500,
        ter: 0.2,
      },
      learningPoints: ['Test learning'],
      risks: ['Test risk'],
      suitableFor: ['Test user'],
    }

    act(() => {
      result.current.handleApplyScenario(scenario)
    })

    expect(mockSetters.performSimulation).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockSetters.performSimulation).toHaveBeenCalled()

    vi.useRealTimers()
  })
})
