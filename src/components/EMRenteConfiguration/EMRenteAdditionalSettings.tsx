import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import type { EMRenteConfig } from '../../../helpers/em-rente'

interface EMRenteAdditionalSettingsProps {
  config: EMRenteConfig
  onUpdate: (updates: Partial<EMRenteConfig>) => void
  annualIncreaseRateId: string
  taxablePercentageId: string
  monthlyAdditionalIncomeId: string
  zurechnungszeitenSwitchId: string
  abschlaegeSwitchId: string
}

export function EMRenteAdditionalSettings(props: EMRenteAdditionalSettingsProps) {
  const { config, onUpdate, annualIncreaseRateId, taxablePercentageId, monthlyAdditionalIncomeId, zurechnungszeitenSwitchId, abschlaegeSwitchId } = props

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={annualIncreaseRateId}>Jährliche Rentenanpassung (%)</Label>
          <Input id={annualIncreaseRateId} type="number" step="0.1" value={config.annualIncreaseRate} onChange={e => onUpdate({ annualIncreaseRate: parseFloat(e.target.value) || 1.0 })} min={0} max={10} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={taxablePercentageId}>Steuerpflichtiger Anteil (%)</Label>
          <Input id={taxablePercentageId} type="number" value={config.taxablePercentage} onChange={e => onUpdate({ taxablePercentage: parseFloat(e.target.value) || 80 })} min={0} max={100} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={monthlyAdditionalIncomeId}>Monatlicher Hinzuverdienst (€)</Label>
          <Input
            id={monthlyAdditionalIncomeId}
            type="number"
            value={config.monthlyAdditionalIncome || 0}
            onChange={e => onUpdate({ monthlyAdditionalIncome: parseFloat(e.target.value) || 0 })}
            min={0}
          />
          <p className="text-xs text-muted-foreground">
            Zusätzliches Einkommen neben der EM-Rente (Hinzuverdienstgrenzen werden automatisch berücksichtigt)
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch checked={config.applyZurechnungszeiten} onCheckedChange={checked => onUpdate({ applyZurechnungszeiten: checked })} id={zurechnungszeitenSwitchId} />
          <Label htmlFor={zurechnungszeitenSwitchId} className="cursor-pointer">Zurechnungszeiten berücksichtigen (bis 67. Lebensjahr)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={config.applyAbschlaege} onCheckedChange={checked => onUpdate({ applyAbschlaege: checked })} id={abschlaegeSwitchId} />
          <Label htmlFor={abschlaegeSwitchId} className="cursor-pointer">Abschläge anwenden (0,3% pro Monat, max. 10,8%)</Label>
        </div>
      </div>
    </>
  )
}

