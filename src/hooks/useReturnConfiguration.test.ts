/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReturnConfiguration } from './useReturnConfiguration'
import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'

describe('useReturnConfiguration', () => {
  const defaultMultiAssetConfig = createDefaultMultiAssetConfig()

  it('should build fixed return configuration', () => {
    const params = {
      returnMode: 'fixed' as const,
      rendite: 5,
      averageReturn: 0,
      standardDeviation: 0,
      variableReturns: {},
      historicalIndex: '',
      multiAssetConfig: defaultMultiAssetConfig,
    }

    const { result } = renderHook(() => useReturnConfiguration(params))

    expect(result.current).toEqual({
      mode: 'fixed',
      fixedRate: 0.05,
    })
  })

  it('should build random return configuration', () => {
    const params = {
      returnMode: 'random' as const,
      rendite: 0,
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: 12345,
      variableReturns: {},
      historicalIndex: '',
      multiAssetConfig: defaultMultiAssetConfig,
    }

    const { result } = renderHook(() => useReturnConfiguration(params))

    expect(result.current).toEqual({
      mode: 'random',
      randomConfig: {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 12345,
      },
    })
  })

  it('should build variable return configuration', () => {
    const variableReturns = {
      2024: 0.05,
      2025: 0.06,
      2026: 0.07,
    }

    const params = {
      returnMode: 'variable' as const,
      rendite: 0,
      averageReturn: 0,
      standardDeviation: 0,
      variableReturns,
      historicalIndex: '',
      multiAssetConfig: defaultMultiAssetConfig,
    }

    const { result } = renderHook(() => useReturnConfiguration(params))

    expect(result.current).toEqual({
      mode: 'variable',
      variableConfig: {
        yearlyReturns: variableReturns,
      },
    })
  })

  it('should build historical return configuration', () => {
    const params = {
      returnMode: 'historical' as const,
      rendite: 0,
      averageReturn: 0,
      standardDeviation: 0,
      variableReturns: {},
      historicalIndex: 'msci_world',
      multiAssetConfig: defaultMultiAssetConfig,
    }

    const { result } = renderHook(() => useReturnConfiguration(params))

    expect(result.current).toEqual({
      mode: 'historical',
      historicalConfig: {
        indexId: 'msci_world',
      },
    })
  })

  it('should build multi-asset return configuration', () => {
    const multiAssetConfig = createDefaultMultiAssetConfig()
    multiAssetConfig.enabled = true

    const params = {
      returnMode: 'multiasset' as const,
      rendite: 0,
      averageReturn: 0,
      standardDeviation: 0,
      variableReturns: {},
      historicalIndex: '',
      multiAssetConfig,
    }

    const { result } = renderHook(() => useReturnConfiguration(params))

    expect(result.current).toEqual({
      mode: 'multiasset',
      multiAssetConfig,
    })
  })

  it('should recalculate when parameters change', () => {
    const initialParams = {
      returnMode: 'fixed' as const,
      rendite: 5,
      averageReturn: 0,
      standardDeviation: 0,
      variableReturns: {},
      historicalIndex: '',
      multiAssetConfig: defaultMultiAssetConfig,
    }

    const { result, rerender } = renderHook(
      props => useReturnConfiguration(props),
      { initialProps: initialParams },
    )

    expect(result.current.fixedRate).toBe(0.05)

    // Update parameters
    const updatedParams = {
      ...initialParams,
      rendite: 7,
    }

    rerender(updatedParams)

    expect(result.current.fixedRate).toBe(0.07)
  })

  it('should handle random seed being undefined', () => {
    const params = {
      returnMode: 'random' as const,
      rendite: 0,
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: undefined,
      variableReturns: {},
      historicalIndex: '',
      multiAssetConfig: defaultMultiAssetConfig,
    }

    const { result } = renderHook(() => useReturnConfiguration(params))

    expect(result.current).toEqual({
      mode: 'random',
      randomConfig: {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: undefined,
      },
    })
  })
})
