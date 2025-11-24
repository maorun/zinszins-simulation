import { useState } from 'react'
import type { SavedConfiguration, WithdrawalConfiguration } from '../../../utils/config-storage'
import {
  convertLegacyToCoupleConfig,
  type StatutoryPensionConfig,
  type CoupleStatutoryPensionConfig,
} from '../../../../helpers/statutory-pension'
import {
  createDefaultCareCostConfiguration,
  type CareCostConfiguration,
} from '../../../../helpers/care-cost-simulation'
import type { FinancialGoal } from '../../../../helpers/financial-goals'
import { defaultEmergencyFundConfig, type EmergencyFundConfig } from '../../../../helpers/emergency-fund'
import type { TermLifeInsuranceConfig } from '../../../../helpers/term-life-insurance'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'

export interface WithdrawalConfigStateConfig {
  initialConfig: SavedConfiguration
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultPlanningMode: 'individual' | 'couple'
}

export function useWithdrawalConfigState(config: WithdrawalConfigStateConfig) {
  const { initialConfig, extendedInitialConfig, defaultPlanningMode } = config

  const [withdrawalConfig, setWithdrawalConfig] = useState<WithdrawalConfiguration | null>(
    initialConfig.withdrawal || null,
  )

  const [statutoryPensionConfig, setStatutoryPensionConfig] = useState<StatutoryPensionConfig | null>(
    initialConfig.statutoryPensionConfig || null,
  )

  const [coupleStatutoryPensionConfig, setCoupleStatutoryPensionConfig] = useState<CoupleStatutoryPensionConfig | null>(
    () => {
      const legacyConfig = initialConfig.statutoryPensionConfig
      const currentPlanningMode = extendedInitialConfig.planningMode || defaultPlanningMode
      if (legacyConfig && !initialConfig.coupleStatutoryPensionConfig) {
        return convertLegacyToCoupleConfig(legacyConfig, currentPlanningMode)
      }
      return initialConfig.coupleStatutoryPensionConfig || null
    },
  )

  const [careCostConfiguration, setCareCostConfiguration] = useState<CareCostConfiguration>(() => {
    const savedConfig = extendedInitialConfig.careCostConfiguration
    if (savedConfig) {
      return savedConfig
    }
    return createDefaultCareCostConfiguration()
  })

  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(extendedInitialConfig.financialGoals || [])

  const [emergencyFundConfig, setEmergencyFundConfig] = useState<EmergencyFundConfig>(() => {
    return extendedInitialConfig.emergencyFundConfig || defaultEmergencyFundConfig
  })

  const [termLifeInsuranceConfig, setTermLifeInsuranceConfig] = useState<TermLifeInsuranceConfig | null>(
    extendedInitialConfig.termLifeInsuranceConfig || null,
  )

  return {
    withdrawalConfig,
    setWithdrawalConfig,
    statutoryPensionConfig,
    setStatutoryPensionConfig,
    coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig,
    careCostConfiguration,
    setCareCostConfiguration,
    financialGoals,
    setFinancialGoals,
    emergencyFundConfig,
    setEmergencyFundConfig,
    termLifeInsuranceConfig,
    setTermLifeInsuranceConfig,
  }
}
