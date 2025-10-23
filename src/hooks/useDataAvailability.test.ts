import { renderHook } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { useDataAvailability } from './useDataAvailability'
import * as useSimulationModule from '../contexts/useSimulation'

vi.mock('../contexts/useSimulation')

describe('useDataAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns false for all flags when no data available', () => {
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      simulationData: null,
      withdrawalResults: null,
      withdrawalConfig: null,
    } as never)

    const { result } = renderHook(() => useDataAvailability())

    expect(result.current).toEqual({
      hasSavingsData: false,
      hasWithdrawalData: false,
      hasWithdrawalConfig: false,
      hasWithdrawalConfigFromStorage: false,
      hasWithdrawalCapability: false,
      hasAnyData: false,
    })
  })

  test('detects savings data when sparplanElements exist', () => {
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      simulationData: {
        sparplanElements: [{} as never],
      },
      withdrawalResults: null,
      withdrawalConfig: null,
    } as never)

    const { result } = renderHook(() => useDataAvailability())

    expect(result.current.hasSavingsData).toBe(true)
    expect(result.current.hasAnyData).toBe(true)
  })

  test('detects withdrawal data when withdrawalResults exist', () => {
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      simulationData: null,
      withdrawalResults: {
        years: [],
      } as never,
      withdrawalConfig: null,
    } as never)

    const { result } = renderHook(() => useDataAvailability())

    expect(result.current.hasWithdrawalData).toBe(true)
    expect(result.current.hasAnyData).toBe(true)
    expect(result.current.hasWithdrawalCapability).toBe(true)
  })

  test('detects withdrawal config from formValue', () => {
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      simulationData: null,
      withdrawalResults: null,
      withdrawalConfig: {
        formValue: {},
      } as never,
    } as never)

    const { result } = renderHook(() => useDataAvailability())

    expect(result.current.hasWithdrawalConfig).toBe(true)
    expect(result.current.hasWithdrawalConfigFromStorage).toBe(true)
    expect(result.current.hasWithdrawalCapability).toBe(true)
    expect(result.current.hasAnyData).toBe(true)
  })

  test('detects withdrawal capability when savings data and config exist', () => {
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      simulationData: {
        sparplanElements: [{} as never],
      },
      withdrawalResults: null,
      withdrawalConfig: {} as never,
    } as never)

    const { result } = renderHook(() => useDataAvailability())

    expect(result.current.hasSavingsData).toBe(true)
    expect(result.current.hasWithdrawalCapability).toBe(true)
  })

  test('detects withdrawal config from segmented withdrawal', () => {
    vi.spyOn(useSimulationModule, 'useSimulation').mockReturnValue({
      simulationData: null,
      withdrawalResults: null,
      withdrawalConfig: {
        useSegmentedWithdrawal: true,
        withdrawalSegments: [],
      } as never,
    } as never)

    const { result } = renderHook(() => useDataAvailability())

    expect(result.current.hasWithdrawalConfigFromStorage).toBe(true)
    expect(result.current.hasWithdrawalCapability).toBe(true)
    expect(result.current.hasAnyData).toBe(true)
  })
})
