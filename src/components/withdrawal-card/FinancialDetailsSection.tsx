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

function DetailRow({
  label,
  value,
  className,
}: {
  label: string
  value: string | ReactNode
  className?: string
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className={`font-semibold text-sm ${className || ''}`}>{value}</span>
    </div>
  )
}

/**
 * Section displaying financial details: start capital, withdrawal, monthly amount, inflation and guardrails adjustments
 */
// eslint-disable-next-line max-lines-per-function -- Large component function
export function FinancialDetailsSection({
  rowData,
  formValue,
  allYears,
  onCalculationInfoClick,
  formatWithInflation,
}: FinancialDetailsSectionProps) {
  return (
    <>
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

      {formValue.strategie === 'monatlich_fest' && rowData.monatlicheEntnahme && (
        <DetailRow
          label="📅 Monatlich:"
          value={formatCurrency(rowData.monatlicheEntnahme)}
          className="text-purple-600"
        />
      )}

      {formValue.inflationAktiv && rowData.inflationAnpassung !== undefined && (
        <DetailRow
          label="📈 Inflation:"
          value={(
            <span className="flex items-center">
              {formatCurrency(rowData.inflationAnpassung)}
              <Info
                className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
                onClick={() => onCalculationInfoClick('inflation', rowData)}
              />
            </span>
          )}
          className="text-orange-600"
        />
      )}

      {formValue.strategie === 'monatlich_fest'
        && formValue.guardrailsAktiv
        && rowData.portfolioAnpassung !== undefined && (
        <DetailRow
          label="🛡️ Guardrails:"
          value={formatCurrency(rowData.portfolioAnpassung)}
          className="text-teal-600"
        />
      )}
    </>
  )
}
