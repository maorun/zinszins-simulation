import { ConfigurableSlider } from './ConfigurableSlider'

interface DynamicWithdrawalFormValues {
  dynamischBasisrate: number
  dynamischObereSchwell: number
  dynamischObereAnpassung: number
  dynamischUntereSchwell: number
  dynamischUntereAnpassung: number
}

interface DynamicWithdrawalConfigValues {
  baseWithdrawalRate: number
  upperThresholdReturn: number
  upperThresholdAdjustment: number
  lowerThresholdReturn: number
  lowerThresholdAdjustment: number
}

interface DynamicWithdrawalChangeHandlers {
  onBaseWithdrawalRateChange: (value: number) => void
  onUpperThresholdReturnChange: (value: number) => void
  onUpperThresholdAdjustmentChange: (value: number) => void
  onLowerThresholdReturnChange: (value: number) => void
  onLowerThresholdAdjustmentChange: (value: number) => void
}

interface DynamicWithdrawalConfigurationProps {
  // For existing form-based usage
  formValue?: DynamicWithdrawalFormValues
  // For new direct onChange usage
  values?: DynamicWithdrawalConfigValues
  onChange?: DynamicWithdrawalChangeHandlers
}

// Helper to convert form values to normalized values
function normalizeFormValues(formValue: DynamicWithdrawalFormValues): DynamicWithdrawalConfigValues {
  return {
    baseWithdrawalRate: formValue.dynamischBasisrate / 100,
    upperThresholdReturn: formValue.dynamischObereSchwell / 100,
    upperThresholdAdjustment: formValue.dynamischObereAnpassung / 100,
    lowerThresholdReturn: formValue.dynamischUntereSchwell / 100,
    lowerThresholdAdjustment: formValue.dynamischUntereAnpassung / 100,
  }
}

// Helper to format percentage values
function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Helper to format signed percentage values
function formatSignedPercent(value: number, decimals = 0): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

// Slider configuration interface
interface SliderConfig {
  formId: string
  directId: string
  label: string
  min: number
  max: number
  step: number
  description: string
  formatValue: (v: number) => string
  getValue: (values: DynamicWithdrawalConfigValues) => number
  onChange?: (value: number) => void
}

// Static slider configuration data
const SLIDER_BASE_CONFIGS = [
  {
    formId: 'dynamischBasisrate',
    directId: 'baseWithdrawalRate',
    label: 'Basis-Entnahmerate (%)',
    min: 2,
    max: 7,
    step: 0.5,
    description: 'Grundlegende jährliche Entnahmerate vor dynamischen Anpassungen',
    formatValue: formatPercent,
    getValue: (values: DynamicWithdrawalConfigValues) => values.baseWithdrawalRate * 100,
    getOnChange: (handlers: DynamicWithdrawalChangeHandlers) =>
      (v: number) => handlers.onBaseWithdrawalRateChange(v / 100),
  },
  {
    formId: 'dynamischObereSchwell',
    directId: 'upperThresholdReturn',
    label: 'Obere Schwelle Rendite (%)',
    min: 4,
    max: 15,
    step: 0.5,
    description: 'Rendite-Schwelle: Bei Überschreitung wird die Entnahme erhöht',
    formatValue: formatPercent,
    getValue: (values: DynamicWithdrawalConfigValues) => values.upperThresholdReturn * 100,
    getOnChange: (handlers: DynamicWithdrawalChangeHandlers) =>
      (v: number) => handlers.onUpperThresholdReturnChange(v / 100),
  },
  {
    formId: 'dynamischObereAnpassung',
    directId: 'upperThresholdAdjustment',
    label: 'Anpassung bei oberer Schwelle (%)',
    min: 0,
    max: 15,
    step: 1,
    description: 'Relative Erhöhung der Entnahme bei guter Performance',
    formatValue: formatSignedPercent,
    getValue: (values: DynamicWithdrawalConfigValues) => values.upperThresholdAdjustment * 100,
    getOnChange: (handlers: DynamicWithdrawalChangeHandlers) =>
      (v: number) => handlers.onUpperThresholdAdjustmentChange(v / 100),
  },
  {
    formId: 'dynamischUntereSchwell',
    directId: 'lowerThresholdReturn',
    label: 'Untere Schwelle Rendite (%)',
    min: -5,
    max: 6,
    step: 0.5,
    description: 'Rendite-Schwelle: Bei Unterschreitung wird die Entnahme reduziert',
    formatValue: formatPercent,
    getValue: (values: DynamicWithdrawalConfigValues) => values.lowerThresholdReturn * 100,
    getOnChange: (handlers: DynamicWithdrawalChangeHandlers) =>
      (v: number) => handlers.onLowerThresholdReturnChange(v / 100),
  },
  {
    formId: 'dynamischUntereAnpassung',
    directId: 'lowerThresholdAdjustment',
    label: 'Anpassung bei unterer Schwelle (%)',
    min: -15,
    max: 0,
    step: 1,
    description: 'Relative Reduzierung der Entnahme bei schlechter Performance',
    formatValue: formatSignedPercent,
    getValue: (values: DynamicWithdrawalConfigValues) => values.lowerThresholdAdjustment * 100,
    getOnChange: (handlers: DynamicWithdrawalChangeHandlers) =>
      (v: number) => handlers.onLowerThresholdAdjustmentChange(v / 100),
  },
]

// Get slider configurations
function getSliderConfigs(
  onChange: DynamicWithdrawalChangeHandlers | undefined,
): SliderConfig[] {
  return SLIDER_BASE_CONFIGS.map(config => ({
    ...config,
    onChange: onChange ? config.getOnChange(onChange) : undefined,
  }))
}

export function DynamicWithdrawalConfiguration({
  formValue,
  values,
  onChange,
}: DynamicWithdrawalConfigurationProps) {
  // Determine which mode we're in
  const isFormMode = formValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  if (!isFormMode && !isDirectMode) {
    throw new Error('DynamicWithdrawalConfiguration requires either formValue or (values + onChange)')
  }

  // Get current values based on mode
  const currentValues = isFormMode ? normalizeFormValues(formValue!) : values!
  const sliderConfigs = getSliderConfigs(onChange)

  return (
    <div className="space-y-6">
      {sliderConfigs.map(config => (
        <ConfigurableSlider
          key={config.directId}
          id={isFormMode ? config.formId : config.directId}
          label={config.label}
          value={config.getValue(currentValues)}
          min={config.min}
          max={config.max}
          step={config.step}
          description={config.description}
          onChange={isFormMode ? undefined : config.onChange}
          formatValue={config.formatValue}
        />
      ))}
    </div>
  )
}
