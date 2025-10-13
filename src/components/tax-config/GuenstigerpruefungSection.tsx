import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { GlossaryTerm } from '../GlossaryTerm'

interface GuenstigerpruefungSectionProps {
  guenstigerPruefungAktiv: boolean
  personalTaxRate: number
  onGuenstigerPruefungAktivChange: (value: boolean) => void
  onPersonalTaxRateChange: (value: number) => void
}

export function GuenstigerpruefungSection({
  guenstigerPruefungAktiv,
  personalTaxRate,
  onGuenstigerPruefungAktivChange,
  onPersonalTaxRateChange,
}: GuenstigerpruefungSectionProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-blue-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-medium">
            🔍
            {' '}
            <GlossaryTerm term="guenstigerpruefung">
              Günstigerprüfung
            </GlossaryTerm>
          </Label>
          <p className="text-sm text-muted-foreground">
            Automatische Wahl zwischen Abgeltungssteuer und persönlichem Steuersatz
          </p>
        </div>
        <Switch
          id="guenstigerPruefungAktiv"
          checked={guenstigerPruefungAktiv}
          onCheckedChange={onGuenstigerPruefungAktivChange}
        />
      </div>

      {guenstigerPruefungAktiv && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="personalTaxRate">
              Persönlicher Steuersatz (%)
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPersonalTaxRateChange(25)}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
          <Slider
            id="personalTaxRate"
            value={[personalTaxRate]}
            onValueChange={([value]) => onPersonalTaxRateChange(value)}
            min={0}
            max={45}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">
              {personalTaxRate}
              %
            </span>
            <span>45%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Ihr persönlicher Einkommensteuersatz. Bei aktivierter Günstigerprüfung wird automatisch
            der günstigere Steuersatz (Abgeltungssteuer vs. persönlicher Steuersatz) verwendet.
          </p>
        </div>
      )}
    </div>
  )
}
