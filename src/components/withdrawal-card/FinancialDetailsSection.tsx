import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import type { WithdrawalFormValue } from '../../utils/config-storage'

interface FinancialDetailsSectionProps {
  rowData: {
    startkapital: number
    entnahme: number
    monatlicheEntnahme?: number
    inflationAnpassung?: number
    portfolioAnpassung?: number
    year: number
  }
  formValue: WithdrawalFormValue
  allYears: Array<number | null | undefined>
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
  formatWithInflation: (params: {
    value: number
    year: number
    allYears: Array<number | null | undefined>
    formValue: WithdrawalFormValue
    showIcon?: boolean
  }) => string
}

function DetailRow({ label, value, className }: { label: string; value: string | ReactNode; className?: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className={`font-semibold text-sm ${className || ''}`}>{value}</span>
    </div>
  )
}

type DetailComponentProps = Pick<
  FinancialDetailsSectionProps,
  'rowData' | 'formValue' | 'allYears' | 'formatWithInflation' | 'onCalculationInfoClick'
>

function StartCapitalRow({ rowData, formValue, allYears, formatWithInflation }: DetailComponentProps) {
  return (
    <DetailRow
      label="💰 Startkapital:"
      value={formatWithInflation({
        value: rowData.startkapital,
        year: rowData.year,
        allYears,
        formValue,
        showIcon: true,
      })}
      className="text-green-600"
    />
  )
}

function WithdrawalRow({ rowData, formValue, allYears, formatWithInflation }: DetailComponentProps) {
  return (
    <DetailRow
      label="💸 Entnahme:"
      value={formatWithInflation({
        value: rowData.entnahme,
        year: rowData.year,
        allYears,
        formValue,
        showIcon: true,
      })}
      className="text-red-600"
    />
  )
}

function MonthlyWithdrawalRow({ rowData, formValue }: DetailComponentProps) {
  if (formValue.strategie !== 'monatlich_fest' || !rowData.monatlicheEntnahme) return null

  return (
    <DetailRow label="📅 Monatlich:" value={formatCurrency(rowData.monatlicheEntnahme)} className="text-purple-600" />
  )
}

function InflationAdjustmentRow({ rowData, formValue, onCalculationInfoClick }: DetailComponentProps) {
  if (!formValue.inflationAktiv || rowData.inflationAnpassung === undefined) return null

  return (
    <DetailRow
      label="📈 Inflation:"
      value={
        <span className="flex items-center">
          {formatCurrency(rowData.inflationAnpassung)}
          <Info
            className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => onCalculationInfoClick('inflation', rowData)}
          />
        </span>
      }
      className="text-orange-600"
    />
  )
}

function GuardrailsAdjustmentRow({ rowData, formValue }: DetailComponentProps) {
  if (
    formValue.strategie !== 'monatlich_fest' ||
    !formValue.guardrailsAktiv ||
    rowData.portfolioAnpassung === undefined
  ) {
    return null
  }

  return (
    <DetailRow label="🛡️ Guardrails:" value={formatCurrency(rowData.portfolioAnpassung)} className="text-teal-600" />
  )
}
/**
 * Section displaying financial details: start capital, withdrawal, monthly amount, inflation and guardrails adjustments
 */
export function FinancialDetailsSection(props: FinancialDetailsSectionProps) {
  return (
    <>
      <StartCapitalRow {...props} />
      <WithdrawalRow {...props} />
      <MonthlyWithdrawalRow {...props} />
      <InflationAdjustmentRow {...props} />
      <GuardrailsAdjustmentRow {...props} />
    </>
  )
}
