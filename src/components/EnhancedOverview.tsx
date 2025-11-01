import { SavingsPhaseSection } from './overview/SavingsPhaseSection'
import { WithdrawalPhaseSection } from './overview/WithdrawalPhaseSection'
import { useSimulation } from '../contexts/useSimulation'
import { useOverviewYearRanges } from '../hooks/useOverviewYearRanges'

export function EnhancedOverview() {
  const {
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    withdrawalConfig,
    endOfLife,
  } = useSimulation()

  const { enhancedSummary, savingsStartYear, savingsEndYear, withdrawalEndYear }
    = useOverviewYearRanges(
      simulationData,
      startEnd,
      withdrawalResults,
      rendite,
      steuerlast,
      teilfreistellungsquote,
      withdrawalConfig,
      endOfLife,
    )

  if (!enhancedSummary || !simulationData) return null

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <h3 className="bg-gradient-to-r from-slate-700 to-slate-600 text-white m-0 p-4 sm:p-6 text-lg sm:text-xl font-bold text-center tracking-tight">
        🎯 Finanzübersicht - Schnelle Eckpunkte
      </h3>
      <SavingsPhaseSection
        savingsStartYear={savingsStartYear}
        savingsEndYear={savingsEndYear}
        enhancedSummary={enhancedSummary}
      />
      <WithdrawalPhaseSection
        withdrawalStartYear={startEnd[0] + 1}
        withdrawalEndYear={withdrawalEndYear}
        enhancedSummary={enhancedSummary}
      />
    </div>
  )
}
