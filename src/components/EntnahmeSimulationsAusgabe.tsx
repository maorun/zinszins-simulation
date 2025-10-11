import { useEffect } from 'react'
import type {
  WithdrawalResult,
} from '../../helpers/withdrawal'
import { useSimulation } from '../contexts/useSimulation'
import { useWithdrawalCalculations } from '../hooks/useWithdrawalCalculations'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { useWithdrawalModals } from '../hooks/useWithdrawalModals'
import { useHealthCareInsuranceHandlers } from '../hooks/useHealthCareInsuranceHandlers'
import type {
  ComparisonStrategy,
} from '../utils/config-storage'
import { createDefaultWithdrawalSegment } from '../utils/segmented-withdrawal'
import type { SparplanElement } from '../utils/sparplan-utils'
import CalculationExplanationModal from './CalculationExplanationModal'
import { ComparisonStrategyConfiguration } from './ComparisonStrategyConfiguration'
import { DynamicWithdrawalConfiguration } from './DynamicWithdrawalConfiguration'
import { EntnahmeSimulationDisplay } from './EntnahmeSimulationDisplay'
import { HealthCareInsuranceConfiguration } from './HealthCareInsuranceConfiguration'
import { KapitalerhaltConfiguration } from './KapitalerhaltConfiguration'
import { OtherIncomeConfigurationComponent } from './OtherIncomeConfiguration'
import { RMDWithdrawalConfiguration } from './RMDWithdrawalConfiguration'
import { SegmentedComparisonConfiguration } from './SegmentedComparisonConfiguration'
import { WithdrawalModeSelector } from './WithdrawalModeSelector'
import { WithdrawalReturnModeConfiguration } from './WithdrawalReturnModeConfiguration'
import { WithdrawalStrategySelector } from './WithdrawalStrategySelector'
import { WithdrawalFrequencyConfiguration } from './WithdrawalFrequencyConfiguration'
import { InflationConfiguration } from './InflationConfiguration'
import { BucketStrategyConfigurationForm } from './BucketStrategyConfigurationForm'
import { MonthlyFixedWithdrawalConfiguration } from './MonthlyFixedWithdrawalConfiguration'
import { VariablePercentWithdrawalConfiguration } from './VariablePercentWithdrawalConfiguration'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal'
import { WithdrawalSegmentForm } from './WithdrawalSegmentForm'

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
            onModeChange={(mode) => {
              const useComparison = mode === 'comparison'
              const useSegmented = mode === 'segmented'
              const useSegmentedComparison = mode === 'segmented-comparison'

              updateConfig({
                useComparisonMode: useComparison,
                useSegmentedWithdrawal: useSegmented,
                useSegmentedComparisonMode: useSegmentedComparison,
              })

              // Initialize segments when switching to segmented mode
              if (useSegmented && withdrawalSegments.length === 0) {
                // Create initial segment covering only the first 15 years, leaving room for additional segments
                const withdrawalStartYear = startOfIndependence + 1
                // 15 years or until end of life
                const initialSegmentEndYear = Math.min(withdrawalStartYear + 14, globalEndOfLife)
                const defaultSegment = createDefaultWithdrawalSegment(
                  'main',
                  'Frühphase',
                  withdrawalStartYear,
                  initialSegmentEndYear,
                )
                updateConfig({ withdrawalSegments: [defaultSegment] })
              }
            }}
          />

          {useSegmentedWithdrawal ? (
          /* Segmented withdrawal configuration */
            <WithdrawalSegmentForm
              segments={withdrawalSegments}
              onSegmentsChange={segments =>
                updateConfig({ withdrawalSegments: segments })}
              withdrawalStartYear={startOfIndependence + 1}
              withdrawalEndYear={globalEndOfLife}
            />
          ) : useComparisonMode ? (
          /* Comparison mode configuration */
            <ComparisonStrategyConfiguration
              formValue={formValue}
              comparisonStrategies={comparisonStrategies}
              onUpdateFormValue={updateFormValue}
              onUpdateComparisonStrategy={updateComparisonStrategy}
              onRemoveComparisonStrategy={(id) => {
                updateConfig({
                  comparisonStrategies: comparisonStrategies.filter(
                    (s: ComparisonStrategy) => s.id !== id,
                  ),
                })
              }}
              onAddComparisonStrategy={() => {
                const newId = `strategy${Date.now()}`
                const newStrategy: ComparisonStrategy = {
                  id: newId,
                  name: '3% Regel',
                  strategie: '3prozent',
                  rendite: 5,
                }
                updateConfig({
                  comparisonStrategies: [
                    ...comparisonStrategies,
                    newStrategy,
                  ],
                })
              }}
            />
          ) : useSegmentedComparisonMode ? (
          /* Segmented comparison mode configuration */
            <SegmentedComparisonConfiguration
              segmentedComparisonStrategies={segmentedComparisonStrategies}
              withdrawalStartYear={startOfIndependence + 1}
              withdrawalEndYear={globalEndOfLife}
              onAddStrategy={addSegmentedComparisonStrategy}
              onUpdateStrategy={updateSegmentedComparisonStrategy}
              onRemoveStrategy={removeSegmentedComparisonStrategy}
            />
          ) : (
          /* Single strategy configuration (existing UI) */
            <div>
              {/* Withdrawal Return Configuration */}
              <WithdrawalReturnModeConfiguration
                withdrawalReturnMode={withdrawalReturnMode}
                withdrawalAverageReturn={withdrawalAverageReturn}
                withdrawalStandardDeviation={withdrawalStandardDeviation}
                withdrawalRandomSeed={withdrawalRandomSeed}
                withdrawalVariableReturns={withdrawalVariableReturns}
                formValueRendite={formValue.rendite}
                startOfIndependence={startOfIndependence}
                globalEndOfLife={globalEndOfLife}
                withdrawalMultiAssetConfig={withdrawalMultiAssetConfig}
                onWithdrawalReturnModeChange={(mode) => {
                  updateConfig({ withdrawalReturnMode: mode })
                }}
                onWithdrawalAverageReturnChange={(value) => {
                  updateConfig({ withdrawalAverageReturn: value })
                }}
                onWithdrawalStandardDeviationChange={(value) => {
                  updateConfig({ withdrawalStandardDeviation: value })
                }}
                onWithdrawalRandomSeedChange={(value) => {
                  updateConfig({ withdrawalRandomSeed: value })
                }}
                onWithdrawalVariableReturnsChange={(returns) => {
                  updateConfig({ withdrawalVariableReturns: returns })
                }}
                onFormValueRenditeChange={(rendite) => {
                  updateFormValue({ ...formValue, rendite })
                }}
                onWithdrawalMultiAssetConfigChange={setWithdrawalMultiAssetConfig}
              />

              <WithdrawalStrategySelector
                strategie={formValue.strategie}
                onStrategyChange={(strategy) => {
                  dispatchEnd([startOfIndependence, globalEndOfLife])
                  updateFormValue({
                    strategie: strategy,
                  })
                }}
              />

              {/* Withdrawal frequency configuration */}
              <WithdrawalFrequencyConfiguration
                frequency={formValue.withdrawalFrequency}
                onFrequencyChange={(frequency) => {
                  updateFormValue({
                    withdrawalFrequency: frequency,
                  })
                }}
              />

              {/* General inflation controls for all strategies */}
              <InflationConfiguration
                inflationAktiv={formValue.inflationAktiv}
                inflationsrate={formValue.inflationsrate}
                onInflationActiveChange={(active) => {
                  updateFormValue({ ...formValue, inflationAktiv: active })
                }}
                onInflationRateChange={(rate) => {
                  dispatchEnd([startOfIndependence, globalEndOfLife])
                  updateFormValue({
                    inflationsrate: rate,
                  })
                }}
              />

              {/* Variable percentage strategy specific controls */}
              {formValue.strategie === 'variabel_prozent' && (
                <VariablePercentWithdrawalConfiguration
                  variabelProzent={formValue.variabelProzent}
                  onVariablePercentChange={(percent) => {
                    updateFormValue({ variabelProzent: percent })
                  }}
                />
              )}

              {/* Monthly strategy specific controls */}
              {formValue.strategie === 'monatlich_fest' && (
                <MonthlyFixedWithdrawalConfiguration
                  monatlicheBetrag={formValue.monatlicheBetrag}
                  guardrailsAktiv={formValue.guardrailsAktiv}
                  guardrailsSchwelle={formValue.guardrailsSchwelle}
                  onMonthlyAmountChange={(amount) => {
                    if (amount) updateFormValue({ ...formValue, monatlicheBetrag: amount })
                  }}
                  onGuardrailsActiveChange={(checked) => {
                    updateFormValue({ ...formValue, guardrailsAktiv: checked })
                  }}
                  onGuardrailsThresholdChange={(threshold) => {
                    updateFormValue({ guardrailsSchwelle: threshold })
                  }}
                />
              )}

              {/* Dynamic strategy specific controls */}
              {formValue.strategie === 'dynamisch' && (
                <DynamicWithdrawalConfiguration formValue={formValue} />
              )}

              {/* RMD strategy specific controls */}
              {formValue.strategie === 'rmd' && (
                <RMDWithdrawalConfiguration
                  formValue={formValue}
                  updateFormValue={updateFormValue}
                />
              )}

              {/* Kapitalerhalt strategy specific controls */}
              {formValue.strategie === 'kapitalerhalt' && (
                <KapitalerhaltConfiguration
                  formValue={formValue}
                  updateFormValue={updateFormValue}
                />
              )}

              {/* Bucket strategy specific controls */}
              {formValue.strategie === 'bucket_strategie' && (
                <BucketStrategyConfigurationForm
                  bucketConfig={formValue.bucketConfig}
                  onBucketConfigChange={(config) => {
                    updateFormValue({
                      ...formValue,
                      bucketConfig: config,
                    })
                  }}
                />
              )}
            </div>
          )}

          {/* Health Care Insurance Configuration - Available in all withdrawal modes */}
          <div className="mb-6">
            <HealthCareInsuranceConfiguration
              values={{
                enabled: formValue.healthCareInsuranceConfig?.enabled ?? true,
                planningMode: planningMode,
                insuranceType: formValue.healthCareInsuranceConfig?.insuranceType || 'statutory',
                includeEmployerContribution: formValue.healthCareInsuranceConfig?.includeEmployerContribution
                  ?? true,
                statutoryHealthInsuranceRate: formValue.healthCareInsuranceConfig?.statutoryHealthInsuranceRate
                  || 14.6,
                statutoryCareInsuranceRate: formValue.healthCareInsuranceConfig?.statutoryCareInsuranceRate
                  || 3.05,
                statutoryMinimumIncomeBase: formValue.healthCareInsuranceConfig?.statutoryMinimumIncomeBase
                  || 13230,
                statutoryMaximumIncomeBase: formValue.healthCareInsuranceConfig?.statutoryMaximumIncomeBase
                  || 62550,
                privateHealthInsuranceMonthly: formValue.healthCareInsuranceConfig?.privateHealthInsuranceMonthly
                  || 400,
                privateCareInsuranceMonthly: formValue.healthCareInsuranceConfig?.privateCareInsuranceMonthly
                  || 100,
                privateInsuranceInflationRate: formValue.healthCareInsuranceConfig?.privateInsuranceInflationRate
                  || 2,
                retirementStartYear: formValue.healthCareInsuranceConfig?.retirementStartYear
                  || startOfIndependence,
                additionalCareInsuranceForChildless: formValue.healthCareInsuranceConfig
                  ?.additionalCareInsuranceForChildless || false,
                additionalCareInsuranceAge: formValue.healthCareInsuranceConfig?.additionalCareInsuranceAge || 23,
                // Couple-specific values
                coupleStrategy: formValue.healthCareInsuranceConfig?.coupleConfig?.strategy,
                familyInsuranceThresholdRegular: formValue.healthCareInsuranceConfig?.coupleConfig
                  ?.familyInsuranceThresholds?.regularEmploymentLimit,
                familyInsuranceThresholdMiniJob: formValue.healthCareInsuranceConfig?.coupleConfig
                  ?.familyInsuranceThresholds?.miniJobLimit,
                person1Name: formValue.healthCareInsuranceConfig?.coupleConfig?.person1?.name,
                person1WithdrawalShare: formValue.healthCareInsuranceConfig?.coupleConfig?.person1?.withdrawalShare,
                person1OtherIncomeAnnual: formValue.healthCareInsuranceConfig?.coupleConfig?.person1?.otherIncomeAnnual,
                person1AdditionalCareInsuranceForChildless: formValue.healthCareInsuranceConfig
                  ?.coupleConfig?.person1?.additionalCareInsuranceForChildless,
                person2Name: formValue.healthCareInsuranceConfig?.coupleConfig?.person2?.name,
                person2WithdrawalShare: formValue.healthCareInsuranceConfig?.coupleConfig?.person2?.withdrawalShare,
                person2OtherIncomeAnnual: formValue.healthCareInsuranceConfig?.coupleConfig?.person2?.otherIncomeAnnual,
                person2AdditionalCareInsuranceForChildless: formValue.healthCareInsuranceConfig
                  ?.coupleConfig?.person2?.additionalCareInsuranceForChildless,
              }}
              birthYear={birthYear}
              spouseBirthYear={spouse?.birthYear}
              planningMode={planningMode}
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
