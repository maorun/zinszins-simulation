import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'
import type { ReturnConfiguration } from '../../helpers/random-returns'
import type { WithdrawalReturnMode } from './SegmentReturnConfiguration'

export function createReturnConfigForMode(
  mode: WithdrawalReturnMode,
  currentConfig: ReturnConfiguration,
): ReturnConfiguration {
  switch (mode) {
    case 'fixed':
      return { mode: 'fixed', fixedRate: 0.05 }
    case 'random':
      return {
        mode: 'random',
        randomConfig: {
          averageReturn: 0.05,
          standardDeviation: 0.12,
          seed: undefined,
        },
      }
    case 'variable':
      return {
        mode: 'variable',
        variableConfig: { yearlyReturns: {} },
      }
    case 'multiasset':
      return {
        mode: 'multiasset',
        multiAssetConfig:
          currentConfig.mode === 'multiasset'
            ? currentConfig.multiAssetConfig
            : createDefaultMultiAssetConfig(),
      }
  }
}

export function getReturnModeFromConfig(
  returnConfig: ReturnConfiguration,
): WithdrawalReturnMode {
  if (returnConfig.mode === 'multiasset') {
    return 'multiasset'
  }
  return returnConfig.mode as WithdrawalReturnMode
}
