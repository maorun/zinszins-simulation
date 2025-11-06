import { useSimulation } from '../../contexts/useSimulation'
import type { WithdrawalFormValue } from '../../utils/config-storage'
import type { RMDChangeHandlers } from './RMDWithdrawalConfiguration.helpers'

interface UseRMDHandlersParams {
  isFormMode: boolean
  formValue?: WithdrawalFormValue
  updateFormValue?: (newValue: WithdrawalFormValue) => void
  onChange?: RMDChangeHandlers
}

export function useRMDHandlers({
  isFormMode,
  formValue,
  updateFormValue,
  onChange,
}: UseRMDHandlersParams) {
  const { setLifeExpectancyTable, setCustomLifeExpectancy } = useSimulation()

  const handleAgeChange = (age: number) => {
    if (isFormMode && updateFormValue && formValue) {
      updateFormValue({ ...formValue, rmdStartAge: age })
    }
    else if (onChange) {
      onChange.onStartAgeChange(age)
    }
  }

  const handleTableChange = (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => {
    if (isFormMode) {
      setLifeExpectancyTable(table)
    }
    else if (onChange) {
      onChange.onLifeExpectancyTableChange(table)
    }
  }

  const handleCustomLifeExpectancyChange = (years: number) => {
    if (isFormMode) {
      setCustomLifeExpectancy(years)
    }
    else if (onChange) {
      onChange.onCustomLifeExpectancyChange(years)
    }
  }

  return {
    handleAgeChange,
    handleTableChange,
    handleCustomLifeExpectancyChange,
  }
}
