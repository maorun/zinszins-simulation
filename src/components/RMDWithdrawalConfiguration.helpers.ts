import type { WithdrawalFormValue } from '../utils/config-storage'

export interface RMDConfigValues {
  startAge: number
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  customLifeExpectancy?: number
}

export interface RMDChangeHandlers {
  onStartAgeChange: (age: number) => void
  onLifeExpectancyTableChange: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
  onCustomLifeExpectancyChange: (years: number) => void
}

export interface RMDFormValues {
  rmdStartAge: number
}

const DEFAULT_VALUES: RMDConfigValues = {
  startAge: 65,
  lifeExpectancyTable: 'german_2020_22',
  customLifeExpectancy: 20,
}

export function getDefaultValues(): RMDConfigValues {
  return { ...DEFAULT_VALUES }
}

export function getCurrentValuesFromForm(
  formValue: WithdrawalFormValue,
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom',
  customLifeExpectancy: number,
): RMDConfigValues {
  return {
    startAge: formValue.rmdStartAge,
    lifeExpectancyTable,
    customLifeExpectancy,
  }
}

export function getCurrentValuesFromDirect(
  values: RMDConfigValues,
): RMDConfigValues {
  return {
    ...DEFAULT_VALUES,
    ...values,
  }
}

export function validateModeProps(isFormMode: boolean, isDirectMode: boolean): void {
  if (!isFormMode && !isDirectMode) {
    throw new Error('RMDWithdrawalConfiguration requires either (formValue + updateFormValue) or (values + onChange)')
  }
}
