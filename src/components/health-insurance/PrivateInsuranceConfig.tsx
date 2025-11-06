import { formatCurrency } from '../../utils/currency'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface PrivateInsuranceConfigProps {
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
  privateInsuranceInflationRate: number
  onPrivateHealthInsuranceMonthlyChange: (amount: number) => void
  onPrivateCareInsuranceMonthlyChange: (amount: number) => void
  onPrivateInsuranceInflationRateChange: (rate: number) => void
}

interface MonthlyContributionInputsProps {
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
  onPrivateHealthInsuranceMonthlyChange: (amount: number) => void
  onPrivateCareInsuranceMonthlyChange: (amount: number) => void
}

function MonthlyContributionInputs({
  privateHealthInsuranceMonthly,
  privateCareInsuranceMonthly,
  onPrivateHealthInsuranceMonthlyChange,
  onPrivateCareInsuranceMonthlyChange,
}: MonthlyContributionInputsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="private-health-monthly">Krankenversicherung (monatlich)</Label>
        <Input
          id="private-health-monthly"
          type="number"
          min="0"
          step="10"
          value={privateHealthInsuranceMonthly}
          onChange={e => onPrivateHealthInsuranceMonthlyChange(Number(e.target.value))}
          placeholder="z.B. 450"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="private-care-monthly">Pflegeversicherung (monatlich)</Label>
        <Input
          id="private-care-monthly"
          type="number"
          min="0"
          step="5"
          value={privateCareInsuranceMonthly}
          onChange={e => onPrivateCareInsuranceMonthlyChange(Number(e.target.value))}
          placeholder="z.B. 60"
        />
      </div>
    </>
  )
}

interface InflationRateSliderProps {
  privateInsuranceInflationRate: number
  onPrivateInsuranceInflationRateChange: (rate: number) => void
}

function InflationRateSlider({
  privateInsuranceInflationRate,
  onPrivateInsuranceInflationRateChange,
}: InflationRateSliderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="private-inflation-rate">Jährliche Steigerung: {privateInsuranceInflationRate.toFixed(1)}%</Label>
      <Slider
        id="private-inflation-rate"
        min={0}
        max={5}
        step={0.1}
        value={[privateInsuranceInflationRate]}
        onValueChange={([value]) => onPrivateInsuranceInflationRateChange(value)}
        className="w-full"
      />
      <div className="text-xs text-muted-foreground">Typisch: 2-4% jährliche Beitragssteigerung</div>
    </div>
  )
}

interface TotalContributionDisplayProps {
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
}

function TotalContributionDisplay({
  privateHealthInsuranceMonthly,
  privateCareInsuranceMonthly,
}: TotalContributionDisplayProps) {
  if (privateHealthInsuranceMonthly <= 0 || privateCareInsuranceMonthly <= 0) {
    return null
  }

  const totalMonthly = privateHealthInsuranceMonthly + privateCareInsuranceMonthly
  const totalYearly = totalMonthly * 12

  return (
    <div className="text-sm text-muted-foreground">
      <strong>Gesamt pro Monat:</strong> {formatCurrency(totalMonthly)} <strong>pro Jahr:</strong>{' '}
      {formatCurrency(totalYearly)}
    </div>
  )
}

export function PrivateInsuranceConfig(props: PrivateInsuranceConfigProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
        <h4 className="font-medium text-sm">Private Versicherungsbeiträge</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MonthlyContributionInputs {...props} />
          <InflationRateSlider {...props} />
        </div>
        <TotalContributionDisplay {...props} />
      </div>
    </div>
  )
}
