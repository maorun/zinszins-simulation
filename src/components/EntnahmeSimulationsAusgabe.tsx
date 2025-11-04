import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { SparplanElement } from '../utils/sparplan-utils'
import { useEntnahmeSimulationData } from '../hooks/useEntnahmeSimulationData'
import { WithdrawalVariablesCard } from './WithdrawalVariablesCard'
import { EntnahmeSimulationSection } from './EntnahmeSimulationSection'
import { EntnahmeSimulationModals } from './EntnahmeSimulationModals'

export function EntnahmeSimulationsAusgabe({
  startEnd,
  elemente,
  dispatchEnd,
  onWithdrawalResultsChange,
  steuerlast,
  teilfreistellungsquote,
}: {
  startEnd: [number, number]
  elemente: SparplanElement[]
  dispatchEnd: (val: [number, number]) => void
  onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void
  steuerlast: number
  teilfreistellungsquote: number
}) {
  const data = useEntnahmeSimulationData(
    elemente,
    startEnd,
    dispatchEnd,
    onWithdrawalResultsChange,
    steuerlast,
    teilfreistellungsquote,
  )

  return (
    <div className="space-y-4">
      <WithdrawalVariablesCard {...data.withdrawalVariablesProps} />
      <EntnahmeSimulationSection
        withdrawalData={data.withdrawalData}
        formValue={data.formValue}
        useComparisonMode={data.useComparisonMode}
        comparisonResults={data.comparisonResults}
        useSegmentedComparisonMode={data.useSegmentedComparisonMode}
        segmentedComparisonResults={data.segmentedComparisonResults}
        onCalculationInfoClick={data.handleCalculationInfoClick}
      />
      <EntnahmeSimulationModals
        showCalculationModal={data.showCalculationModal}
        setShowCalculationModal={data.setShowCalculationModal}
        calculationDetails={data.calculationDetails}
        showVorabpauschaleModal={data.showVorabpauschaleModal}
        setShowVorabpauschaleModal={data.setShowVorabpauschaleModal}
        selectedVorabDetails={data.selectedVorabDetails}
      />
    </div>
  )
}
