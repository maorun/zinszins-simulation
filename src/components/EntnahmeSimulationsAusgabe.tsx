import type { WithdrawalResult } from '../../helpers/withdrawal'
import { useSimulation } from '../contexts/useSimulation'
import { useWithdrawalCalculations } from '../hooks/useWithdrawalCalculations'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { useWithdrawalConfigValues } from '../hooks/useWithdrawalConfigValues'
import { useWithdrawalModals } from '../hooks/useWithdrawalModals'
import { useWithdrawalEffects } from '../hooks/useWithdrawalEffects'
import { useHealthCareInsuranceHandlers } from '../hooks/useHealthCareInsuranceHandlers'
import type { SparplanElement } from '../utils/sparplan-utils'
import CalculationExplanationModal from './CalculationExplanationModal'
import { EntnahmeSimulationDisplay } from './EntnahmeSimulationDisplay'
import { WithdrawalVariablesCard } from './WithdrawalVariablesCard'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal'

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
    comparisonStrategies,
    useSegmentedComparisonMode,
    segmentedComparisonStrategies,
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

  return (
    <div className="space-y-4">
      <WithdrawalVariablesCard
        otherIncomeConfig={currentConfig.otherIncomeConfig}
        onOtherIncomeConfigChange={otherIncomeConfig => updateConfig({ otherIncomeConfig })}
        useSegmentedWithdrawal={useSegmentedWithdrawal}
        useComparisonMode={useComparisonMode}
        useSegmentedComparisonMode={useSegmentedComparisonMode}
        withdrawalSegments={withdrawalSegments}
        onWithdrawalSegmentsChange={segments => updateConfig({ withdrawalSegments: segments })}
        formValue={formValue}
        comparisonStrategies={comparisonStrategies}
        onFormValueUpdate={updateFormValue}
        onComparisonStrategyUpdate={updateComparisonStrategy}
        onComparisonStrategyAdd={() => {
          const newId = `strategy${comparisonStrategies.length + 1}`
          updateConfig({
            comparisonStrategies: [
              ...comparisonStrategies,
              {
                id: newId,
                name: `Strategy ${comparisonStrategies.length + 1}`,
                strategie: '4prozent' as const,
                rendite: 5,
              },
            ],
          })
        }}
        onComparisonStrategyRemove={(id) => {
          updateConfig({
            comparisonStrategies: comparisonStrategies.filter(s => s.id !== id),
          })
        }}
        segmentedComparisonStrategies={segmentedComparisonStrategies}
        onSegmentedComparisonStrategyAdd={addSegmentedComparisonStrategy}
        onSegmentedComparisonStrategyUpdate={updateSegmentedComparisonStrategy}
        onSegmentedComparisonStrategyRemove={removeSegmentedComparisonStrategy}
        withdrawalReturnMode={withdrawalReturnMode}
        withdrawalAverageReturn={withdrawalAverageReturn}
        withdrawalStandardDeviation={withdrawalStandardDeviation}
        withdrawalRandomSeed={withdrawalRandomSeed}
        withdrawalVariableReturns={withdrawalVariableReturns}
        withdrawalMultiAssetConfig={withdrawalMultiAssetConfig}
        onWithdrawalMultiAssetConfigChange={config => setWithdrawalMultiAssetConfig(config!)}
        onConfigUpdate={updateConfig}
        dispatchEnd={dispatchEnd}
        startOfIndependence={startOfIndependence}
        globalEndOfLife={globalEndOfLife}
        planningMode={planningMode}
        birthYear={birthYear}
        spouseBirthYear={spouse?.birthYear}
        currentWithdrawalAmount={
          withdrawalData && withdrawalData.withdrawalArray.length > 0
            ? withdrawalData.withdrawalArray[withdrawalData.withdrawalArray.length - 1].entnahme
            : undefined
        }
        onHealthCareInsuranceChange={healthCareInsuranceHandlers}
      />
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

      {/* Calculation Explanation Modal */}
      {calculationDetails && (
        <CalculationExplanationModal
          open={showCalculationModal}
          onClose={() => setShowCalculationModal(false)}
          title={calculationDetails.title}
          introduction={calculationDetails.introduction}
          steps={calculationDetails.steps}
          finalResult={calculationDetails.finalResult}
        />
      )}

      {/* Vorabpauschale Explanation Modal */}
      {selectedVorabDetails && (
        <VorabpauschaleExplanationModal
          open={showVorabpauschaleModal}
          onClose={() => setShowVorabpauschaleModal(false)}
          selectedVorabDetails={selectedVorabDetails}
        />
      )}
    </div>
  )
}
