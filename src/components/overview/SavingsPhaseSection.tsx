import { memo } from 'react'
import type { EnhancedSummary } from '../../utils/summary-utils'

interface SavingsPhaseSectionProps {
  savingsStartYear: number
  savingsEndYear: number
  enhancedSummary: EnhancedSummary
}

/**
 * Stat card component for displaying a metric with icon and value
 * Memoized to prevent unnecessary re-renders
 */
const StatCard = memo(
  ({
    icon,
    label,
    value,
    highlighted = false,
  }: {
    icon: string
    label: string
    value: string
    highlighted?: boolean
  }) => {
    const baseClasses =
      'flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 transition-all hover:bg-gray-100 hover:translate-x-1'
    const highlightClasses = highlighted
      ? 'bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20'
      : 'border-gray-300'

    return (
      <div className={`${baseClasses} ${highlightClasses}`}>
        <span className="font-medium text-gray-700 text-sm">
          {icon} {label}
        </span>
        <span
          className={`font-bold text-right text-sm sm:text-base ${highlighted ? 'text-green-600 text-base sm:text-lg' : 'text-slate-700'}`}
        >
          {value}
        </span>
      </div>
    )
  },
)

StatCard.displayName = 'StatCard'

/**
 * Displays the savings phase (Ansparphase) section in the enhanced overview
 * Shows total contributions, end capital, total interest, and return rate
 * Memoized to prevent unnecessary re-renders when props haven't changed
 */
export const SavingsPhaseSection = memo(
  ({ savingsStartYear, savingsEndYear, enhancedSummary }: SavingsPhaseSectionProps) => {
    return (
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h4 className="m-0 mb-3 sm:mb-4 text-slate-700 text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
          📈 Ansparphase ({savingsStartYear} - {savingsEndYear})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <StatCard
            icon="💰"
            label="Gesamte Einzahlungen"
            value={enhancedSummary.startkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            highlighted
          />
          <StatCard
            icon="🎯"
            label="Endkapital Ansparphase"
            value={enhancedSummary.endkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            highlighted
          />
          <StatCard
            icon="📊"
            label="Gesamtzinsen Ansparphase"
            value={enhancedSummary.zinsen.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          />
          <StatCard
            icon="📈"
            label="Rendite Ansparphase"
            value={`${enhancedSummary.renditeAnsparphase.toFixed(2)}% p.a.`}
          />
        </div>
      </div>
    )
  },
)

SavingsPhaseSection.displayName = 'SavingsPhaseSection'
