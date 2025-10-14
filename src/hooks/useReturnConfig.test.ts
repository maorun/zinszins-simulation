import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useReturnConfig } from './useReturnConfig'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'

describe('useReturnConfig', () => {
  it('should build fixed return configuration', () => {
    const { result } = renderHook(() =>
      useReturnConfig({
        returnMode: 'fixed',
        rendite: 7,
        averageReturn: 0,
        standardDeviation: 0,
        randomSeed: 42,
        variableReturns: {},
        historicalIndex: '',
        multiAssetConfig: null,
      }),
    )

    expect(result.current.mode).toBe('fixed')
    expect(result.current.fixedRate).toBe(0.07)
  })

  it('should build random return configuration', () => {
    const { result } = renderHook(() =>
      useReturnConfig({
        returnMode: 'random',
        rendite: 0,
        averageReturn: 7,
        standardDeviation: 15,
        randomSeed: 42,
        variableReturns: {},
        historicalIndex: '',
        multiAssetConfig: null,
      }),
    )

    expect(result.current.mode).toBe('random')
    expect(result.current.randomConfig).toEqual({
      averageReturn: 0.07,
      standardDeviation: 0.15,
      seed: 42,
    })
  })

  it('should build variable return configuration', () => {
    const variableReturns = {
      2024: 5,
      2025: 7,
      2026: 9,
    }

    const { result } = renderHook(() =>
      useReturnConfig({
        returnMode: 'variable',
        rendite: 0,
        averageReturn: 0,
        standardDeviation: 0,
        randomSeed: 42,
        variableReturns,
        historicalIndex: '',
        multiAssetConfig: null,
      }),
    )

    expect(result.current.mode).toBe('variable')
    expect(result.current.variableConfig).toEqual({
      yearlyReturns: variableReturns,
    })
  })

  it('should build historical return configuration', () => {
    const { result } = renderHook(() =>
      useReturnConfig({
        returnMode: 'historical',
        rendite: 0,
        averageReturn: 0,
        standardDeviation: 0,
        randomSeed: 42,
        variableReturns: {},
        historicalIndex: 'MSCI_WORLD',
        multiAssetConfig: null,
      }),
    )

    expect(result.current.mode).toBe('historical')
    expect(result.current.historicalConfig).toEqual({
      indexId: 'MSCI_WORLD',
    })
  })

  it('should build multi-asset return configuration', () => {
    const multiAssetConfig: MultiAssetPortfolioConfig = {
      enabled: true,
      assetClasses: {
        stocks_domestic: {
          name: 'Stocks',
          expectedReturn: 0.08,
          volatility: 0.20,
          targetAllocation: 0.70,
          enabled: true,
          description: 'Domestic stocks',
          taxCategory: 'equity',
        },
        bonds_government: {
          name: 'Bonds',
          expectedReturn: 0.03,
          volatility: 0.05,
          targetAllocation: 0.30,
          enabled: true,
          description: 'Government bonds',
          taxCategory: 'bond',
        },
        stocks_international: {
          name: 'International Stocks',
          expectedReturn: 0.075,
          volatility: 0.18,
          targetAllocation: 0,
          enabled: false,
          description: 'International stocks',
          taxCategory: 'equity',
        },
        bonds_corporate: {
          name: 'Corporate Bonds',
          expectedReturn: 0.04,
          volatility: 0.08,
          targetAllocation: 0,
          enabled: false,
          description: 'Corporate bonds',
          taxCategory: 'bond',
        },
        real_estate: {
          name: 'Real Estate',
          expectedReturn: 0.06,
          volatility: 0.15,
          targetAllocation: 0,
          enabled: false,
          description: 'REITs',
          taxCategory: 'reit',
        },
        commodities: {
          name: 'Commodities',
          expectedReturn: 0.04,
          volatility: 0.25,
          targetAllocation: 0,
          enabled: false,
          description: 'Commodities',
          taxCategory: 'commodity',
        },
        cash: {
          name: 'Cash',
          expectedReturn: 0.01,
          volatility: 0,
          targetAllocation: 0,
          enabled: false,
          description: 'Cash',
          taxCategory: 'cash',
        },
      },
      rebalancing: {
        frequency: 'annually',
        threshold: 0.05,
        useThreshold: false,
      },
      simulation: {
        useCorrelation: true,
        seed: 42,
      },
    }

    const { result } = renderHook(() =>
      useReturnConfig({
        returnMode: 'multiasset',
        rendite: 0,
        averageReturn: 0,
        standardDeviation: 0,
        randomSeed: 42,
        variableReturns: {},
        historicalIndex: '',
        multiAssetConfig,
      }),
    )

    expect(result.current.mode).toBe('multiasset')
    expect(result.current.multiAssetConfig).toEqual(multiAssetConfig)
  })

  it('should recalculate when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({
        returnMode,
        rendite,
        averageReturn,
        standardDeviation,
        randomSeed,
        variableReturns,
        historicalIndex,
        multiAssetConfig,
      }) =>
        useReturnConfig({
          returnMode,
          rendite,
          averageReturn,
          standardDeviation,
          randomSeed,
          variableReturns,
          historicalIndex,
          multiAssetConfig,
        }),
      {
        initialProps: {
          returnMode: 'fixed' as 'fixed' | 'random',
          rendite: 5,
          averageReturn: 0,
          standardDeviation: 0,
          randomSeed: 42,
          variableReturns: {},
          historicalIndex: '',
          multiAssetConfig: null,
        },
      },
    )

    expect(result.current.mode).toBe('fixed')
    expect(result.current.fixedRate).toBe(0.05)

    // Change to random mode
    rerender({
      returnMode: 'random',
      rendite: 5,
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: 42,
      variableReturns: {},
      historicalIndex: '',
      multiAssetConfig: null,
    })

    expect(result.current.mode).toBe('random')
    expect(result.current.randomConfig).toEqual({
      averageReturn: 0.07,
      standardDeviation: 0.15,
      seed: 42,
    })
  })
})
