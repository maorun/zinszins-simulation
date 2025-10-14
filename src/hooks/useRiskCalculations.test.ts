import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRiskCalculations } from './useRiskCalculations'
import type { SimulationData } from '../contexts/helpers/config-types'

describe('useRiskCalculations', () => {
  it('returns empty portfolio data when simulationData is null', () => {
    const { result } = renderHook(() => useRiskCalculations(null))

    expect(result.current.portfolioData).toEqual({
      years: [],
      values: [],
      riskFreeRate: 0.02,
    })
    expect(result.current.riskMetrics).toBeNull()
    expect(result.current.hasRiskData).toBe(false)
  })

  it('extracts portfolio data from simulation results', () => {
    const mockSimulationData = {
      sparplanElements: [
        {
          simulation: {
            2023: {
              endkapital: 10000, startkapital: 0, einzahlung: 10000,
              bezahlteSteuer: 0, genutzterFreibetrag: 0,
            },
            2024: {
              endkapital: 20000, startkapital: 10000, einzahlung: 10000,
              bezahlteSteuer: 0, genutzterFreibetrag: 0,
            },
            2025: {
              endkapital: 30000, startkapital: 20000, einzahlung: 10000,
              bezahlteSteuer: 0, genutzterFreibetrag: 0,
            },
          },
        },
      ],
    } as unknown as SimulationData

    const { result } = renderHook(() => useRiskCalculations(mockSimulationData))

    expect(result.current.portfolioData.years).toEqual([2023, 2024, 2025])
    expect(result.current.portfolioData.values).toEqual([10000, 20000, 30000])
    expect(result.current.portfolioData.riskFreeRate).toBe(0.02)
  })

  it('calculates risk metrics when sufficient data is available', () => {
    const mockSimulationData = {
      sparplanElements: [
        {
          simulation: {
            2023: {
              endkapital: 10000, startkapital: 0, einzahlung: 10000,
              bezahlteSteuer: 0, genutzterFreibetrag: 0,
            },
            2024: {
              endkapital: 15000, startkapital: 10000, einzahlung: 10000,
              bezahlteSteuer: 0, genutzterFreibetrag: 0,
            },
            2025: {
              endkapital: 12000, startkapital: 15000, einzahlung: 10000,
              bezahlteSteuer: 0, genutzterFreibetrag: 0,
            },
          },
        },
      ],
    } as unknown as SimulationData

    const { result } = renderHook(() => useRiskCalculations(mockSimulationData))

    expect(result.current.riskMetrics).not.toBeNull()
    expect(result.current.riskMetrics?.volatility).toBeGreaterThan(0)
  })

  it('returns null risk metrics when insufficient data', () => {
    const mockSimulationData = {
      sparplanElements: [
        {
          simulation: {
            2023: { endkapital: 10000, startkapital: 0, einzahlung: 10000, bezahlteSteuer: 0, genutzterFreibetrag: 0 },
          },
        },
      ],
    } as unknown as SimulationData

    const { result } = renderHook(() => useRiskCalculations(mockSimulationData))

    expect(result.current.riskMetrics).toBeNull()
  })

  it('detects meaningful risk data', () => {
    const mockSimulationData = {
      sparplanElements: [
        {
          simulation: {
            2023: {
              endkapital: 10000, startkapital: 0, einzahlung: 10000,
              bezahlteSteuer: 0, genutzterFreibetrag: 0,
            },
            2024: {
              endkapital: 15000, startkapital: 10000, einzahlung: 10000,
              bezahlteSteuer: 0, genutzterFreibetrag: 0,
            },
            2025: {
              endkapital: 12000, startkapital: 15000, einzahlung: 10000,
              bezahlteSteuer: 0, genutzterFreibetrag: 0,
            },
          },
        },
      ],
    } as unknown as SimulationData

    const { result } = renderHook(() => useRiskCalculations(mockSimulationData))

    expect(result.current.hasRiskData).toBe(true)
  })

  it('filters out zero values from portfolio data', () => {
    const mockSimulationData = {
      sparplanElements: [
        {
          simulation: {
            2023: { endkapital: 10000, startkapital: 0, einzahlung: 10000, bezahlteSteuer: 0, genutzterFreibetrag: 0 },
            2024: { endkapital: 0, startkapital: 10000, einzahlung: 0, bezahlteSteuer: 0, genutzterFreibetrag: 0 },
            2025: { endkapital: 20000, startkapital: 0, einzahlung: 20000, bezahlteSteuer: 0, genutzterFreibetrag: 0 },
          },
        },
      ],
    } as unknown as SimulationData

    const { result } = renderHook(() => useRiskCalculations(mockSimulationData))

    expect(result.current.portfolioData.years).toEqual([2023, 2025])
    expect(result.current.portfolioData.values).toEqual([10000, 20000])
  })
})
