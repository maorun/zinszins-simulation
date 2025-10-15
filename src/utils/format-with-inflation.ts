import { formatValueWithInflation } from '../components/inflation-helpers'
import type { WithdrawalFormValue } from './config-storage'

/**
 * Format value with inflation adjustment
 */
export function formatWithInflation(params: {
  value: number
  year: number
  allYears: Array<number | null | undefined>
  formValue: WithdrawalFormValue
  showIcon?: boolean
}): string {
  return formatValueWithInflation({
    nominalValue: params.value,
    currentYear: params.year,
    allYears: params.allYears,
    inflationActive: params.formValue.inflationAktiv || false,
    inflationRatePercent: params.formValue.inflationsrate,
    showIcon: params.showIcon,
  })
}
