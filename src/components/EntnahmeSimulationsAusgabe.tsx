import { useEffect } from 'react'
import type {
  WithdrawalResult,
} from '../../helpers/withdrawal'
import { useSimulation } from '../contexts/useSimulation'
import { useWithdrawalCalculations } from '../hooks/useWithdrawalCalculations'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { useWithdrawalModals } from '../hooks/useWithdrawalModals'
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

  const { withdrawalData, comparisonResults, segmentedComparisonResults = [] } = useWithdrawalCalculations(
    elemente,
    startOfIndependence,
    currentConfig,
    steuerlast,
    teilfreistellungsquote,
  )

  // Access global Grundfreibetrag configuration and End of Life settings
  const {
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    endOfLife: globalEndOfLife,
    // Birth year and planning data for automatic retirement calculation
    birthYear,
    spouse,
    planningMode,
    // Multi-asset portfolio configuration for withdrawal phase
    withdrawalMultiAssetConfig,
    setWithdrawalMultiAssetConfig,
  } = useSimulation()

  const {
    showCalculationModal,
    setShowCalculationModal,
    calculationDetails,
    showVorabpauschaleModal,
    setShowVorabpauschaleModal,
    selectedVorabDetails,
    handleCalculationInfoClick,
  } = useWithdrawalModals(
    currentConfig.formValue,
    currentConfig.useSegmentedWithdrawal,
    currentConfig.withdrawalSegments,
    withdrawalData,
    startOfIndependence,
    steuerlast,
    teilfreistellungsquote,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
  )

  // Extract values from config for easier access
  const formValue = currentConfig.formValue
  const withdrawalReturnMode = currentConfig.withdrawalReturnMode
  const withdrawalVariableReturns = currentConfig.withdrawalVariableReturns
  const withdrawalAverageReturn = currentConfig.withdrawalAverageReturn
  const withdrawalStandardDeviation = currentConfig.withdrawalStandardDeviation
  const withdrawalRandomSeed = currentConfig.withdrawalRandomSeed
  const useSegmentedWithdrawal = currentConfig.useSegmentedWithdrawal
  const withdrawalSegments = currentConfig.withdrawalSegments
  const useComparisonMode = currentConfig.useComparisonMode
  const comparisonStrategies = currentConfig.comparisonStrategies
  const useSegmentedComparisonMode = currentConfig.useSegmentedComparisonMode
  const segmentedComparisonStrategies = currentConfig.segmentedComparisonStrategies

  // Use health care insurance handlers hook (after formValue is defined)
  const healthCareInsuranceHandlers = useHealthCareInsuranceHandlers(
    formValue,
    updateFormValue,
  )

  // Notify parent component when withdrawal results change
  useEffect(() => {
    if (onWithdrawalResultsChange && withdrawalData) {
      onWithdrawalResultsChange(withdrawalData.withdrawalResult)
    }
  }, [withdrawalData, onWithdrawalResultsChange])

  // Update withdrawal segments when startOfIndependence changes (for segmented withdrawal)
  useEffect(() => {
    if (useSegmentedWithdrawal && withdrawalSegments.length > 0) {
      const updatedSegments = withdrawalSegments.map((segment, index) =>
        index === 0 ? { ...segment, startYear: startOfIndependence + 1 } : segment,
      )

      if (updatedSegments[0]?.startYear !== withdrawalSegments[0]?.startYear) {
        updateConfig({ withdrawalSegments: updatedSegments })
      }
    }
  }, [startOfIndependence, useSegmentedWithdrawal, withdrawalSegments, updateConfig])

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
