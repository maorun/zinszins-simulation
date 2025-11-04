import { Label } from './ui/label'
import { PercentageSlider } from './PercentageSlider'
import { OptimizationModeRadioGroup } from './OptimizationModeRadioGroup'
import { TaxOptimizationInfo } from './TaxOptimizationInfo'

interface SteueroptimierteEntnahmeFormValues {
  steueroptimierteEntnahmeBaseWithdrawalRate: number
  steueroptimierteEntnahmeTargetTaxRate: number
  steueroptimierteEntnahmeOptimizationMode: 'minimize_taxes' | 'maximize_after_tax' | 'balanced'
  steueroptimierteEntnahmeFreibetragUtilizationTarget: number
  steueroptimierteEntnahmeRebalanceFrequency: 'yearly' | 'quarterly' | 'as_needed'
}

interface SteueroptimierteEntnahmeConfigValues {
  baseWithdrawalRate: number
  targetTaxRate: number
  optimizationMode: 'minimize_taxes' | 'maximize_after_tax' | 'balanced'
  freibetragUtilizationTarget: number
  rebalanceFrequency: 'yearly' | 'quarterly' | 'as_needed'
}

interface SteueroptimierteEntnahmeChangeHandlers {
  onBaseWithdrawalRateChange: (value: number) => void
  onTargetTaxRateChange: (value: number) => void
  onOptimizationModeChange: (value: 'minimize_taxes' | 'maximize_after_tax' | 'balanced') => void
  onFreibetragUtilizationTargetChange: (value: number) => void
  onRebalanceFrequencyChange: (value: 'yearly' | 'quarterly' | 'as_needed') => void
}

interface SteueroptimierteEntnahmeConfigurationProps {
  // For existing form-based usage (Einheitlich)
  formValue?: SteueroptimierteEntnahmeFormValues
  updateFormValue?: (value: SteueroptimierteEntnahmeFormValues) => void

  // For direct state management (Segmentiert)
  values?: SteueroptimierteEntnahmeConfigValues
  onChange?: SteueroptimierteEntnahmeChangeHandlers
}

function getCurrentValues(
  isFormMode: boolean,
  formValue: SteueroptimierteEntnahmeFormValues | undefined,
  values: SteueroptimierteEntnahmeConfigValues | undefined,
): SteueroptimierteEntnahmeConfigValues {
  if (isFormMode && formValue) {
    return {
      baseWithdrawalRate: formValue.steueroptimierteEntnahmeBaseWithdrawalRate,
      targetTaxRate: formValue.steueroptimierteEntnahmeTargetTaxRate,
      optimizationMode: formValue.steueroptimierteEntnahmeOptimizationMode,
      freibetragUtilizationTarget: formValue.steueroptimierteEntnahmeFreibetragUtilizationTarget,
      rebalanceFrequency: formValue.steueroptimierteEntnahmeRebalanceFrequency,
    }
  }
  return values!
}

function createBaseWithdrawalRateHandler(
  isFormMode: boolean,
  formValue: SteueroptimierteEntnahmeFormValues | undefined,
  updateFormValue: ((value: SteueroptimierteEntnahmeFormValues) => void) | undefined,
  onChange: SteueroptimierteEntnahmeChangeHandlers | undefined,
) {
  return (newValue: number) => {
    if (isFormMode && formValue && updateFormValue) {
      updateFormValue({
        ...formValue,
        steueroptimierteEntnahmeBaseWithdrawalRate: newValue,
      })
    }
    else if (onChange) {
      onChange.onBaseWithdrawalRateChange(newValue)
    }
  }
}

function createOptimizationModeHandler(
  isFormMode: boolean,
  formValue: SteueroptimierteEntnahmeFormValues | undefined,
  updateFormValue: ((value: SteueroptimierteEntnahmeFormValues) => void) | undefined,
  onChange: SteueroptimierteEntnahmeChangeHandlers | undefined,
) {
  return (newValue: 'minimize_taxes' | 'maximize_after_tax' | 'balanced') => {
    if (isFormMode && formValue && updateFormValue) {
      updateFormValue({
        ...formValue,
        steueroptimierteEntnahmeOptimizationMode: newValue,
      })
    }
    else if (onChange) {
      onChange.onOptimizationModeChange(newValue)
    }
  }
}

function createFreibetragUtilizationHandler(
  isFormMode: boolean,
  formValue: SteueroptimierteEntnahmeFormValues | undefined,
  updateFormValue: ((value: SteueroptimierteEntnahmeFormValues) => void) | undefined,
  onChange: SteueroptimierteEntnahmeChangeHandlers | undefined,
) {
  return (newValue: number) => {
    if (isFormMode && formValue && updateFormValue) {
      updateFormValue({
        ...formValue,
        steueroptimierteEntnahmeFreibetragUtilizationTarget: newValue,
      })
    }
    else if (onChange) {
      onChange.onFreibetragUtilizationTargetChange(newValue)
    }
  }
}

function createTargetTaxRateHandler(
  isFormMode: boolean,
  formValue: SteueroptimierteEntnahmeFormValues | undefined,
  updateFormValue: ((value: SteueroptimierteEntnahmeFormValues) => void) | undefined,
  onChange: SteueroptimierteEntnahmeChangeHandlers | undefined,
) {
  return (newValue: number) => {
    if (isFormMode && formValue && updateFormValue) {
      updateFormValue({
        ...formValue,
        steueroptimierteEntnahmeTargetTaxRate: newValue,
      })
    }
    else if (onChange) {
      onChange.onTargetTaxRateChange(newValue)
    }
  }
}

function ConfigHeader() {
  return (
    <div className="mb-4">
      <Label className="text-base font-semibold text-green-800">
        🎯 Steueroptimierte Entnahme-Konfiguration
      </Label>
      <p className="text-sm text-green-700 mt-1">
        Optimiert automatisch die Entnahmebeträge zur Minimierung der Steuerlast unter
        {' '}
        Berücksichtigung deutscher Steuerregeln.
      </p>
    </div>
  )
}

interface ChangeHandlers {
  handleBaseWithdrawalRateChange: (value: number) => void
  handleOptimizationModeChange: (value: 'minimize_taxes' | 'maximize_after_tax' | 'balanced') => void
  handleFreibetragUtilizationChange: (value: number) => void
  handleTargetTaxRateChange: (value: number) => void
}

function createAllHandlers(
  isFormMode: boolean,
  formValue: SteueroptimierteEntnahmeFormValues | undefined,
  updateFormValue: ((value: SteueroptimierteEntnahmeFormValues) => void) | undefined,
  onChange: SteueroptimierteEntnahmeChangeHandlers | undefined,
): ChangeHandlers {
  return {
    handleBaseWithdrawalRateChange: createBaseWithdrawalRateHandler(
      isFormMode,
      formValue,
      updateFormValue,
      onChange,
    ),
    handleOptimizationModeChange: createOptimizationModeHandler(
      isFormMode,
      formValue,
      updateFormValue,
      onChange,
    ),
    handleFreibetragUtilizationChange: createFreibetragUtilizationHandler(
      isFormMode,
      formValue,
      updateFormValue,
      onChange,
    ),
    handleTargetTaxRateChange: createTargetTaxRateHandler(
      isFormMode,
      formValue,
      updateFormValue,
      onChange,
    ),
  }
}

interface SliderSectionsProps {
  currentValues: SteueroptimierteEntnahmeConfigValues
  handlers: ChangeHandlers
}

function SliderSections({ currentValues, handlers }: SliderSectionsProps) {
  return (
    <>
      <PercentageSlider
        label="Basis-Entnahmerate (%)"
        value={currentValues.baseWithdrawalRate}
        onChange={handlers.handleBaseWithdrawalRateChange}
        min={1}
        max={8}
        step={0.1}
        helpText="Ausgangspunkt für die Entnahme, wird steueroptimiert angepasst."
      />

      <OptimizationModeRadioGroup
        value={currentValues.optimizationMode}
        onChange={handlers.handleOptimizationModeChange}
      />

      <PercentageSlider
        label="Freibetrag-Nutzungsziel (%)"
        value={currentValues.freibetragUtilizationTarget}
        onChange={handlers.handleFreibetragUtilizationChange}
        min={50}
        max={100}
        step={5}
        helpText="Angestrebte Nutzung des verfügbaren Sparerpauschbetrags (Freibetrag)."
        decimals={0}
      />

      <PercentageSlider
        label="Ziel-Steuersatz (%)"
        value={currentValues.targetTaxRate}
        onChange={handlers.handleTargetTaxRateChange}
        min={20}
        max={35}
        step={0.5}
        helpText="Ziel-Steuersatz für die Optimierung (inklusive Solidaritätszuschlag)."
      />

      <TaxOptimizationInfo />
    </>
  )
}

export function SteueroptimierteEntnahmeConfiguration({
  formValue,
  updateFormValue,
  values,
  onChange,
}: SteueroptimierteEntnahmeConfigurationProps) {
  const isFormMode = formValue !== undefined && updateFormValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  if (!isFormMode && !isDirectMode) {
    throw new Error(
      'SteueroptimierteEntnahmeConfiguration requires either (formValue + updateFormValue) or (values + onChange)',
    )
  }

  const currentValues = getCurrentValues(isFormMode, formValue, values)
  const handlers = createAllHandlers(isFormMode, formValue, updateFormValue, onChange)

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-green-50 border-green-200">
      <ConfigHeader />
      <SliderSections currentValues={currentValues} handlers={handlers} />
    </div>
  )
}
