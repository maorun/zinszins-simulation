import { Slider } from './ui/slider'
import { Label } from './ui/label'

interface KapitalerhaltFormValues {
  kapitalerhaltNominalReturn: number
  kapitalerhaltInflationRate: number
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

  const realReturn = currentValues.nominalReturn - currentValues.inflationRate

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Erwartete nominale Rendite (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[currentValues.nominalReturn]}
            onValueChange={(values: number[]) => {
              const newValue = values[0]
              if (isFormMode) {
                updateFormValue!({
                  ...formValue!,
                  kapitalerhaltNominalReturn: newValue,
                })
              }
              else {
                onChange!.onNominalReturnChange(newValue)
              }
            }}
            min={0}
            max={15}
            step={0.1}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span className="font-medium text-gray-900">
              {currentValues.nominalReturn.toFixed(1)}
              %
            </span>
            <span>15%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Die erwartete jährliche Rendite des Portfolios vor Berücksichtigung der Inflation.
        </div>
      </div>

      <div className="space-y-2">
        <Label>Erwartete Inflationsrate (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[currentValues.inflationRate]}
            onValueChange={(values: number[]) => {
              const newValue = values[0]
              if (isFormMode) {
                updateFormValue!({
                  ...formValue!,
                  kapitalerhaltInflationRate: newValue,
                })
              }
              else {
                onChange!.onInflationRateChange(newValue)
              }
            }}
            min={0}
            max={8}
            step={0.1}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span className="font-medium text-gray-900">
              {currentValues.inflationRate.toFixed(1)}
              %
            </span>
            <span>8%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Die erwartete jährliche Inflationsrate zur Berechnung der realen Rendite.
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="text-sm">
          <div className="font-medium text-blue-900 mb-1">Berechnete reale Entnahmerate:</div>
          <div className="text-blue-800">
            {currentValues.nominalReturn.toFixed(1)}
            % -
            {currentValues.inflationRate.toFixed(1)}
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
    </div>
  )
}
