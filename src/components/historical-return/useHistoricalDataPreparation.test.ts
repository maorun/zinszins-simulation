import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHistoricalDataPreparation } from './useHistoricalDataPreparation'
import * as useSimulationModule from '../../contexts/useSimulation'

// Mock the useSimulation hook
vi.mock('../../contexts/useSimulation', () => ({
  useSimulation: vi.fn(),
}))

describe('useHistoricalDataPreparation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      startEnd: [2024, 2040],
    } as unknown as ReturnType<typeof useSimulationModule.useSimulation>)
  })

  it('should find the current index based on selectedIndexId', () => {
    const { result } = renderHook(() => useHistoricalDataPreparation('dax'))

    expect(result.current.currentIndex).toBeDefined()
    expect(result.current.currentIndex?.id).toBe('dax')
    expect(result.current.currentIndex?.name).toBe('DAX')
  })

  it('should return null for currentIndex if invalid id is provided', () => {
    const { result } = renderHook(() => useHistoricalDataPreparation('invalid-id'))

    expect(result.current.currentIndex).toBeUndefined()
  })

  it('should calculate simulation years correctly', () => {
    const { result } = renderHook(() => useHistoricalDataPreparation('dax'))

    expect(result.current.simulationStartYear).toBe(new Date().getFullYear())
    expect(result.current.simulationEndYear).toBe(2024)
  })

  it('should check data availability correctly for valid range', () => {
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      startEnd: [2023, 2024], // End year 2023 is within DAX range (2000-2023)
    } as unknown as ReturnType<typeof useSimulationModule.useSimulation>)

    const { result } = renderHook(() => useHistoricalDataPreparation('dax'))

    expect(result.current.isAvailable).toBe(true)
  })

  it('should return historical returns for the selected index', () => {
    const { result } = renderHook(() => useHistoricalDataPreparation('dax'))

    expect(result.current.historicalReturns).not.toBeNull()
    expect(typeof result.current.historicalReturns).toBe('object')
  })

  it('should return null for historicalReturns if no index is selected', () => {
    const { result } = renderHook(() => useHistoricalDataPreparation('invalid-id'))

    expect(result.current.historicalReturns).toBeNull()
  })
})
