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

/**
 * Section displaying financial details: start capital, withdrawal, monthly amount, inflation and guardrails adjustments
 */
export function FinancialDetailsSection({
  rowData,
  formValue,
  allYears,
  onCalculationInfoClick,
  formatWithInflation,
}: FinancialDetailsSectionProps) {
  return (
    <>
      {/* Startkapital */}
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">💰 Startkapital:</span>
        <span className="font-semibold text-green-600 text-sm">
          {formatWithInflation({
            value: rowData.startkapital,
            year: rowData.year,
            allYears,
            formValue,
            showIcon: true,
          })}
        </span>
      </div>

      {/* Entnahme */}
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">💸 Entnahme:</span>
        <span className="font-semibold text-red-600 text-sm">
          {formatWithInflation({
            value: rowData.entnahme,
            year: rowData.year,
            allYears,
            formValue,
            showIcon: true,
          })}
        </span>
      </div>

      {/* Monthly withdrawal (monatlich_fest strategy) */}
      {formValue.strategie === 'monatlich_fest' && rowData.monatlicheEntnahme && (
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">📅 Monatlich:</span>
          <span className="font-semibold text-purple-600 text-sm">
            {formatCurrency(rowData.monatlicheEntnahme)}
          </span>
        </div>
      )}

      {/* Inflation adjustment */}
      {formValue.inflationAktiv && rowData.inflationAnpassung !== undefined && (
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">📈 Inflation:</span>
          <span className="font-semibold text-orange-600 text-sm flex items-center">
            {formatCurrency(rowData.inflationAnpassung)}
            <Info
              className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
              onClick={() => onCalculationInfoClick('inflation', rowData)}
            />
          </span>
        </div>
      )}

      {/* Guardrails adjustment */}
      {formValue.strategie === 'monatlich_fest'
        && formValue.guardrailsAktiv
        && rowData.portfolioAnpassung !== undefined && (
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">🛡️ Guardrails:</span>
          <span className="font-semibold text-teal-600 text-sm">
            {formatCurrency(rowData.portfolioAnpassung)}
          </span>
        </div>
      )}
    </>
  )
}
