import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import type { IndividualStatutoryPensionConfig } from '../../../helpers/statutory-pension'

interface PersonPensionFieldsProps {
  config: IndividualStatutoryPensionConfig
  onChange: (updates: Partial<IndividualStatutoryPensionConfig>) => void
  birthYear?: number
}

function MonthlyPensionField({
  config,
  onChange,
}: {
  config: IndividualStatutoryPensionConfig
  onChange: (updates: Partial<IndividualStatutoryPensionConfig>) => void
}) {
  return (
    <div className="space-y-2">
      <Label>Monatliche Rente (brutto) €</Label>
      <Input
        type="number"
        value={config.monthlyAmount}
        onChange={(e) => onChange({ monthlyAmount: Number(e.target.value) })}
        min={0}
        step={50}
        className="w-40"
      />
      <div className="text-sm text-muted-foreground">
        Jährliche Rente: {(config.monthlyAmount * 12).toLocaleString('de-DE')} €
      </div>
    </div>
  )
}

function RetirementAgeField({
  config,
  onChange,
  birthYear,
}: {
  config: IndividualStatutoryPensionConfig
  onChange: (updates: Partial<IndividualStatutoryPensionConfig>) => void
  birthYear?: number
}) {
  return (
    <div className="space-y-2">
      <Label>Renteneintrittsalter</Label>
      <Input
        type="number"
        value={config.retirementAge || 67}
        onChange={(e) => {
          const retirementAge = Number(e.target.value)
          const startYear = birthYear ? birthYear + retirementAge : config.startYear
          onChange({
            retirementAge,
            startYear,
          })
        }}
        min={60}
        max={75}
        className="w-32"
      />
      <div className="text-sm text-muted-foreground">
        Rentenbeginn: {birthYear ? birthYear + (config.retirementAge || 67) : config.startYear}
      </div>
    </div>
  )
}

function AnnualIncreaseRateSlider({ value, onChange }: { value: number; onChange: (rate: number) => void }) {
  return (
    <div className="space-y-2">
      <Label>Jährliche Rentenanpassung (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          min={0}
          max={5}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">{value.toFixed(1)}%</span>
          <span>5%</span>
        </div>
      </div>
    </div>
  )
}

function TaxablePercentageSlider({ value, onChange }: { value: number; onChange: (percentage: number) => void }) {
  return (
    <div className="space-y-2">
      <Label>Steuerpflichtiger Anteil (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          min={50}
          max={100}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>50%</span>
          <span className="font-medium text-gray-900">{value.toFixed(0)}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

export function PersonPensionFields({ config, onChange, birthYear }: PersonPensionFieldsProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MonthlyPensionField config={config} onChange={onChange} />
        <RetirementAgeField config={config} onChange={onChange} birthYear={birthYear} />
      </div>

      <AnnualIncreaseRateSlider
        value={config.annualIncreaseRate}
        onChange={(rate) => onChange({ annualIncreaseRate: rate })}
      />

      <TaxablePercentageSlider
        value={config.taxablePercentage}
        onChange={(percentage) => onChange({ taxablePercentage: percentage })}
      />
    </div>
  )
}
