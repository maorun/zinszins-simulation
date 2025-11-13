import { useState } from 'react'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'
import { createFallbackMultiAssetConfig } from '../../helpers/multi-asset-defaults'

export interface MultiAssetStateConfig {
  extendedInitialConfig: ExtendedSavedConfiguration
}

export function useMultiAssetState(config: MultiAssetStateConfig) {
  const { extendedInitialConfig } = config

  const [multiAssetConfig, setMultiAssetConfig] = useState(() => {
    return extendedInitialConfig.multiAssetConfig || createFallbackMultiAssetConfig()
  })

  const [withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig] = useState(() => {
    const defaultCfg = createFallbackMultiAssetConfig()
    const conservativeConfig = createConservativeConfig(defaultCfg)
    return extendedInitialConfig.withdrawalMultiAssetConfig || conservativeConfig
  })

  return {
    multiAssetConfig,
    setMultiAssetConfig,
    withdrawalMultiAssetConfig,
    setWithdrawalMultiAssetConfig,
  }
}

function createConservativeConfig(
  defaultConfig: import('../../../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig,
) {
  return {
    ...defaultConfig,
    assetClasses: {
      ...defaultConfig.assetClasses,
      stocks_domestic: {
        ...defaultConfig.assetClasses.stocks_domestic,
        targetAllocation: 0.3,
        expectedReturn: 0.06,
        volatility: 0.18,
      },
      stocks_international: {
        ...defaultConfig.assetClasses.stocks_international,
        targetAllocation: 0.15,
        expectedReturn: 0.055,
        volatility: 0.16,
      },
      bonds_government: {
        ...defaultConfig.assetClasses.bonds_government,
        targetAllocation: 0.35,
        expectedReturn: 0.025,
        volatility: 0.04,
      },
      bonds_corporate: {
        ...defaultConfig.assetClasses.bonds_corporate,
        targetAllocation: 0.15,
        expectedReturn: 0.035,
        volatility: 0.06,
      },
    },
  }
}
