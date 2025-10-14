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
import { HealthCareInsuranceConfiguration } from './HealthCareInsuranceConfiguration'
import { OtherIncomeConfigurationComponent } from './OtherIncomeConfiguration'
import { WithdrawalModeSelector } from './WithdrawalModeSelector'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal'
import { WithdrawalSegmentForm } from './WithdrawalSegmentForm'
import { ComparisonStrategyConfiguration } from './ComparisonStrategyConfiguration'
import { SegmentedComparisonConfiguration } from './SegmentedComparisonConfiguration'
import { SingleStrategyConfigSection } from './SingleStrategyConfigSection'
import {
  handleWithdrawalModeChange,
  handleAddComparisonStrategy,
  handleRemoveComparisonStrategy,
} from './withdrawal-mode-helpers'
import { buildHealthCareInsuranceValues } from './health-care-insurance-values-builder'

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
      <CollapsibleCard>
        <CollapsibleCardHeader>Variablen</CollapsibleCardHeader>
        <CollapsibleCardContent>
          {/* Other Income Sources Configuration */}
          <OtherIncomeConfigurationComponent
            config={currentConfig.otherIncomeConfig || { enabled: false, sources: [] }}
            onChange={otherIncomeConfig => updateConfig({ otherIncomeConfig })}
          />

          {/* Toggle between single, segmented, and comparison withdrawal */}
          <WithdrawalModeSelector
            useSegmentedWithdrawal={useSegmentedWithdrawal}
            useComparisonMode={useComparisonMode}
            useSegmentedComparisonMode={useSegmentedComparisonMode}
            onModeChange={mode =>
              handleWithdrawalModeChange({
                mode,
                withdrawalSegments,
                startOfIndependence,
                globalEndOfLife,
                updateConfig,
              })}
          />

          {useSegmentedWithdrawal ? (
            <WithdrawalSegmentForm
              segments={withdrawalSegments}
              onSegmentsChange={segments => updateConfig({ withdrawalSegments: segments })}
              withdrawalStartYear={startOfIndependence + 1}
              withdrawalEndYear={globalEndOfLife}
            />
          ) : useComparisonMode ? (
            <ComparisonStrategyConfiguration
              formValue={formValue}
              comparisonStrategies={comparisonStrategies}
              onUpdateFormValue={updateFormValue}
              onUpdateComparisonStrategy={updateComparisonStrategy}
              onAddComparisonStrategy={() =>
                handleAddComparisonStrategy({
                  comparisonStrategies,
                  updateConfig,
                })}
              onRemoveComparisonStrategy={id =>
                handleRemoveComparisonStrategy({
                  id,
                  comparisonStrategies,
                  updateConfig,
                })}
            />
          ) : useSegmentedComparisonMode ? (
            <SegmentedComparisonConfiguration
              segmentedComparisonStrategies={segmentedComparisonStrategies}
              withdrawalStartYear={startOfIndependence + 1}
              withdrawalEndYear={globalEndOfLife}
              onAddStrategy={addSegmentedComparisonStrategy}
              onUpdateStrategy={updateSegmentedComparisonStrategy}
              onRemoveStrategy={removeSegmentedComparisonStrategy}
            />
          ) : (
            <SingleStrategyConfigSection
              formValue={formValue}
              startOfIndependence={startOfIndependence}
              globalEndOfLife={globalEndOfLife}
              withdrawalReturnMode={withdrawalReturnMode}
              withdrawalAverageReturn={withdrawalAverageReturn}
              withdrawalStandardDeviation={withdrawalStandardDeviation}
              withdrawalRandomSeed={withdrawalRandomSeed}
              withdrawalVariableReturns={withdrawalVariableReturns}
              withdrawalMultiAssetConfig={withdrawalMultiAssetConfig}
              onConfigUpdate={updateConfig}
              onFormValueUpdate={updateFormValue}
              onStrategyChange={() => {}}
              onWithdrawalMultiAssetConfigChange={setWithdrawalMultiAssetConfig}
              dispatchEnd={dispatchEnd}
            />
          )}

          {/* Health Care Insurance Configuration - Available in all withdrawal modes */}
          <div className="mb-6">
            <HealthCareInsuranceConfiguration
              {...buildHealthCareInsuranceValues({
                formValue,
                planningMode,
                startOfIndependence,
                birthYear,
                spouseBirthYear: spouse?.birthYear,
              })}
              onChange={healthCareInsuranceHandlers}
              currentWithdrawalAmount={
                withdrawalData && withdrawalData.withdrawalArray.length > 0
                  ? withdrawalData.withdrawalArray[withdrawalData.withdrawalArray.length - 1].entnahme
                  : undefined
              }
            />
          </div>

        </CollapsibleCardContent>
      </CollapsibleCard>
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
