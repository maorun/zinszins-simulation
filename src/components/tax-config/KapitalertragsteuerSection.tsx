import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { GlossaryTerm } from '../GlossaryTerm'
import { DEFAULT_TAX_RATES } from '../../utils/business-constants'

interface KapitalertragsteuerSectionProps {
  steuerlast: number
  onSteuerlastChange: (value: number) => void
}

export function KapitalertragsteuerSection({ steuerlast, onSteuerlastChange }: KapitalertragsteuerSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="steuerlast">
          <GlossaryTerm term="kapitalertragsteuer">Kapitalertragsteuer</GlossaryTerm> (%)
        </Label>
        <Button variant="outline" size="sm" onClick={() => onSteuerlastChange(DEFAULT_TAX_RATES.KAPITALERTRAGSTEUER_PERCENT)} className="text-xs">
          Reset
        </Button>
      </div>
      <Slider
        id="steuerlast"
        value={[steuerlast]}
        onValueChange={([value]) => onSteuerlastChange(value)}
        min={20}
        max={35}
        step={0.025}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>20%</span>
        <span className="font-medium">{steuerlast}%</span>
        <span>35%</span>
      </div>
    </div>
  )
}
