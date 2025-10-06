import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'

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

export function SteueroptimierteEntnahmeConfiguration({
  formValue,
  updateFormValue,
  values,
  onChange,
}: SteueroptimierteEntnahmeConfigurationProps) {
  // Determine which mode we're in
  const isFormMode = formValue !== undefined && updateFormValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  if (!isFormMode && !isDirectMode) {
    throw new Error('SteueroptimierteEntnahmeConfiguration requires either (formValue + updateFormValue) or (values + onChange)')
  }

  // Get current values based on mode
  const currentValues = isFormMode
    ? {
        baseWithdrawalRate: formValue!.steueroptimierteEntnahmeBaseWithdrawalRate,
        targetTaxRate: formValue!.steueroptimierteEntnahmeTargetTaxRate,
        optimizationMode: formValue!.steueroptimierteEntnahmeOptimizationMode,
        freibetragUtilizationTarget: formValue!.steueroptimierteEntnahmeFreibetragUtilizationTarget,
        rebalanceFrequency: formValue!.steueroptimierteEntnahmeRebalanceFrequency,
      }
    : values!

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-green-50 border-green-200">
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

      <div className="space-y-2">
        <Label>Basis-Entnahmerate (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[currentValues.baseWithdrawalRate * 100]}
            onValueChange={(values: number[]) => {
              const newValue = values[0] / 100
              if (isFormMode) {
                updateFormValue!({
                  ...formValue!,
                  steueroptimierteEntnahmeBaseWithdrawalRate: newValue,
                })
              }
              else {
                onChange!.onBaseWithdrawalRateChange(newValue)
              }
            }}
            min={1}
            max={8}
            step={0.1}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>1%</span>
            <span className="font-medium text-gray-900">
              {(currentValues.baseWithdrawalRate * 100).toFixed(1)}
              %
            </span>
            <span>8%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Ausgangspunkt für die Entnahme, wird steueroptimiert angepasst.
        </div>
      </div>

      <div className="space-y-2">
        <Label>Optimierungsstrategie</Label>
        <RadioTileGroup
          value={currentValues.optimizationMode}
          onValueChange={(value) => {
            const newValue = value as 'minimize_taxes' | 'maximize_after_tax' | 'balanced'
            if (isFormMode) {
              updateFormValue!({
                ...formValue!,
                steueroptimierteEntnahmeOptimizationMode: newValue,
              })
            }
            else {
              onChange!.onOptimizationModeChange(newValue)
            }
          }}
        >
          <RadioTile value="minimize_taxes" label="Steuerminimierung">
            Minimiere die Gesamtsteuerlast
          </RadioTile>
          <RadioTile value="maximize_after_tax" label="Netto-Maximierung">
            Maximiere das Netto-Einkommen
          </RadioTile>
          <RadioTile value="balanced" label="Ausgewogen">
            Balance zwischen Steueroptimierung und stabilen Entnahmen
          </RadioTile>
        </RadioTileGroup>
        <div className="text-sm text-muted-foreground">
          Bestimmt das Hauptziel der Steueroptimierung.
        </div>
      </div>

      <div className="space-y-2">
        <Label>Freibetrag-Nutzungsziel (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[currentValues.freibetragUtilizationTarget * 100]}
            onValueChange={(values: number[]) => {
              const newValue = values[0] / 100
              if (isFormMode) {
                updateFormValue!({
                  ...formValue!,
                  steueroptimierteEntnahmeFreibetragUtilizationTarget: newValue,
                })
              }
              else {
                onChange!.onFreibetragUtilizationTargetChange(newValue)
              }
            }}
            min={50}
            max={100}
            step={5}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>50%</span>
            <span className="font-medium text-gray-900">
              {(currentValues.freibetragUtilizationTarget * 100).toFixed(0)}
              %
            </span>
            <span>100%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Angestrebte Nutzung des verfügbaren Sparerpauschbetrags (Freibetrag).
        </div>
      </div>

      <div className="space-y-2">
        <Label>Ziel-Steuersatz (%)</Label>
        <div className="space-y-2">
          <Slider
            value={[currentValues.targetTaxRate * 100]}
            onValueChange={(values: number[]) => {
              const newValue = values[0] / 100
              if (isFormMode) {
                updateFormValue!({
                  ...formValue!,
                  steueroptimierteEntnahmeTargetTaxRate: newValue,
                })
              }
              else {
                onChange!.onTargetTaxRateChange(newValue)
              }
            }}
            min={20}
            max={35}
            step={0.5}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>20%</span>
            <span className="font-medium text-gray-900">
              {(currentValues.targetTaxRate * 100).toFixed(1)}
              %
            </span>
            <span>35%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Ziel-Steuersatz für die Optimierung (inklusive Solidaritätszuschlag).
        </div>
      </div>

      <div className="bg-green-100 border border-green-300 rounded-md p-3">
        <div className="text-sm">
          <div className="font-medium text-green-900 mb-1">💡 Steueroptimierung:</div>
          <div className="text-green-800 text-xs space-y-1">
            <div>• Berücksichtigt Vorabpauschale und Basiszins</div>
            <div>• Nutzt Sparerpauschbetrag (Freibetrag) optimal</div>
            <div>• Passt Entnahmebeträge dynamisch an</div>
            <div>• Berücksichtigt Günstigerprüfung bei hohen Einkommen</div>
          </div>
        </div>
      </div>
    </div>
  )
}
