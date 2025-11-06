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
          <Info className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800" onClick={onInfoClick} />
        )}
      </span>
    </div>
  )
}

function GuenstigerpruefungInfo({
  guenstigerPruefungResultRealizedGains,
}: {
  guenstigerPruefungResultRealizedGains: NonNullable<
    TaxSectionProps['rowData']['guenstigerPruefungResultRealizedGains']
  >
}) {
  return (
    <div className="bg-blue-50 px-2 py-1 rounded space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-blue-600 font-medium">🔍 Günstigerprüfung (Veräußerung):</span>
        <span className="font-semibold text-blue-700 text-sm">
          {guenstigerPruefungResultRealizedGains.isFavorable === 'personal'
            ? 'Persönlicher Steuersatz'
            : 'Abgeltungssteuer'}
          {' ('}
          {(guenstigerPruefungResultRealizedGains.usedTaxRate * 100).toFixed(2)}
          %)
        </span>
      </div>
      <div className="text-xs text-blue-600 italic">{guenstigerPruefungResultRealizedGains.explanation}</div>
    </div>
  )
}

function VorabpauschaleInfo({
  vorabpauschale,
  onCalculationInfoClick,
  rowData,
}: {
  vorabpauschale: number
  onCalculationInfoClick: TaxSectionProps['onCalculationInfoClick']
  rowData: TaxSectionProps['rowData']
}) {
  if (vorabpauschale <= 0) {
    return null
  }

  return (
    <TaxDetailRow
      label="📊 Vorabpauschale:"
      value={formatCurrency(vorabpauschale)}
      className="text-blue-700"
      onInfoClick={() => onCalculationInfoClick('vorabpauschale', rowData)}
    />
  )
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
        <GuenstigerpruefungInfo guenstigerPruefungResultRealizedGains={rowData.guenstigerPruefungResultRealizedGains} />
      )}

      {rowData.vorabpauschale !== undefined && (
        <VorabpauschaleInfo
          vorabpauschale={rowData.vorabpauschale}
          onCalculationInfoClick={onCalculationInfoClick}
          rowData={rowData}
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
