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

/**
 * Section displaying tax-related information: interest, tax paid, Günstigerprüfung, Vorabpauschale, and tax allowance
 */
export function TaxSection({
  rowData,
  formValue,
  allYears,
  onCalculationInfoClick,
  formatWithInflation,
}: TaxSectionProps) {
  return (
    <>
      {/* Interest */}
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">📈 Zinsen:</span>
        <span className="font-semibold text-cyan-600 text-sm flex items-center">
          {formatWithInflation({
            value: rowData.zinsen,
            year: rowData.year,
            allYears,
            formValue,
            showIcon: true,
          })}
          <Info
            className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => onCalculationInfoClick('interest', rowData)}
          />
        </span>
      </div>

      {/* Tax paid */}
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">💸 Bezahlte Steuer:</span>
        <span className="font-semibold text-red-600 text-sm flex items-center">
          {formatCurrency(rowData.bezahlteSteuer)}
          <Info
            className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => onCalculationInfoClick('tax', rowData)}
          />
        </span>
      </div>

      {/* Günstigerprüfung (realized gains) */}
      {rowData.guenstigerPruefungResultRealizedGains && (
        <div className="bg-blue-50 px-2 py-1 rounded space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-600 font-medium">🔍 Günstigerprüfung (Veräußerung):</span>
            <span className="font-semibold text-blue-700 text-sm">
              {rowData.guenstigerPruefungResultRealizedGains.isFavorable === 'personal' ? 'Persönlicher Steuersatz' : 'Abgeltungssteuer'}
              {' '}
              (
              {(rowData.guenstigerPruefungResultRealizedGains.usedTaxRate * 100).toFixed(2)}
              %)
            </span>
          </div>
          <div className="text-xs text-blue-600 italic">
            {rowData.guenstigerPruefungResultRealizedGains.explanation}
          </div>
        </div>
      )}

      {/* Vorabpauschale */}
      {rowData.vorabpauschale !== undefined && rowData.vorabpauschale > 0 && (
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">📊 Vorabpauschale:</span>
          <span className="font-semibold text-blue-700 text-sm flex items-center">
            {formatCurrency(rowData.vorabpauschale)}
            <Info
              className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
              onClick={() => onCalculationInfoClick('vorabpauschale', rowData)}
            />
          </span>
        </div>
      )}

      {/* Tax allowance used */}
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">🎯 Genutzter Freibetrag:</span>
        <span className="font-semibold text-green-600 text-sm">
          {formatCurrency(rowData.genutzterFreibetrag)}
        </span>
      </div>
    </>
  )
}
