import type { SavedConfiguration } from '../../utils/config-storage'
import type { ExtendedSavedConfiguration } from '../helpers/config-types'
import { useBasicFinancialState } from './state/useBasicFinancialState'
import { useTaxConfigurationState } from './state/useTaxConfigurationState'
import { useReturnConfigurationState } from './state/useReturnConfigurationState'
import { useScenarioState } from './state/useScenarioState'
import { useMultiAssetState } from './state/useMultiAssetState'
import { useInflationState } from './state/useInflationState'
import { useSavingsPlanState } from './state/useSavingsPlanState'
import { useLifeExpectancyState } from './state/useLifeExpectancyState'
import { usePlanningModeState } from './state/usePlanningModeState'
import { useSimulationDataState } from './state/useSimulationDataState'
import { useWithdrawalConfigState } from './state/useWithdrawalConfigState'

export interface SimulationStateConfig {
  initialConfig: SavedConfiguration
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: import('../helpers/default-config').DefaultConfigType
}

function useConfigurationStates(config: SimulationStateConfig) {
  const { initialConfig, extendedInitialConfig, defaultConfig } = config

  return {
    basicFinancial: useBasicFinancialState({
      initialConfig,
      extendedInitialConfig,
      defaultConfig,
    }),
    taxConfig: useTaxConfigurationState({
      extendedInitialConfig,
      defaultConfig,
    }),
    returnConfig: useReturnConfigurationState({
      initialConfig,
      extendedInitialConfig,
      defaultConfig,
    }),
    scenario: useScenarioState(),
    multiAsset: useMultiAssetState({ extendedInitialConfig }),
  }
}

function useOperationalStates(config: SimulationStateConfig) {
  const { initialConfig, extendedInitialConfig, defaultConfig } = config

  return {
    inflation: useInflationState({
      extendedInitialConfig,
      defaultConfig,
    }),
    savingsPlan: useSavingsPlanState({ initialConfig }),
    lifeExpectancy: useLifeExpectancyState({
      initialConfig,
      extendedInitialConfig,
      defaultConfig,
    }),
    planningMode: usePlanningModeState({
      extendedInitialConfig,
      defaultConfig,
    }),
    simulationData: useSimulationDataState(),
    withdrawalConfig: useWithdrawalConfigState({
      initialConfig,
      extendedInitialConfig,
      defaultPlanningMode: defaultConfig.planningMode,
    }),
  }
}

export function useSimulationState(config: SimulationStateConfig) {
  const configStates = useConfigurationStates(config)
  const operationalStates = useOperationalStates(config)

  return {
    ...configStates.basicFinancial,
    ...configStates.taxConfig,
    ...configStates.returnConfig,
    ...configStates.scenario,
    ...configStates.multiAsset,
    ...operationalStates.inflation,
    ...operationalStates.savingsPlan,
    ...operationalStates.lifeExpectancy,
    ...operationalStates.planningMode,
    ...operationalStates.simulationData,
    ...operationalStates.withdrawalConfig,
  }
}
