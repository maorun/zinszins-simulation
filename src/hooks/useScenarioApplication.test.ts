/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScenarioApplication } from './useScenarioApplication'
import type { FinancialScenario } from '../data/scenarios'

describe('useScenarioApplication', () => {
  let mockHandlers: any

  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()

    mockHandlers = {
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
  })

  it('should apply fixed return scenario correctly', () => {
    const { result } = renderHook(() => useScenarioApplication(mockHandlers))

    const scenario: FinancialScenario = {
      id: 'test-scenario',
      name: 'Test Scenario',
      description: 'Test description',
      category: 'conservative',
      icon: '🧪',
      config: {
        startYear: 2024,
        retirementYear: 2040,
        returnMode: 'fixed',
        expectedReturn: 5,
        ter: 0.2,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        freibetrag: 1000,
        inflationRate: 2,
        initialInvestment: 10000,
        monthlyContribution: 500,
      },
      learningPoints: ['Test point'],
      risks: ['Test risk'],
      suitableFor: ['Test user'],
    }

    result.current.handleApplyScenario(scenario)

    // Check time range
    expect(mockHandlers.setStartEnd).toHaveBeenCalledWith([2040, 2070])

    // Check return configuration
    expect(mockHandlers.setReturnMode).toHaveBeenCalledWith('fixed')
    expect(mockHandlers.setRendite).toHaveBeenCalledWith(5)

    // Check tax configuration
    expect(mockHandlers.setSteuerlast).toHaveBeenCalledWith(26.375)
    expect(mockHandlers.setTeilfreistellungsquote).toHaveBeenCalledWith(30)
    expect(mockHandlers.setFreibetragPerYear).toHaveBeenCalledWith({ 2024: 1000 })

    // Check inflation
    expect(mockHandlers.setInflationAktivSparphase).toHaveBeenCalledWith(true)
    expect(mockHandlers.setInflationsrateSparphase).toHaveBeenCalledWith(2)

    // Check savings plan
    expect(mockHandlers.setSparplan).toHaveBeenCalled()
    const sparplan = mockHandlers.setSparplan.mock.calls[0][0]
    expect(sparplan).toHaveLength(2)
    expect(sparplan[0].einzahlung).toBe(10000) // Initial investment
    expect(sparplan[1].einzahlung).toBe(6000) // Monthly contribution * 12

    // Check simulation trigger
    vi.runAllTimers()
    expect(mockHandlers.performSimulation).toHaveBeenCalled()
  })

  it('should apply random return scenario correctly', () => {
    const { result } = renderHook(() => useScenarioApplication(mockHandlers))

    const scenario: FinancialScenario = {
      id: 'test-random',
      name: 'Random Scenario',
      description: 'Random test',
      category: 'balanced',
      icon: '🎲',
      config: {
        startYear: 2024,
        retirementYear: 2050,
        returnMode: 'random',
        expectedReturn: 7,
        volatility: 15,
        ter: 0.3,
        monthlyContribution: 500,
      },
      learningPoints: ['Test point'],
      risks: ['Test risk'],
      suitableFor: ['Test user'],
    }

    result.current.handleApplyScenario(scenario)

    expect(mockHandlers.setReturnMode).toHaveBeenCalledWith('random')
    expect(mockHandlers.setAverageReturn).toHaveBeenCalledWith(7)
    expect(mockHandlers.setStandardDeviation).toHaveBeenCalledWith(15)
  })

  it('should handle scenario with only initial investment', () => {
    const { result } = renderHook(() => useScenarioApplication(mockHandlers))

    const scenario: FinancialScenario = {
      id: 'test-initial',
      name: 'Initial Only',
      description: 'Initial investment only',
      category: 'conservative',
      icon: '💰',
      config: {
        startYear: 2024,
        retirementYear: 2050,
        returnMode: 'fixed',
        expectedReturn: 5,
        ter: 0.2,
        initialInvestment: 50000,
        monthlyContribution: 0,
      },
      learningPoints: ['Test point'],
      risks: ['Test risk'],
      suitableFor: ['Test user'],
    }

    result.current.handleApplyScenario(scenario)

    const sparplan = mockHandlers.setSparplan.mock.calls[0][0]
    expect(sparplan).toHaveLength(1)
    expect(sparplan[0].einzahlung).toBe(50000)
  })

  it('should handle scenario with only monthly contributions', () => {
    const { result } = renderHook(() => useScenarioApplication(mockHandlers))

    const scenario: FinancialScenario = {
      id: 'test-monthly',
      name: 'Monthly Only',
      description: 'Monthly contributions only',
      category: 'balanced',
      icon: '📅',
      config: {
        startYear: 2024,
        retirementYear: 2050,
        returnMode: 'fixed',
        expectedReturn: 5,
        ter: 0.2,
        monthlyContribution: 1000,
      },
      learningPoints: ['Test point'],
      risks: ['Test risk'],
      suitableFor: ['Test user'],
    }

    result.current.handleApplyScenario(scenario)

    const sparplan = mockHandlers.setSparplan.mock.calls[0][0]
    expect(sparplan).toHaveLength(1)
    expect(sparplan[0].einzahlung).toBe(12000) // 1000 * 12
  })

  it('should skip optional configuration when not provided', () => {
    const { result } = renderHook(() => useScenarioApplication(mockHandlers))

    const scenario: FinancialScenario = {
      id: 'test-minimal',
      name: 'Minimal Scenario',
      description: 'Minimal configuration',
      category: 'conservative',
      icon: '🎯',
      config: {
        startYear: 2024,
        retirementYear: 2050,
        returnMode: 'fixed',
        expectedReturn: 5,
        ter: 0.2,
        monthlyContribution: 500,
      },
      learningPoints: ['Test point'],
      risks: ['Test risk'],
      suitableFor: ['Test user'],
    }

    result.current.handleApplyScenario(scenario)

    expect(mockHandlers.setSteuerlast).not.toHaveBeenCalled()
    expect(mockHandlers.setTeilfreistellungsquote).not.toHaveBeenCalled()
    expect(mockHandlers.setFreibetragPerYear).not.toHaveBeenCalled()
    expect(mockHandlers.setInflationAktivSparphase).not.toHaveBeenCalled()
    expect(mockHandlers.setInflationsrateSparphase).not.toHaveBeenCalled()
  })
})
