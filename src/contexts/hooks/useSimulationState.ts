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

export function useSimulationState(config: SimulationStateConfig) {
  const { initialConfig, extendedInitialConfig, defaultConfig } = config

  const basicFinancial = useBasicFinancialState({
    initialConfig,
    extendedInitialConfig,
    defaultConfig,
  })

  const taxConfig = useTaxConfigurationState({
    extendedInitialConfig,
    defaultConfig,
  })

  const returnConfig = useReturnConfigurationState({
    initialConfig,
    extendedInitialConfig,
    defaultConfig,
  })

  const scenario = useScenarioState()

  const multiAsset = useMultiAssetState({ extendedInitialConfig })

  const inflation = useInflationState({
    extendedInitialConfig,
    defaultConfig,
  })

  const savingsPlan = useSavingsPlanState({ initialConfig })

  const lifeExpectancy = useLifeExpectancyState({
    initialConfig,
    extendedInitialConfig,
    defaultConfig,
  })

  const planningMode = usePlanningModeState({
    extendedInitialConfig,
    defaultConfig,
  })

  const simulationData = useSimulationDataState()

  const withdrawalConfig = useWithdrawalConfigState({
    initialConfig,
    extendedInitialConfig,
    defaultPlanningMode: defaultConfig.planningMode,
  })

  return {
    ...basicFinancial,
    ...taxConfig,
    ...returnConfig,
    ...scenario,
    ...multiAsset,
    ...inflation,
    ...savingsPlan,
    ...lifeExpectancy,
    ...planningMode,
    ...simulationData,
    ...withdrawalConfig,
  }
}
