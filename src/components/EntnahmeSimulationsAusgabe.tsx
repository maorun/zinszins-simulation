import type { WithdrawalResult } from '../../helpers/withdrawal'
import { useSimulation } from '../contexts/useSimulation'
import { useWithdrawalCalculations } from '../hooks/useWithdrawalCalculations'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { useWithdrawalConfigValues } from '../hooks/useWithdrawalConfigValues'
import { useWithdrawalModals } from '../hooks/useWithdrawalModals'
import { useWithdrawalEffects } from '../hooks/useWithdrawalEffects'
import { useHealthCareInsuranceHandlers } from '../hooks/useHealthCareInsuranceHandlers'
import { useWithdrawalVariablesProps } from '../hooks/useWithdrawalVariablesProps'
import type { SparplanElement } from '../utils/sparplan-utils'
import { EntnahmeSimulationDisplay } from './EntnahmeSimulationDisplay'
import { WithdrawalVariablesCard } from './WithdrawalVariablesCard'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
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
  const [startOfIndependence] = startEnd

  // Use custom hooks for state management
  const {
    currentConfig,
    updateConfig,
    updateFormValue,
    updateComparisonStrategy,
    updateSegmentedComparisonStrategy,
    addSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy,
  } = useWithdrawalConfig()

  // Extract config values for easier access
  const {
    formValue,
    withdrawalReturnMode,
    withdrawalVariableReturns,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    useSegmentedWithdrawal,
    withdrawalSegments,
    useComparisonMode,
    useSegmentedComparisonMode,
  } = useWithdrawalConfigValues(currentConfig)

  // Calculate withdrawal data
  const { withdrawalData, comparisonResults, segmentedComparisonResults = [] } = useWithdrawalCalculations(
    elemente,
    startOfIndependence,
    currentConfig,
    steuerlast,
    teilfreistellungsquote,
  )

  // Access global configuration
  const {
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    endOfLife: globalEndOfLife,
    birthYear,
    spouse,
    planningMode,
    withdrawalMultiAssetConfig,
    setWithdrawalMultiAssetConfig,
  } = useSimulation()

  // Modal state and handlers
  const {
    showCalculationModal,
    setShowCalculationModal,
    calculationDetails,
    showVorabpauschaleModal,
    setShowVorabpauschaleModal,
    selectedVorabDetails,
    handleCalculationInfoClick,
  } = useWithdrawalModals(
    formValue,
    useSegmentedWithdrawal,
    withdrawalSegments,
    withdrawalData,
    startOfIndependence,
    steuerlast,
    teilfreistellungsquote,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
  )

  // Health care insurance handlers
  const healthCareInsuranceHandlers = useHealthCareInsuranceHandlers(
    formValue,
    updateFormValue,
  )

  // Side effects (notify parent, update segments)
  useWithdrawalEffects({
    onWithdrawalResultsChange,
    withdrawalData,
    useSegmentedWithdrawal,
    withdrawalSegments,
    startOfIndependence,
    updateConfig,
  })

  // Prepare props for WithdrawalVariablesCard
  const withdrawalVariablesProps = useWithdrawalVariablesProps({
    currentConfig,
    updateConfig,
    updateFormValue,
    updateComparisonStrategy,
    addSegmentedComparisonStrategy,
    updateSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy,
    formValue,
    withdrawalReturnMode,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    withdrawalVariableReturns,
    withdrawalMultiAssetConfig,
    setWithdrawalMultiAssetConfig,
    useSegmentedWithdrawal,
    useComparisonMode,
    useSegmentedComparisonMode,
    dispatchEnd,
    startOfIndependence,
    globalEndOfLife,
    planningMode,
    birthYear,
    spouseBirthYear: spouse?.birthYear,
    withdrawalData,
    healthCareInsuranceHandlers,
  })

  return (
    <div className="space-y-4">
      <WithdrawalVariablesCard {...withdrawalVariablesProps} />
      <CollapsibleCard>
        <CollapsibleCardHeader className="text-left">Simulation</CollapsibleCardHeader>
        <CollapsibleCardContent>
          <EntnahmeSimulationDisplay
            withdrawalData={withdrawalData}
            formValue={formValue}
            useComparisonMode={useComparisonMode}
            comparisonResults={comparisonResults}
            useSegmentedComparisonMode={useSegmentedComparisonMode}
            segmentedComparisonResults={segmentedComparisonResults}
            onCalculationInfoClick={handleCalculationInfoClick}
          />
        </CollapsibleCardContent>
      </CollapsibleCard>

      <EntnahmeSimulationModals
        showCalculationModal={showCalculationModal}
        setShowCalculationModal={setShowCalculationModal}
        calculationDetails={calculationDetails}
        showVorabpauschaleModal={showVorabpauschaleModal}
        setShowVorabpauschaleModal={setShowVorabpauschaleModal}
        selectedVorabDetails={selectedVorabDetails}
      />
    </div>
  )
}
