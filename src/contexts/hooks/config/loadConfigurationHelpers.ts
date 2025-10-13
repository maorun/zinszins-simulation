import type { ExtendedSavedConfiguration, DefaultConfiguration } from '../../helpers/config-types'
import type { ConfigurationStateSetters } from '../useConfigurationManagement'
import {
  loadBasicConfig,
  loadTaxConfig,
  loadReturnConfig,
  loadInflationConfig,
  loadSparplanConfig,
  loadLifeExpectancyConfig,
  loadPlanningModeConfig,
  loadWithdrawalConfig,
} from '../../helpers/config-loading'
import {
  buildBasicConfigSetters,
  buildTaxConfigSetters,
  buildReturnConfigSetters,
  buildInflationConfigSetters,
  buildSparplanConfigSetters,
  buildLifeExpectancyConfigSetters,
  buildPlanningModeConfigSetters,
  buildWithdrawalConfigSetters,
} from './buildConfigSetters'

export function loadAllConfigurations(
  extendedConfig: ExtendedSavedConfiguration,
  defConfig: DefaultConfiguration,
  setters: ConfigurationStateSetters,
) {
  loadBasicConfig(extendedConfig, defConfig, buildBasicConfigSetters(setters))
  loadTaxConfig(extendedConfig, defConfig, buildTaxConfigSetters(setters))
  loadReturnConfig(extendedConfig, defConfig, buildReturnConfigSetters(setters))
  loadInflationConfig(extendedConfig, defConfig, buildInflationConfigSetters(setters))
  loadSparplanConfig(extendedConfig, buildSparplanConfigSetters(setters))
  loadLifeExpectancyConfig(extendedConfig, defConfig, buildLifeExpectancyConfigSetters(setters))
  loadPlanningModeConfig(extendedConfig, defConfig, buildPlanningModeConfigSetters(setters))
  loadWithdrawalConfig(extendedConfig, buildWithdrawalConfigSetters(setters))
}
