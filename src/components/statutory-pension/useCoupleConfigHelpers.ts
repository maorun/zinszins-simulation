import {
  calculateRetirementStartYear,
  type CoupleStatutoryPensionConfig,
  type IndividualStatutoryPensionConfig,
  createDefaultCoupleStatutoryPensionConfig,
} from '../../../helpers/statutory-pension'

export function useInitialConfig(
  config: CoupleStatutoryPensionConfig | null,
  planningMode: 'individual' | 'couple',
  birthYear?: number,
  spouseBirthYear?: number,
): CoupleStatutoryPensionConfig {
  return (
    config ||
    (() => {
      const defaultConfig = createDefaultCoupleStatutoryPensionConfig()
      defaultConfig.planningMode = planningMode
      if (planningMode === 'individual') {
        defaultConfig.individual = {
          enabled: false,
          startYear: calculateRetirementStartYear(planningMode, birthYear, spouseBirthYear) || 2041,
          monthlyAmount: 1500,
          annualIncreaseRate: 1.0,
          taxablePercentage: 80,
          retirementAge: 67,
        }
      }
      return defaultConfig
    })()
  )
}

export function createUpdatePersonConfig(
  currentConfig: CoupleStatutoryPensionConfig,
  onChange: (config: CoupleStatutoryPensionConfig) => void,
) {
  return (personId: 1 | 2, updates: Partial<IndividualStatutoryPensionConfig>) => {
    if (!currentConfig.couple) return

    const updatedConfig = {
      ...currentConfig,
      couple: {
        ...currentConfig.couple,
        [`person${personId}`]: {
          ...currentConfig.couple[`person${personId}`],
          ...updates,
        },
      },
    }
    onChange(updatedConfig)
  }
}

export function createToggleEnabled(
  currentConfig: CoupleStatutoryPensionConfig,
  onChange: (config: CoupleStatutoryPensionConfig) => void,
) {
  return (enabled: boolean) => {
    const updatedConfig = {
      ...currentConfig,
      enabled,
    }
    onChange(updatedConfig)
  }
}
