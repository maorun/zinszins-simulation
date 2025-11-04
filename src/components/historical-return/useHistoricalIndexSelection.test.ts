import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHistoricalIndexSelection } from './useHistoricalIndexSelection'
import * as useSimulationModule from '../../contexts/useSimulation'

// Mock the useSimulation hook
vi.mock('../../contexts/useSimulation', () => ({
  useSimulation: vi.fn(),
}))

describe('useHistoricalIndexSelection', () => {
  const mockSetHistoricalIndex = vi.fn()
  const mockPerformSimulation = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      historicalIndex: 'dax',
      setHistoricalIndex: mockSetHistoricalIndex,
      performSimulation: mockPerformSimulation,
    } as unknown as ReturnType<typeof useSimulationModule.useSimulation>)
  })

  it('should initialize with default index if no historicalIndex is set', () => {
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      historicalIndex: '',
      setHistoricalIndex: mockSetHistoricalIndex,
      performSimulation: mockPerformSimulation,
    } as unknown as ReturnType<typeof useSimulationModule.useSimulation>)

    const { result } = renderHook(() => useHistoricalIndexSelection())

    expect(result.current.selectedIndexId).toBe('dax')
  })

  it('should initialize with the current historicalIndex from context', () => {
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      historicalIndex: 'sp500',
      setHistoricalIndex: mockSetHistoricalIndex,
      performSimulation: mockPerformSimulation,
    } as unknown as ReturnType<typeof useSimulationModule.useSimulation>)

    const { result } = renderHook(() => useHistoricalIndexSelection())

    expect(result.current.selectedIndexId).toBe('sp500')
  })

  it('should handle index change correctly', () => {
    const { result } = renderHook(() => useHistoricalIndexSelection())

    // Call handleIndexChange with a new index
    result.current.handleIndexChange('msci-world')

    // Verify that the context functions were called
    expect(mockSetHistoricalIndex).toHaveBeenCalledWith('msci-world')
    expect(mockPerformSimulation).toHaveBeenCalled()
  })
})
