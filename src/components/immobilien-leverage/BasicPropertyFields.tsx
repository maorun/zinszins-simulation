import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { PropertyFinancingConfig } from '../../../helpers/immobilien-leverage'
import { formatCurrency } from '../../utils/currency'

interface PriceFieldsProps {
  config: PropertyFinancingConfig
  ids: Record<string, string>
  onConfigChange: <K extends keyof PropertyFinancingConfig>(key: K, value: PropertyFinancingConfig[K]) => void
}

export function PriceFields({ config, ids, onConfigChange }: PriceFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={ids.totalPrice}>Kaufpreis gesamt (€)</Label>
        <Input
          id={ids.totalPrice}
          type="number"
          min={50000}
          step={10000}
          value={config.totalPurchasePrice}
          onChange={e => onConfigChange('totalPurchasePrice', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.buildingValue}>Gebäudewert (€)</Label>
        <Input
          id={ids.buildingValue}
          type="number"
          min={0}
          step={5000}
          value={config.buildingValue}
          onChange={e => onConfigChange('buildingValue', parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">Für AfA-Berechnung (ca. 75% des Kaufpreises)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.landValue}>Grundstückswert (€)</Label>
        <Input
          id={ids.landValue}
          type="number"
          min={0}
          step={5000}
          value={config.landValue}
          onChange={e => onConfigChange('landValue', parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">Nicht abschreibbar</p>
      </div>
    </>
  )
}

interface IncomeFieldsProps {
  config: PropertyFinancingConfig
  ids: Record<string, string>
  grossYield: number
  operatingCostsAmount: number
  onConfigChange: <K extends keyof PropertyFinancingConfig>(key: K, value: PropertyFinancingConfig[K]) => void
}

export function IncomeFields({ config, ids, grossYield, operatingCostsAmount, onConfigChange }: IncomeFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={ids.annualRent}>Jahresmiete brutto (€)</Label>
        <Input
          id={ids.annualRent}
          type="number"
          min={0}
          step={1000}
          value={config.annualRentalIncome}
          onChange={e => onConfigChange('annualRentalIncome', parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">Bruttomietrendite: {grossYield.toFixed(2)}%</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.operatingCosts}>Bewirtschaftungskosten (%)</Label>
        <Input
          id={ids.operatingCosts}
          type="number"
          min={0}
          max={50}
          step={1}
          value={config.operatingCostsRate}
          onChange={e => onConfigChange('operatingCostsRate', parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">{formatCurrency(operatingCostsAmount)}/Jahr</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.appreciation}>Wertsteigerung p.a. (%)</Label>
        <Input
          id={ids.appreciation}
          type="number"
          min={-5}
          max={10}
          step={0.1}
          value={config.appreciationRate}
          onChange={e => onConfigChange('appreciationRate', parseFloat(e.target.value) || 0)}
        />
      </div>
    </>
  )
}
