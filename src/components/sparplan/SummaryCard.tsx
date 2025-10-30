import { formatInflationAdjustedValue } from '../../utils/inflation-adjustment'
import type { Summary, PortfolioProgressionEntry } from '../../utils/summary-utils'
import React from 'react'

// Helper to format numbers with thousands separators
const thousands = (value: string | number) =>
  Number(value).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

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

// Helper to format interest with optional inflation adjustment
function formatInterestDisplay(
  summary: Summary,
  hasInflationData: boolean,
  yearlyProgression: PortfolioProgressionEntry[],
): string {
  const latestProgression = yearlyProgression[yearlyProgression.length - 1]
  if (hasInflationData && latestProgression?.cumulativeInterestReal !== undefined) {
    return formatInflationAdjustedValue(
      summary.zinsen || 0,
      latestProgression.cumulativeInterestReal,
      true,
    )
  }
  return `${thousands(summary.zinsen?.toFixed(2) || '0')} €`
}

// Helper to format end capital with optional inflation adjustment
function formatEndCapitalDisplay(
  summary: Summary,
  hasInflationData: boolean,
  yearlyProgression: PortfolioProgressionEntry[],
): string {
  const latestProgression = yearlyProgression[yearlyProgression.length - 1]
  if (hasInflationData && latestProgression?.totalCapitalReal !== undefined) {
    return formatInflationAdjustedValue(
      summary.endkapital || 0,
      latestProgression.totalCapitalReal,
      true,
    )
  }
  return `${thousands(summary.endkapital?.toFixed(2) || '0')} €`
}

function SummaryDetailRow({
  label,
  value,
  containerClassName,
  onInfoClick,
}: {
  label: string
  value: React.ReactNode
  containerClassName: string
  onInfoClick?: () => void
}) {
  return (
    <div className={`flex flex-col text-center p-2 rounded border ${containerClassName}`}>
      <span className="text-xs mb-1 opacity-80">{label}</span>
      <span className="font-bold text-sm flex items-center justify-center">
        {value}
        {onInfoClick && <InfoIcon onClick={onInfoClick} />}
      </span>
    </div>
  )
}

export function SummaryCard({
  summary,
  hasInflationData,
  yearlyProgression,
  showCalculationInfo,
  tableData,
}: {
  summary: Summary
  hasInflationData: boolean
  yearlyProgression: PortfolioProgressionEntry[]
  showCalculationInfo: (
    explanationType: string,
    rowData: { jahr: number, endkapital: string, einzahlung: number },
  ) => void
  tableData: PortfolioProgressionEntry[]
}) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-blue-500 rounded-xl p-5 mt-2">
      <div className="text-lg font-bold text-blue-500 text-center mb-4">📊 Gesamtübersicht</div>
      <div className="grid grid-cols-2 gap-3">
        <SummaryDetailRow
          label="💰 Einzahlungen"
          value={`${thousands(summary.startkapital?.toFixed(2) || '0')} €`}
          containerClassName="bg-white border-gray-300"
        />
        <SummaryDetailRow
          label="📈 Zinsen"
          value={formatInterestDisplay(summary, hasInflationData, yearlyProgression)}
          containerClassName="bg-white border-gray-300"
        />
        <SummaryDetailRow
          label="💸 Steuern"
          value={`${thousands(summary.bezahlteSteuer?.toFixed(2) || '0')} €`}
          containerClassName="bg-white border-gray-300"
        />
        <SummaryDetailRow
          label="🎯 Endkapital"
          value={formatEndCapitalDisplay(summary, hasInflationData, yearlyProgression)}
          containerClassName="bg-gradient-to-br from-green-500 to-teal-500 text-white border-green-500"
          onInfoClick={() => showCalculationInfo('endkapital', {
            jahr: tableData?.[0]?.year || new Date().getFullYear(),
            endkapital: summary.endkapital?.toFixed(2) || '0',
            einzahlung: summary.startkapital || 0,
          })}
        />
      </div>
    </div>
  )
}
