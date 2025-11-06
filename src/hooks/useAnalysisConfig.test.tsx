import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAnalysisConfig } from './useAnalysisConfig'
import { SimulationProvider } from '../contexts/SimulationContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => {
  return <SimulationProvider>{children}</SimulationProvider>
}

describe('useAnalysisConfig', () => {
  it('should return simulation data and config objects', () => {
    const { result } = renderHook(() => useAnalysisConfig(), { wrapper })

    expect(result.current).toHaveProperty('simulationData')
    expect(result.current).toHaveProperty('sparplanElemente')
    expect(result.current).toHaveProperty('returnConfig')
    expect(result.current).toHaveProperty('sensitivityConfig')
  })

  it('should provide returnConfig with correct structure', () => {
    const { result } = renderHook(() => useAnalysisConfig(), { wrapper })

    expect(result.current.returnConfig).toHaveProperty('mode')
    // The return config structure depends on the mode (random, fixed, variable, etc.)
    expect(['random', 'fixed', 'variable', 'historical', 'multi-asset']).toContain(result.current.returnConfig.mode)
  })

  it('should provide sensitivityConfig with correct structure', () => {
    const { result } = renderHook(() => useAnalysisConfig(), { wrapper })

    expect(result.current.sensitivityConfig).toHaveProperty('startYear')
    expect(result.current.sensitivityConfig).toHaveProperty('endYear')
    expect(result.current.sensitivityConfig).toHaveProperty('elements')
    expect(result.current.sensitivityConfig).toHaveProperty('steuerlast')
    expect(result.current.sensitivityConfig).toHaveProperty('teilfreistellungsquote')
    expect(result.current.sensitivityConfig).toHaveProperty('simulationAnnual')
    expect(result.current.sensitivityConfig).toHaveProperty('freibetragPerYear')
    expect(result.current.sensitivityConfig).toHaveProperty('steuerReduzierenEndkapital')
    expect(result.current.sensitivityConfig).toHaveProperty('inflationAktivSparphase')
    expect(result.current.sensitivityConfig).toHaveProperty('inflationsrateSparphase')
    expect(result.current.sensitivityConfig).toHaveProperty('inflationAnwendungSparphase')
  })

  it('should convert percentage values correctly', () => {
    const { result } = renderHook(() => useAnalysisConfig(), { wrapper })

    // Default values from context: steuerlast=26.375, teilfreistellungsquote=30
    expect(result.current.sensitivityConfig.steuerlast).toBe(26.375 / 100)
    expect(result.current.sensitivityConfig.teilfreistellungsquote).toBe(30 / 100)
  })

  it('should use start and end years from context', () => {
    const { result } = renderHook(() => useAnalysisConfig(), { wrapper })

    // The hook should use the start and end years from the simulation context
    expect(result.current.sensitivityConfig.startYear).toBeDefined()
    expect(result.current.sensitivityConfig.endYear).toBeDefined()
    expect(result.current.sensitivityConfig.endYear).toBeGreaterThan(result.current.sensitivityConfig.startYear)
  })
})
