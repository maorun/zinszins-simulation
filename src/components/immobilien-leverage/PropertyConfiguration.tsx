import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { PropertyFinancingConfig } from '../../../helpers/immobilien-leverage'
import { formatCurrency } from '../../utils/currency'

interface PropertyConfigurationProps {
  config: PropertyFinancingConfig
  baseInterestRate: number
  ids: Record<string, string>
  onConfigChange: <K extends keyof PropertyFinancingConfig>(key: K, value: PropertyFinancingConfig[K]) => void
  onBaseInterestChange: (value: number) => void
}

export function PropertyConfiguration({
  config,
  baseInterestRate,
  ids,
  onConfigChange,
  onBaseInterestChange,
}: PropertyConfigurationProps) {
  const afaRate =
    config.buildingYear < 1925 ? '2,5%' : config.buildingYear >= 2023 ? '3%' : '2%'

  const grossYield = (config.annualRentalIncome / config.totalPurchasePrice) * 100
  const operatingCostsAmount = config.annualRentalIncome * (config.operatingCostsRate / 100)

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-sm font-semibold">Immobilien-Parameter</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <p className="text-xs text-muted-foreground">
            Für AfA-Berechnung (ca. 75% des Kaufpreises)
          </p>
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
          <p className="text-xs text-muted-foreground">
            Bruttomietrendite: {grossYield.toFixed(2)}%
          </p>
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
          <p className="text-xs text-muted-foreground">
            {formatCurrency(operatingCostsAmount)}/Jahr
          </p>
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

        <div className="space-y-2">
          <Label htmlFor={ids.baseInterest}>Basis-Zinssatz (%)</Label>
          <Input
            id={ids.baseInterest}
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={baseInterestRate}
            onChange={e => onBaseInterestChange(parseFloat(e.target.value) || 3.5)}
          />
          <p className="text-xs text-muted-foreground">Für Szenarien-Berechnung</p>
        </div>
      </div>
    </div>
  )
}
