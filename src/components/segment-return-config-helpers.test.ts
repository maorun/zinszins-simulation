import { describe, it, expect } from 'vitest'
import {
  createReturnConfigForMode,
  getReturnModeFromConfig,
} from './segment-return-config-helpers'
import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'
import type { ReturnConfiguration } from '../utils/random-returns'

describe('segment-return-config-helpers', () => {
  describe('getReturnModeFromConfig', () => {
    it('returns fixed for fixed mode', () => {
      const config: ReturnConfiguration = {
        mode: 'fixed',
        fixedRate: 0.05,
      }
      expect(getReturnModeFromConfig(config)).toBe('fixed')
    })

    it('returns random for random mode', () => {
      const config: ReturnConfiguration = {
        mode: 'random',
        randomConfig: {
          averageReturn: 0.07,
          standardDeviation: 0.12,
          seed: undefined,
        },
      }
      expect(getReturnModeFromConfig(config)).toBe('random')
    })

    it('returns variable for variable mode', () => {
      const config: ReturnConfiguration = {
        mode: 'variable',
        variableConfig: {
          yearlyReturns: {},
        },
      }
      expect(getReturnModeFromConfig(config)).toBe('variable')
    })

    it('returns multiasset for multiasset mode', () => {
      const config: ReturnConfiguration = {
        mode: 'multiasset',
        multiAssetConfig: createDefaultMultiAssetConfig(),
      }
      expect(getReturnModeFromConfig(config)).toBe('multiasset')
    })
  })

  describe('createReturnConfigForMode', () => {
    it('creates fixed return config', () => {
      const currentConfig: ReturnConfiguration = {
        mode: 'random',
        randomConfig: {
          averageReturn: 0.07,
          standardDeviation: 0.12,
          seed: undefined,
        },
      }

      const result = createReturnConfigForMode('fixed', currentConfig)

      expect(result).toEqual({
        mode: 'fixed',
        fixedRate: 0.05,
      })
    })

    it('creates random return config', () => {
      const currentConfig: ReturnConfiguration = {
        mode: 'fixed',
        fixedRate: 0.05,
      }

      const result = createReturnConfigForMode('random', currentConfig)

      expect(result).toEqual({
        mode: 'random',
        randomConfig: {
          averageReturn: 0.05,
          standardDeviation: 0.12,
          seed: undefined,
        },
      })
    })

    it('creates variable return config', () => {
      const currentConfig: ReturnConfiguration = {
        mode: 'fixed',
        fixedRate: 0.05,
      }

      const result = createReturnConfigForMode('variable', currentConfig)

      expect(result).toEqual({
        mode: 'variable',
        variableConfig: {
          yearlyReturns: {},
        },
      })
    })

    it('creates multiasset return config with default values when current is not multiasset', () => {
      const currentConfig: ReturnConfiguration = {
        mode: 'fixed',
        fixedRate: 0.05,
      }

      const result = createReturnConfigForMode('multiasset', currentConfig)

      expect(result.mode).toBe('multiasset')
      expect(result).toHaveProperty('multiAssetConfig')
    })

    it('preserves multiasset config when switching to multiasset mode from multiasset', () => {
      const customConfig = createDefaultMultiAssetConfig()
      customConfig.enabled = true

      const currentConfig: ReturnConfiguration = {
        mode: 'multiasset',
        multiAssetConfig: customConfig,
      }

      const result = createReturnConfigForMode('multiasset', currentConfig)

      expect(result).toEqual({
        mode: 'multiasset',
        multiAssetConfig: customConfig,
      })
    })
  })
})
