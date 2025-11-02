import { formatInflationAdjustedValue } from '../../utils/inflation-adjustment'
import { GlossaryTerm } from '../GlossaryTerm'
import type { SparplanElement } from '../../utils/sparplan-utils'
import type { VorabpauschaleDetails } from '../../utils/simulate'
import type { PortfolioProgressionEntry } from '../../utils/summary-utils'
import React from 'react'

// Helper to format numbers with thousands separators
const thousands = (value: string | number) =>
  Number(value).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// Type for calculation info click data
interface CalculationInfoData {
  jahr: number
  [key: string]: number | string | undefined
}

// Info icon component for calculation explanations
const InfoIcon = ({ onClick }: { onClick: () => void }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      marginLeft: '0.5rem',
      cursor: 'pointer',
      color: '#1976d2',
      verticalAlign: 'middle',
    }}
    onClick={onClick}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
    <path d="M12,17h.01"></path>
  </svg>
)

// Helper component to render Günstigerprüfung information
function GuenstigerpruefungDisplay({
  elemente,
  jahr,
}: {
  elemente?: SparplanElement[]
  jahr: number
}) {
  const elementWithGuenstigerPruefung = elemente?.find(el =>
    el.simulation[jahr]?.vorabpauschaleDetails?.guenstigerPruefungResult,
  )

  const pruefungResult = elementWithGuenstigerPruefung
    ?.simulation[jahr]?.vorabpauschaleDetails?.guenstigerPruefungResult

  if (!pruefungResult) {
    return null
  }

  const favorableText = pruefungResult.isFavorable === 'personal'
    ? 'Persönlicher Steuersatz'
    : 'Abgeltungssteuer'
  const usedRate = `${(pruefungResult.usedTaxRate * 100).toFixed(2)}%`

  return (
    <div className="bg-blue-50 px-2 py-1 rounded space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-blue-600 font-medium">
          🔍
          {' '}
          <GlossaryTerm term="guenstigerpruefung">
            Günstigerprüfung
          </GlossaryTerm>
          :
        </span>
        <span className="font-semibold text-blue-700 text-sm">
          {favorableText}
          {' '}
          (
          {usedRate}
          )
        </span>
      </div>
      <div className="text-xs text-blue-600 italic">
        {pruefungResult.explanation}
      </div>
    </div>
  )
}

/**
 * Component to display Vorabpauschale details for a specific year
 */
function VorabpauschaleDisplay({
  elemente,
  jahr,
  onInfoClick,
}: {
  elemente?: SparplanElement[]
  jahr: number
  onInfoClick: (details: VorabpauschaleDetails) => void
}) {
  // Find any element that has vorabpauschale details for this year
  const elementWithVorab = elemente?.find(el =>
    el.simulation[jahr]?.vorabpauschaleDetails,
  )

  const vorabDetails = elementWithVorab?.simulation[jahr]?.vorabpauschaleDetails

  if (!vorabDetails) {
    return null
  }

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 font-medium">
        📊
        {' '}
        <GlossaryTerm term="vorabpauschale">
          Vorabpauschale
        </GlossaryTerm>
        {' '}
        (Beispiel):
      </span>
      <span className="font-semibold text-blue-700 text-sm flex items-center">
        {thousands(vorabDetails.vorabpauschaleAmount?.toString() || '0')}
        {' '}
        €
        <InfoIcon
          onClick={() => onInfoClick(vorabDetails)}
        />
      </span>
    </div>
  )
}

function ProgressionDetailRow({
  label,
  value,
  valueClassName,
  onInfoClick,
}: {
  label: string
  value: React.ReactNode
  valueClassName: string
  onInfoClick?: () => void
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className={`font-semibold text-sm flex items-center ${valueClassName}`}>
        {value}
        {onInfoClick && <InfoIcon onClick={onInfoClick} />}
      </span>
    </div>
  )
}

export function YearlyProgressionCard({
  row,
  hasInflationData,
  showCalculationInfo,
  elemente,
  showVorabpauschaleInfo,
}: {
  row: PortfolioProgressionEntry
  hasInflationData: boolean
  showCalculationInfo: (explanationType: string, rowData: CalculationInfoData) => void
  elemente?: SparplanElement[]
  showVorabpauschaleInfo: (details: VorabpauschaleDetails) => void
}) {
  const calculationInfoData: CalculationInfoData = {
    jahr: row.year,
    einzahlung: row.yearlyContribution,
    zinsen: row.yearlyInterest,
    bezahlteSteuer: row.yearlyTax,
    endkapital: row.totalCapital,
  }

  const formatValue = (value: number, realValue?: number) =>
    hasInflationData && realValue !== undefined
      ? formatInflationAdjustedValue(value, realValue, true)
      : `${thousands(value)} €`

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
        <span className="font-semibold text-gray-800 text-base">
          📅
          1.1.
          {row.year}
        </span>
        <span className="font-bold text-blue-600 text-lg flex items-center">
          🎯
          {' '}
          {formatValue(row.totalCapital, row.totalCapitalReal)}
          <InfoIcon onClick={() => showCalculationInfo('endkapital', calculationInfoData)} />
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <ProgressionDetailRow
          label="💰 Neue Einzahlung:"
          value={`${thousands(row.yearlyContribution)} €`}
          valueClassName="text-green-600"
        />
        <ProgressionDetailRow
          label="📈 Zinsen (Jahr):"
          value={formatValue(row.yearlyInterest, row.yearlyInterestReal)}
          valueClassName="text-cyan-600"
          onInfoClick={() => showCalculationInfo('interest', calculationInfoData)}
        />
        <ProgressionDetailRow
          label="💸 Bezahlte Steuer (Jahr):"
          value={`${thousands(row.yearlyTax)} €`}
          valueClassName="text-red-600"
          onInfoClick={() => showCalculationInfo('tax', calculationInfoData)}
        />
        <GuenstigerpruefungDisplay elemente={elemente} jahr={row.year} />
        <ProgressionDetailRow
          label="💼 Kumulierte Einzahlungen:"
          value={`${thousands(row.cumulativeContributions)} €`}
          valueClassName="text-gray-600"
        />
        <VorabpauschaleDisplay
          elemente={elemente}
          jahr={row.year}
          onInfoClick={showVorabpauschaleInfo}
        />
      </div>
    </div>
  )
}
