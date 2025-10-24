import { Info } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import type { WithdrawalFormValue } from '../../utils/config-storage'

interface TaxSectionProps {
  rowData: {
    year: number
    zinsen: number
    bezahlteSteuer: number
    vorabpauschale?: number
    genutzterFreibetrag: number
    guenstigerPruefungResultRealizedGains?: {
      isFavorable: string
      usedTaxRate: number
      explanation: string
    }
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

function TaxDetailRow({
  label,
  value,
  className,
  onInfoClick,
}: {
  label: string
  value: string
  className: string
  onInfoClick?: () => void
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className={`font-semibold text-sm flex items-center ${className}`}>
        {value}
        {onInfoClick && (
          <Info
            className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={onInfoClick}
          />
        )}
      </span>
    </div>
  )
}

/**
 * Section displaying tax-related information: interest, tax paid, Günstigerprüfung, Vorabpauschale, and tax allowance
 */
// eslint-disable-next-line max-lines-per-function -- Large component function
export function TaxSection({
  rowData,
  formValue,
  allYears,
  onCalculationInfoClick,
  formatWithInflation,
}: TaxSectionProps) {
  return (
    <>
      <TaxDetailRow
        label="📈 Zinsen:"
        value={formatWithInflation({
          value: rowData.zinsen,
          year: rowData.year,
          allYears,
          formValue,
          showIcon: true,
        })}
        className="text-cyan-600"
        onInfoClick={() => onCalculationInfoClick('interest', rowData)}
      />

      <TaxDetailRow
        label="💸 Bezahlte Steuer:"
        value={formatCurrency(rowData.bezahlteSteuer)}
        className="text-red-600"
        onInfoClick={() => onCalculationInfoClick('tax', rowData)}
      />

      {rowData.guenstigerPruefungResultRealizedGains && (
        <div className="bg-blue-50 px-2 py-1 rounded space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-600 font-medium">🔍 Günstigerprüfung (Veräußerung):</span>
            <span className="font-semibold text-blue-700 text-sm">
              {rowData.guenstigerPruefungResultRealizedGains.isFavorable === 'personal'
                ? 'Persönlicher Steuersatz'
                : 'Abgeltungssteuer'}
              {' ('}
              {(rowData.guenstigerPruefungResultRealizedGains.usedTaxRate * 100).toFixed(2)}
              %)
            </span>
          </div>
          <div className="text-xs text-blue-600 italic">
            {rowData.guenstigerPruefungResultRealizedGains.explanation}
          </div>
        </div>
      )}

      {rowData.vorabpauschale !== undefined
        && rowData.vorabpauschale > 0 && (
        <TaxDetailRow
          label="📊 Vorabpauschale:"
          value={formatCurrency(rowData.vorabpauschale)}
          className="text-blue-700"
          onInfoClick={() => onCalculationInfoClick('vorabpauschale', rowData)}
        />
      )}

      <TaxDetailRow
        label="🎯 Genutzter Freibetrag:"
        value={formatCurrency(rowData.genutzterFreibetrag)}
        className="text-green-600"
      />
    </>
  )
}
