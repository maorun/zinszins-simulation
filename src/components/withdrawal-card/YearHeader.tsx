import { Info } from 'lucide-react'
import type { WithdrawalFormValue } from '../../utils/config-storage'

interface YearHeaderProps {
  year: number
  endkapital: number
  allYears: Array<number | null | undefined>
  formValue: WithdrawalFormValue
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
  rowData: unknown
  formatWithInflation: (params: {
    value: number
    year: number
    allYears: Array<number | null | undefined>
    formValue: WithdrawalFormValue
    showIcon?: boolean
  }) => string
}

/**
 * Header section for withdrawal year card showing year and end capital
 */
export function YearHeader({
  year,
  endkapital,
  allYears,
  formValue,
  onCalculationInfoClick,
  rowData,
  formatWithInflation,
}: YearHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
      <span className="font-semibold text-gray-800 text-base">
        {`📅 ${year}`}
      </span>
      <span className="font-bold text-blue-600 text-lg flex items-center">
        🎯
        {' '}
        {formatWithInflation({
          value: endkapital,
          year,
          allYears,
          formValue,
          showIcon: true,
        })}
        <Info
          className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
          onClick={() => onCalculationInfoClick('endkapital', rowData)}
        />
      </span>
    </div>
  )
}
