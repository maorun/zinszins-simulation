import { formatCurrency } from '../../utils/currency'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface PrivateInsuranceInputProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  placeholder: string
  step: string
}

function PrivateInsuranceInput({ id, label, value, onChange, placeholder, step }: PrivateInsuranceInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        placeholder={placeholder}
      />
    </div>
  )
}

interface PrivateInsuranceInflationSliderProps {
  inflationRate: number
  onInflationRateChange: (rate: number) => void
}

function PrivateInsuranceInflationSlider({ inflationRate, onInflationRateChange }: PrivateInsuranceInflationSliderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="private-inflation-rate">
        Jährliche Steigerung:
        <br />
        {inflationRate.toFixed(1)}
        %
      </Label>
      <Slider
        id="private-inflation-rate"
        min={0}
        max={5}
        step={0.1}
        value={[inflationRate]}
        onValueChange={([value]) => onInflationRateChange(value)}
        className="w-full"
      />
      <div className="text-xs text-muted-foreground">
        Typisch: 2-4% jährliche Beitragssteigerung
      </div>
    </div>
  )
}

interface PrivateInsuranceSummaryProps {
  healthMonthly: number
  careMonthly: number
}

function PrivateInsuranceSummary({ healthMonthly, careMonthly }: PrivateInsuranceSummaryProps) {
  if (healthMonthly <= 0 || careMonthly <= 0) {
    return null
  }

  const totalMonthly = healthMonthly + careMonthly
  const totalYearly = totalMonthly * 12

  return (
    <div className="text-sm text-muted-foreground">
      <strong>Gesamt pro Monat:</strong>
      <br />
      {formatCurrency(totalMonthly)}
      <br />
      <strong>pro Jahr:</strong>
      <br />
      {formatCurrency(totalYearly)}
    </div>
  )
}

interface PrivateInsuranceConfigProps {
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
  privateInsuranceInflationRate: number
  onPrivateHealthInsuranceMonthlyChange: (amount: number) => void
  onPrivateCareInsuranceMonthlyChange: (amount: number) => void
  onPrivateInsuranceInflationRateChange: (rate: number) => void
}

export function PrivateInsuranceConfig({
  privateHealthInsuranceMonthly,
  privateCareInsuranceMonthly,
  privateInsuranceInflationRate,
  onPrivateHealthInsuranceMonthlyChange,
  onPrivateCareInsuranceMonthlyChange,
  onPrivateInsuranceInflationRateChange,
}: PrivateInsuranceConfigProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
        <h4 className="font-medium text-sm">Private Versicherungsbeiträge</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PrivateInsuranceInput
            id="private-health-monthly"
            label="Krankenversicherung (monatlich)"
            value={privateHealthInsuranceMonthly}
            onChange={onPrivateHealthInsuranceMonthlyChange}
            placeholder="z.B. 450"
            step="10"
          />
          <PrivateInsuranceInput
            id="private-care-monthly"
            label="Pflegeversicherung (monatlich)"
            value={privateCareInsuranceMonthly}
            onChange={onPrivateCareInsuranceMonthlyChange}
            placeholder="z.B. 60"
            step="5"
          />
          <PrivateInsuranceInflationSlider
            inflationRate={privateInsuranceInflationRate}
            onInflationRateChange={onPrivateInsuranceInflationRateChange}
          />
        </div>

        <PrivateInsuranceSummary
          healthMonthly={privateHealthInsuranceMonthly}
          careMonthly={privateCareInsuranceMonthly}
        />
      </div>
    </div>
  )
}
