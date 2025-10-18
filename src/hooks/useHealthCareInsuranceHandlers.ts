import { useCallback } from 'react'
import {
  createDefaultHealthCareInsuranceConfig,
  createDefaultCoupleHealthInsuranceConfig,
  createDefaultFamilyInsuranceThresholds,
  type CoupleHealthInsuranceConfig,
} from '../../helpers/health-care-insurance'
import type { WithdrawalFormValue } from '../utils/config-storage'

/**
 * Helper to get or create couple config with defaults
 */
function getCoupleConfigOrDefault(formValue: WithdrawalFormValue): CoupleHealthInsuranceConfig {
  return formValue.healthCareInsuranceConfig?.coupleConfig
    || createDefaultCoupleHealthInsuranceConfig()
}

/**
 * Helper to build health care insurance config update with couple data
 */
function buildHealthCareConfigUpdate(
  formValue: WithdrawalFormValue,
  coupleConfig: CoupleHealthInsuranceConfig,
): Partial<WithdrawalFormValue> {
  return {
    healthCareInsuranceConfig: {
      ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
      coupleConfig,
    },
  }
}

/**
 * Custom hook to manage health care insurance configuration handlers
 * Extracts complex handler logic from EntnahmeSimulationsAusgabe component
 */
export function useHealthCareInsuranceHandlers(
  formValue: WithdrawalFormValue,
  updateFormValue: (value: Partial<WithdrawalFormValue>) => void,
) {
  // Base configuration handlers
  const handleEnabledChange = useCallback(
    (enabled: boolean) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          enabled,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleInsuranceTypeChange = useCallback(
    (insuranceType: 'statutory' | 'private') => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          insuranceType,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleIncludeEmployerContributionChange = useCallback(
    (includeEmployerContribution: boolean) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          includeEmployerContribution,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  // Statutory insurance handlers
  const handleStatutoryHealthInsuranceRateChange = useCallback(
    (rate: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          statutoryHealthInsuranceRate: rate,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleStatutoryCareInsuranceRateChange = useCallback(
    (rate: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          statutoryCareInsuranceRate: rate,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleStatutoryMinimumIncomeBaseChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          statutoryMinimumIncomeBase: amount,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleStatutoryMaximumIncomeBaseChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          statutoryMaximumIncomeBase: amount,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePrivateHealthInsuranceMonthlyChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          privateHealthInsuranceMonthly: amount,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePrivateCareInsuranceMonthlyChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          privateCareInsuranceMonthly: amount,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePrivateInsuranceInflationRateChange = useCallback(
    (rate: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          privateInsuranceInflationRate: rate,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleRetirementStartYearChange = useCallback(
    (year: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          retirementStartYear: year,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleAdditionalCareInsuranceForChildlessChange = useCallback(
    (enabled: boolean) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          additionalCareInsuranceForChildless: enabled,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleAdditionalCareInsuranceAgeChange = useCallback(
    (age: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          additionalCareInsuranceAge: age,
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  // Couple-specific handlers
  const handleCoupleStrategyChange = useCallback(
    (strategy: 'individual' | 'family' | 'optimize') => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            strategy,
          },
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleFamilyInsuranceThresholdRegularChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            familyInsuranceThresholds: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.familyInsuranceThresholds
                || createDefaultFamilyInsuranceThresholds()),
              regularEmploymentLimit: amount,
            },
          },
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handleFamilyInsuranceThresholdMiniJobChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            familyInsuranceThresholds: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.familyInsuranceThresholds
                || createDefaultFamilyInsuranceThresholds()),
              miniJobLimit: amount,
            },
          },
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePerson1NameChange = useCallback(
    (name: string) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            person1: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person1
                || createDefaultCoupleHealthInsuranceConfig().person1),
              name,
            },
          },
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePerson1WithdrawalShareChange = useCallback(
    (share: number) => {
      const coupleConfig = getCoupleConfigOrDefault(formValue)
      const defaults = createDefaultCoupleHealthInsuranceConfig()

      const updatedCoupleConfig: CoupleHealthInsuranceConfig = {
        ...coupleConfig,
        person1: {
          ...(coupleConfig.person1 || defaults.person1),
          withdrawalShare: share,
        },
        person2: {
          ...(coupleConfig.person2 || defaults.person2),
          withdrawalShare: 1 - share,
        },
      }

      updateFormValue(buildHealthCareConfigUpdate(formValue, updatedCoupleConfig))
    },
    [formValue, updateFormValue],
  )

  const handlePerson1OtherIncomeAnnualChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            person1: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person1
                || createDefaultCoupleHealthInsuranceConfig().person1),
              otherIncomeAnnual: amount,
            },
          },
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePerson1AdditionalCareInsuranceForChildlessChange = useCallback(
    (enabled: boolean) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            person1: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person1
                || createDefaultCoupleHealthInsuranceConfig().person1),
              additionalCareInsuranceForChildless: enabled,
            },
          },
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePerson2NameChange = useCallback(
    (name: string) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            person2: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person2
                || createDefaultCoupleHealthInsuranceConfig().person2),
              name,
            },
          },
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePerson2WithdrawalShareChange = useCallback(
    (share: number) => {
      const coupleConfig = getCoupleConfigOrDefault(formValue)
      const defaults = createDefaultCoupleHealthInsuranceConfig()

      const updatedCoupleConfig: CoupleHealthInsuranceConfig = {
        ...coupleConfig,
        person1: {
          ...(coupleConfig.person1 || defaults.person1),
          withdrawalShare: 1 - share,
        },
        person2: {
          ...(coupleConfig.person2 || defaults.person2),
          withdrawalShare: share,
        },
      }

      updateFormValue(buildHealthCareConfigUpdate(formValue, updatedCoupleConfig))
    },
    [formValue, updateFormValue],
  )

  const handlePerson2OtherIncomeAnnualChange = useCallback(
    (amount: number) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            person2: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person2
                || createDefaultCoupleHealthInsuranceConfig().person2),
              otherIncomeAnnual: amount,
            },
          },
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  const handlePerson2AdditionalCareInsuranceForChildlessChange = useCallback(
    (enabled: boolean) => {
      updateFormValue({
        healthCareInsuranceConfig: {
          ...(formValue.healthCareInsuranceConfig || createDefaultHealthCareInsuranceConfig()),
          coupleConfig: {
            ...(formValue.healthCareInsuranceConfig?.coupleConfig
              || createDefaultCoupleHealthInsuranceConfig()),
            person2: {
              ...(formValue.healthCareInsuranceConfig?.coupleConfig?.person2
                || createDefaultCoupleHealthInsuranceConfig().person2),
              additionalCareInsuranceForChildless: enabled,
            },
          },
        },
      })
    },
    [formValue.healthCareInsuranceConfig, updateFormValue],
  )

  return {
    // Base configuration handlers
    onEnabledChange: handleEnabledChange,
    onInsuranceTypeChange: handleInsuranceTypeChange,
    onIncludeEmployerContributionChange: handleIncludeEmployerContributionChange,
    // Statutory insurance handlers
    onStatutoryHealthInsuranceRateChange: handleStatutoryHealthInsuranceRateChange,
    onStatutoryCareInsuranceRateChange: handleStatutoryCareInsuranceRateChange,
    onStatutoryMinimumIncomeBaseChange: handleStatutoryMinimumIncomeBaseChange,
    onStatutoryMaximumIncomeBaseChange: handleStatutoryMaximumIncomeBaseChange,
    // Private insurance handlers
    onPrivateHealthInsuranceMonthlyChange: handlePrivateHealthInsuranceMonthlyChange,
    onPrivateCareInsuranceMonthlyChange: handlePrivateCareInsuranceMonthlyChange,
    onPrivateInsuranceInflationRateChange: handlePrivateInsuranceInflationRateChange,
    // General handlers
    onRetirementStartYearChange: handleRetirementStartYearChange,
    onAdditionalCareInsuranceForChildlessChange: handleAdditionalCareInsuranceForChildlessChange,
    onAdditionalCareInsuranceAgeChange: handleAdditionalCareInsuranceAgeChange,
    // Couple-specific handlers
    onCoupleStrategyChange: handleCoupleStrategyChange,
    onFamilyInsuranceThresholdRegularChange: handleFamilyInsuranceThresholdRegularChange,
    onFamilyInsuranceThresholdMiniJobChange: handleFamilyInsuranceThresholdMiniJobChange,
    onPerson1NameChange: handlePerson1NameChange,
    onPerson1WithdrawalShareChange: handlePerson1WithdrawalShareChange,
    onPerson1OtherIncomeAnnualChange: handlePerson1OtherIncomeAnnualChange,
    onPerson1AdditionalCareInsuranceForChildlessChange:
      handlePerson1AdditionalCareInsuranceForChildlessChange,
    onPerson2NameChange: handlePerson2NameChange,
    onPerson2WithdrawalShareChange: handlePerson2WithdrawalShareChange,
    onPerson2OtherIncomeAnnualChange: handlePerson2OtherIncomeAnnualChange,
    onPerson2AdditionalCareInsuranceForChildlessChange:
      handlePerson2AdditionalCareInsuranceForChildlessChange,
  }
}
