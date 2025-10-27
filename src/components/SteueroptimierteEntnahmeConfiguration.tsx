import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  label: string
}

function WithdrawalRateSlider({ value, onChange, min, max, step, label }: SliderProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        <Slider
          value={[value * 100]}
          onValueChange={([val]) => onChange(val / 100)}
          min={min}
          max={max}
          step={step}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {min}
            %
          </span>
          <span className="font-medium text-gray-900">
            {(value * 100).toFixed(1)}
            %
          </span>
          <span>
            {max}
            %
          </span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Ausgangspunkt für die Entnahme, wird steueroptimiert angepasst.
      </div>
    </div>
  )
}

interface OptimizationStrategyRadioGroupProps {
  value: 'minimize_taxes' | 'maximize_after_tax' | 'balanced'
  onChange: (value: 'minimize_taxes' | 'maximize_after_tax' | 'balanced') => void
}

function OptimizationStrategyRadioGroup({ value, onChange }: OptimizationStrategyRadioGroupProps) {
  return (
    <div className="space-y-2">
      <Label>Optimierungsstrategie</Label>
      <RadioTileGroup
        value={value}
        onValueChange={val => onChange(val as 'minimize_taxes' | 'maximize_after_tax' | 'balanced')}
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
      <div className="text-sm text-muted-foreground">Bestimmt das Hauptziel der Steueroptimierung.</div>
    </div>
  )
}

function FreibetragSlider({ value, onChange, min, max, step, label }: SliderProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        <Slider
          value={[value * 100]}
          onValueChange={([val]) => onChange(val / 100)}
          min={min}
          max={max}
          step={step}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {min}
            %
          </span>
          <span className="font-medium text-gray-900">
            {(value * 100).toFixed(0)}
            %
          </span>
          <span>
            {max}
            %
          </span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Angestrebte Nutzung des verfügbaren Sparerpauschbetrags (Freibetrag).
      </div>
    </div>
  )
}

function TargetTaxRateSlider({ value, onChange, min, max, step, label }: SliderProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        <Slider
          value={[value * 100]}
          onValueChange={([val]) => onChange(val / 100)}
          min={min}
          max={max}
          step={step}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {min}
            %
          </span>
          <span className="font-medium text-gray-900">
            {(value * 100).toFixed(1)}
            %
          </span>
          <span>
            {max}
            %
          </span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Ziel-Steuersatz für die Optimierung (inklusive Solidaritätszuschlag).
      </div>
    </div>
  )
}

interface SteueroptimierteEntnahmeConfigurationProps {
  formValue?: any
  updateFormValue?: any
  values?: any
  onChange?: any
}

export function SteueroptimierteEntnahmeConfiguration({
  formValue,
  updateFormValue,
  values,
  onChange,
}: SteueroptimierteEntnahmeConfigurationProps) {
  const isFormMode = formValue !== undefined && updateFormValue !== undefined
  const currentValues = isFormMode
    ? {
        baseWithdrawalRate: formValue!.steueroptimierteEntnahmeBaseWithdrawalRate,
        targetTaxRate: formValue!.steueroptimierteEntnahmeTargetTaxRate,
        optimizationMode: formValue!.steueroptimierteEntnahmeOptimizationMode,
        freibetragUtilizationTarget: formValue!.steueroptimierteEntnahmeFreibetragUtilizationTarget,
      }
    : values!

  const handleChange = (field: string, newValue: any) => {
    if (isFormMode) {
      updateFormValue!({ ...formValue!, [field]: newValue })
    }
    else {
      const handlerName = `on${field.charAt(0).toUpperCase()}${field.slice(1)}Change`.replace(
        'steueroptimierteEntnahme',
        '',
      )
      onChange![handlerName]!(newValue)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-green-50 border-green-200">
      <div className="mb-4">
        <Label className="text-base font-semibold text-green-800">
          🎯 Steueroptimierte Entnahme-Konfiguration
        </Label>
        <p className="text-sm text-green-700 mt-1">
          Optimiert automatisch die Entnahmebeträge zur Minimierung der Steuerlast unter Berücksichtigung
          deutscher Steuerregeln.
        </p>
      </div>

      <WithdrawalRateSlider
        value={currentValues.baseWithdrawalRate}
        onChange={val => handleChange('steueroptimierteEntnahmeBaseWithdrawalRate', val)}
        min={1}
        max={8}
        step={0.1}
        label="Basis-Entnahmerate (%)"
      />
      <OptimizationStrategyRadioGroup
        value={currentValues.optimizationMode}
        onChange={val => handleChange('steueroptimierteEntnahmeOptimizationMode', val)}
      />
      <FreibetragSlider
        value={currentValues.freibetragUtilizationTarget}
        onChange={val => handleChange('steueroptimierteEntnahmeFreibetragUtilizationTarget', val)}
        min={50}
        max={100}
        step={5}
        label="Freibetrag-Nutzungsziel (%)"
      />
      <TargetTaxRateSlider
        value={currentValues.targetTaxRate}
        onChange={val => handleChange('steueroptimierteEntnahmeTargetTaxRate', val)}
        min={20}
        max={35}
        step={0.5}
        label="Ziel-Steuersatz (%)"
      />

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
