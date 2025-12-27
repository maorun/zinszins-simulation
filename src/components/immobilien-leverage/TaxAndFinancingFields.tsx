import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { PropertyFinancingConfig } from '../../../helpers/immobilien-leverage'

interface TaxFieldProps {
  config: PropertyFinancingConfig
  ids: Record<string, string>
  afaRate: string
  onConfigChange: <K extends keyof PropertyFinancingConfig>(key: K, value: PropertyFinancingConfig[K]) => void
}

function TaxField({ config, ids, afaRate, onConfigChange }: TaxFieldProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={ids.taxRate}>Grenzsteuersatz (%)</Label>
        <Input
          id={ids.taxRate}
          type="number"
          min={0}
          max={50}
          step={1}
          value={config.personalTaxRate}
          onChange={e => onConfigChange('personalTaxRate', parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">Für Zinsabzug und AfA</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.buildingYear}>Baujahr</Label>
        <Input
          id={ids.buildingYear}
          type="number"
          min={1900}
          max={2030}
          step={1}
          value={config.buildingYear}
          onChange={e => onConfigChange('buildingYear', parseInt(e.target.value) || 2020)}
        />
        <p className="text-xs text-muted-foreground">AfA-Satz: {afaRate}</p>
      </div>
    </>
  )
}

interface FinancingFieldProps {
  baseInterestRate: number
  baseInterestId: string
  onBaseInterestChange: (value: number) => void
}

function FinancingField({ baseInterestRate, baseInterestId, onBaseInterestChange }: FinancingFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={baseInterestId}>Basis-Zinssatz (%)</Label>
      <Input
        id={baseInterestId}
        type="number"
        min={0}
        max={10}
        step={0.1}
        value={baseInterestRate}
        onChange={e => onBaseInterestChange(parseFloat(e.target.value) || 3.5)}
      />
      <p className="text-xs text-muted-foreground">Für Szenarien-Berechnung</p>
    </div>
  )
}

interface TaxAndFinancingFieldsProps {
  config: PropertyFinancingConfig
  ids: Record<string, string>
  baseInterestRate: number
  afaRate: string
  onConfigChange: <K extends keyof PropertyFinancingConfig>(key: K, value: PropertyFinancingConfig[K]) => void
  onBaseInterestChange: (value: number) => void
}

export function TaxAndFinancingFields({
  config,
  ids,
  baseInterestRate,
  afaRate,
  onConfigChange,
  onBaseInterestChange,
}: TaxAndFinancingFieldsProps) {
  return (
    <>
      <TaxField config={config} ids={ids} afaRate={afaRate} onConfigChange={onConfigChange} />
      <FinancingField
        baseInterestRate={baseInterestRate}
        baseInterestId={ids.baseInterest}
        onBaseInterestChange={onBaseInterestChange}
      />
    </>
  )
}
