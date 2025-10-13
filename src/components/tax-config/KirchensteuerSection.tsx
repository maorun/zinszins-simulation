import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { Label } from '../ui/label'

interface KirchensteuerSectionProps {
  kirchensteuerAktiv: boolean
  kirchensteuersatz: number
  onKirchensteuerAktivChange: (value: boolean) => void
  onKirchensteuersatzChange: (value: number) => void
}

export function KirchensteuerSection({
  kirchensteuerAktiv,
  kirchensteuersatz,
  onKirchensteuerAktivChange,
  onKirchensteuersatzChange,
}: KirchensteuerSectionProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-purple-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-medium">⛪ Kirchensteuer</Label>
          <p className="text-sm text-muted-foreground">
            Kirchensteuer wird als Prozentsatz der Einkommensteuer berechnet (8-9% je nach Bundesland)
          </p>
        </div>
        <Switch
          id="kirchensteuerAktiv"
          checked={kirchensteuerAktiv}
          onCheckedChange={onKirchensteuerAktivChange}
        />
      </div>

      {kirchensteuerAktiv && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="kirchensteuersatz">
              Kirchensteuersatz (%)
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onKirchensteuersatzChange(9)}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
          <Slider
            id="kirchensteuersatz"
            value={[kirchensteuersatz]}
            onValueChange={([value]) => onKirchensteuersatzChange(value)}
            min={8}
            max={9}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>8%</span>
            <span className="font-medium">
              {kirchensteuersatz}
              %
            </span>
            <span>9%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Kirchensteuer: Bayern/Baden-Württemberg 8%, andere Bundesländer 9%.
            Wird automatisch bei der Günstigerprüfung und Einkommensteuerberechnung berücksichtigt.
          </p>
        </div>
      )}
    </div>
  )
}
