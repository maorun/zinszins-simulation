import { Slider } from './ui/slider'
import { Label } from './ui/label'

interface KapitalerhaltFormValues {
  kapitalerhaltNominalReturn: number
  kapitalerhaltInflationRate: number
  [key: string]: unknown
}

interface KapitalerhaltConfigValues {
  nominalReturn: number
  inflationRate: number
}

interface KapitalerhaltChangeHandlers {
  onNominalReturnChange: (value: number) => void
  onInflationRateChange: (value: number) => void
}

interface KapitalerhaltConfigurationProps {
  // For existing form-based usage (Einheitlich)
  formValue?: KapitalerhaltFormValues
  updateFormValue?: (value: KapitalerhaltFormValues) => void

  // For direct state management (Segmentiert)
  values?: KapitalerhaltConfigValues
  onChange?: KapitalerhaltChangeHandlers
}

/**
 * Slider component for nominal return configuration
 */
function NominalReturnSlider({
  value,
  isFormMode,
  formValue,
  updateFormValue,
  onChange,
}: {
  value: number
  isFormMode: boolean
  formValue?: KapitalerhaltFormValues
  updateFormValue?: (value: KapitalerhaltFormValues) => void
  onChange?: KapitalerhaltChangeHandlers
}) {
  const handleValueChange = (values: number[]) => {
    const newValue = values[0]
    if (isFormMode) {
      updateFormValue!({ ...formValue!, kapitalerhaltNominalReturn: newValue })
    }
    else {
      onChange!.onNominalReturnChange(newValue)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Erwartete nominale Rendite (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          min={0}
          max={15}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {value.toFixed(1)}
            %
          </span>
          <span>15%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Die erwartete jährliche Rendite des Portfolios vor Berücksichtigung der Inflation.
      </div>
    </div>
  )
}

/**
 * Slider component for inflation rate configuration
 */
function InflationRateSlider({
  value,
  isFormMode,
  formValue,
  updateFormValue,
  onChange,
}: {
  value: number
  isFormMode: boolean
  formValue?: KapitalerhaltFormValues
  updateFormValue?: (value: KapitalerhaltFormValues) => void
  onChange?: KapitalerhaltChangeHandlers
}) {
  const handleValueChange = (values: number[]) => {
    const newValue = values[0]
    if (isFormMode) {
      updateFormValue!({ ...formValue!, kapitalerhaltInflationRate: newValue })
    }
    else {
      onChange!.onInflationRateChange(newValue)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Erwartete Inflationsrate (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          min={0}
          max={8}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {value.toFixed(1)}
            %
          </span>
          <span>8%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Die erwartete jährliche Inflationsrate zur Berechnung der realen Rendite.
      </div>
    </div>
  )
}

/**
 * Real return display component
 */
function RealReturnDisplay({
  nominalReturn,
  inflationRate,
}: {
  nominalReturn: number
  inflationRate: number
}) {
  const realReturn = nominalReturn - inflationRate

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
      <div className="text-sm">
        <div className="font-medium text-blue-900 mb-1">Berechnete reale Entnahmerate:</div>
        <div className="text-blue-800">
          {nominalReturn.toFixed(1)}
          % -
          {inflationRate.toFixed(1)}
          % =
          <strong>
            {realReturn.toFixed(1)}
            %
          </strong>
        </div>
        <div className="text-blue-700 mt-1 text-xs">
          Diese Rate wird jährlich vom Portfoliowert entnommen, um das reale Kapital zu erhalten.
        </div>
      </div>
    </div>
  )
}

export function KapitalerhaltConfiguration({
  formValue,
  updateFormValue,
  values,
  onChange,
}: KapitalerhaltConfigurationProps) {
  // Determine which mode we're in
  const isFormMode = formValue !== undefined && updateFormValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  if (!isFormMode && !isDirectMode) {
    throw new Error('KapitalerhaltConfiguration requires either (formValue + updateFormValue) or (values + onChange)')
  }

  // Get current values based on mode
  const currentValues = isFormMode
    ? {
        nominalReturn: formValue!.kapitalerhaltNominalReturn,
        inflationRate: formValue!.kapitalerhaltInflationRate,
      }
    : values!

  return (
    <div className="space-y-4">
      <NominalReturnSlider
        value={currentValues.nominalReturn}
        isFormMode={isFormMode}
        formValue={formValue}
        updateFormValue={updateFormValue}
        onChange={onChange}
      />

      <InflationRateSlider
        value={currentValues.inflationRate}
        isFormMode={isFormMode}
        formValue={formValue}
        updateFormValue={updateFormValue}
        onChange={onChange}
      />

      <RealReturnDisplay
        nominalReturn={currentValues.nominalReturn}
        inflationRate={currentValues.inflationRate}
      />
    </div>
  )
}
