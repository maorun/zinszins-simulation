import type { WithdrawalFormValue } from '../utils/config-storage'
import { useSimulation } from '../contexts/useSimulation'
import { RMDStartAgeConfig } from './RMDStartAgeConfig'
import { RMDLifeExpectancyTableConfig } from './RMDLifeExpectancyTableConfig'
import { RMDCustomLifeExpectancyConfig } from './RMDCustomLifeExpectancyConfig'
import { RMDCalculationInfo } from './RMDCalculationInfo'
import { useRMDHandlers } from './RMDWithdrawalConfiguration.hooks'
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
  const { lifeExpectancyTable, customLifeExpectancy } = useSimulation()

  const isFormMode = formValue !== undefined && updateFormValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  validateModeProps(isFormMode, isDirectMode)

  const currentValues = isFormMode
    ? getCurrentValuesFromForm(formValue!, lifeExpectancyTable, customLifeExpectancy)
    : getCurrentValuesFromDirect(values!)

  const { handleAgeChange, handleTableChange, handleCustomLifeExpectancyChange } = useRMDHandlers({
    isFormMode,
    formValue,
    updateFormValue,
    onChange,
  })

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
