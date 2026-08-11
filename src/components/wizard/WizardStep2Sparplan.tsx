import { useCallback, useMemo, type ChangeEvent } from 'react'
import { Slider } from '../ui/slider'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useSimulation } from '../../contexts/useSimulation'
import { convertSparplanToElements } from '../../utils/sparplan-utils'

function MonthlyAmountInput({
  value,
  onChange,
}: {
  value: number
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="space-y-3">
      <Label htmlFor="wizard-monthly-amount" className="text-base font-medium">
        Monatliche Sparrate
      </Label>
      <div className="flex items-center gap-3">
        <Input
          id="wizard-monthly-amount"
          type="number"
          min={0}
          max={100000}
          step={50}
          value={value}
          onChange={onChange}
          className="text-right text-lg font-semibold w-40"
        />
        <span className="text-lg font-medium text-muted-foreground">€ / Monat</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Entspricht <strong>{(value * 12).toLocaleString('de-DE')} € / Jahr</strong>
      </p>
    </div>
  )
}

function RenditeSlider({ rendite, onValueChange }: { rendite: number; onValueChange: (v: number[]) => void }) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Erwartete jährliche Rendite</Label>
      <Slider min={0} max={20} step={0.1} value={[rendite]} onValueChange={onValueChange} className="w-full" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0 %</span>
        <span className="font-semibold text-foreground text-base">{rendite.toFixed(1)} %</span>
        <span>20 %</span>
      </div>
      <p className="text-sm text-muted-foreground">ETF-Weltportfolios erzielen historisch etwa 7–8 % p.a. vor Inflation.</p>
    </div>
  )
}

function SparplanSummary({ monatlich, renditeFormatted }: { monatlich: number; renditeFormatted: string }) {
  return (
    <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Monatliche Sparrate:</span>
        <span className="font-medium">{monatlich.toLocaleString('de-DE')} €</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Jährliche Sparrate:</span>
        <span className="font-medium">{(monatlich * 12).toLocaleString('de-DE')} €</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Erwartete Rendite:</span>
        <span className="font-medium">{renditeFormatted} % p.a.</span>
      </div>
    </div>
  )
}

export function WizardStep2Sparplan() {
  const { sparplan, setSparplan, setSparplanElemente, startEnd, simulationAnnual, rendite, setRendite } =
    useSimulation()

  const monatlicheEinzahlung = Math.round((sparplan[0]?.einzahlung ?? 24000) / 12)
  const renditeFormatted = useMemo(() => rendite.toFixed(1), [rendite])

  const handleMonthlyAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const monatlich = Math.max(0, parseInt(e.target.value, 10) || 0)
      const updated = sparplan.map((sp, idx) => (idx === 0 ? { ...sp, einzahlung: monatlich * 12 } : sp))
      setSparplan(updated)
      setSparplanElemente(convertSparplanToElements(updated, startEnd, simulationAnnual))
    },
    [sparplan, setSparplan, setSparplanElemente, startEnd, simulationAnnual],
  )

  const handleRenditeChange = useCallback(([value]: number[]) => setRendite(value), [setRendite])

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">💰 Sparplan festlegen</h2>
        <p className="text-sm text-muted-foreground">
          Wie viel möchtest du monatlich investieren, und welche Rendite erwartest du?
        </p>
      </div>
      <div className="space-y-6">
        <MonthlyAmountInput value={monatlicheEinzahlung} onChange={handleMonthlyAmountChange} />
        <RenditeSlider rendite={rendite} onValueChange={handleRenditeChange} />
        <SparplanSummary monatlich={monatlicheEinzahlung} renditeFormatted={renditeFormatted} />
      </div>
    </div>
  )
}
