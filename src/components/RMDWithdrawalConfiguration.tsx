import type { WithdrawalFormValue } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import { RMDStartAgeConfig } from './RMDStartAgeConfig'
import { RMDLifeExpectancyTableConfig } from './RMDLifeExpectancyTableConfig'
import { RMDCustomLifeExpectancyConfig } from './RMDCustomLifeExpectancyConfig'
import { RMDCalculationInfo } from './RMDCalculationInfo'
import {
  validateModeProps,
  getCurrentValuesFromForm,
  getCurrentValuesFromDirect,
  type RMDConfigValues,
  type RMDChangeHandlers,
} from './RMDWithdrawalConfiguration.helpers'

export interface RMDWithdrawalConfigurationProps {
  // For existing form-based usage (Einheitlich)
  formValue?: WithdrawalFormValue
  updateFormValue?: (newValue: WithdrawalFormValue) => void

  // For direct state management (Segmentiert)
  values?: RMDConfigValues
  onChange?: RMDChangeHandlers
}

export type { RMDConfigValues, RMDChangeHandlers }

export function RMDWithdrawalConfiguration({
  formValue,
  updateFormValue,
  values,
  onChange,
}: RMDWithdrawalConfigurationProps) {
  // Use global life expectancy settings
  const { lifeExpectancyTable, customLifeExpectancy, setLifeExpectancyTable, setCustomLifeExpectancy } = useSimulation()

  // Determine which mode we're in
  const isFormMode = formValue !== undefined && updateFormValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  validateModeProps(isFormMode, isDirectMode)

  // Get current values based on mode
  const currentValues = isFormMode
    ? getCurrentValuesFromForm(formValue!, lifeExpectancyTable, customLifeExpectancy)
    : getCurrentValuesFromDirect(values!)

  const handleAgeChange = (age: number) => {
    if (isFormMode) {
      updateFormValue!({ ...formValue!, rmdStartAge: age })
    }
    else {
      onChange!.onStartAgeChange(age)
    }
  }

  const handleTableChange = (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => {
    if (isFormMode) {
      setLifeExpectancyTable(table)
    }
    else {
      onChange!.onLifeExpectancyTableChange(table)
    }
  }

  const handleCustomLifeExpectancyChange = (years: number) => {
    if (isFormMode) {
      setCustomLifeExpectancy(years)
    }
    else {
      onChange!.onCustomLifeExpectancyChange(years)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <RMDStartAgeConfig
        value={currentValues.startAge}
        onChange={handleAgeChange}
        inputId={isFormMode ? 'rmdStartAge' : 'rmd-start-age'}
        isFormMode={isFormMode}
      />

      <RMDLifeExpectancyTableConfig
        value={currentValues.lifeExpectancyTable}
        onChange={handleTableChange}
        isFormMode={isFormMode}
      />

      {currentValues.lifeExpectancyTable === 'custom' && (
        <RMDCustomLifeExpectancyConfig
          value={currentValues.customLifeExpectancy || 20}
          startAge={currentValues.startAge}
          onChange={handleCustomLifeExpectancyChange}
          inputId={isFormMode ? 'rmdCustomLifeExpectancy' : 'rmd-custom-life-expectancy'}
          isFormMode={isFormMode}
        />
      )}

      <RMDCalculationInfo startAge={currentValues.startAge} />
    </div>
  )
}
