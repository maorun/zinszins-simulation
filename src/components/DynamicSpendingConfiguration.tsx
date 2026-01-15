import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { AlertCircle, TrendingDown, Heart, Home, HelpCircle } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'
import { useMemo, useState, type ReactNode } from 'react'
import { generateFormId } from '../utils/unique-id'
import { type DynamicSpendingConfig, type RetirementPhase, calculateDynamicSpending, calculateDynamicSpendingSummary, validateDynamicSpendingConfig } from '../../helpers/dynamic-spending'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { PhaseConfiguration } from './dynamic-spending/PhaseConfiguration'
import { MedicalCostConfiguration } from './dynamic-spending/MedicalCostConfiguration'
import { LargeExpensesConfiguration } from './dynamic-spending/LargeExpensesConfiguration'
import { DynamicSpendingPreview } from './dynamic-spending/DynamicSpendingPreview'

interface DynamicSpendingConfigurationProps {
  config: DynamicSpendingConfig
  onChange: (config: DynamicSpendingConfig) => void
  retirementStartYear: number
  retirementEndYear: number
}

const PHASE_ICONS: Record<RetirementPhase, ReactNode> = {
  'go-go': <TrendingDown className="h-4 w-4" />,
  'slow-go': <Home className="h-4 w-4" />,
  'no-go': <Heart className="h-4 w-4" />,
}

function BasicConfigSection({ config, onChange, baseSpendingId, birthYearId, annualGiftsId }: { config: DynamicSpendingConfig; onChange: (config: DynamicSpendingConfig) => void; baseSpendingId: string; birthYearId: string; annualGiftsId: string }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Basis-Konfiguration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={baseSpendingId}>Basis-Jahresausgaben<TooltipProvider><Tooltip><TooltipTrigger asChild><HelpCircle className="inline h-3 w-3 ml-1" /></TooltipTrigger><TooltipContent><p>Gewünschte jährliche Ausgaben zu Beginn des Ruhestands (100% in Go-Go-Phase)</p></TooltipContent></Tooltip></TooltipProvider></Label>
          <Input id={baseSpendingId} type="number" value={config.baseAnnualSpending} onChange={(e) => onChange({ ...config, baseAnnualSpending: Number(e.target.value) })} min={0} step={1000} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={birthYearId}>Geburtsjahr</Label>
          <Input id={birthYearId} type="number" value={config.birthYear} onChange={(e) => onChange({ ...config, birthYear: Number(e.target.value) })} min={1900} max={2100} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={annualGiftsId}>Jährliche Geschenke/Spenden (optional)<TooltipProvider><Tooltip><TooltipTrigger asChild><HelpCircle className="inline h-3 w-3 ml-1" /></TooltipTrigger><TooltipContent><p>Regelmäßige jährliche Zuwendungen an Kinder, Enkel oder wohltätige Zwecke</p></TooltipContent></Tooltip></TooltipProvider></Label>
        <Input id={annualGiftsId} type="number" value={config.annualGifts || 0} onChange={(e) => onChange({ ...config, annualGifts: Number(e.target.value) })} min={0} step={500} />
      </div>
    </div>
  )
}

function PhasesSection({ config, onChange }: { config: DynamicSpendingConfig; onChange: (config: DynamicSpendingConfig) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Ruhestandsphasen</h3>
      <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Forschung zeigt: Ausgaben sinken typischerweise mit dem Alter. Die Phasen modellieren aktiven Ruhestand (Go-Go), reduzierte Aktivität (Slow-Go) und häuslichen Lebensstil (No-Go).</AlertDescription></Alert>
      <div className="space-y-4">
        <PhaseConfiguration phaseConfig={config.phaseConfig} onChange={(phaseConfig) => onChange({ ...config, phaseConfig })} phaseIcon={PHASE_ICONS['go-go']} phaseName="go-go" badgeVariant="default" badgeText="Aktiv" />
        <PhaseConfiguration phaseConfig={config.phaseConfig} onChange={(phaseConfig) => onChange({ ...config, phaseConfig })} phaseIcon={PHASE_ICONS['slow-go']} phaseName="slow-go" badgeVariant="secondary" badgeText="Reduziert" />
        <PhaseConfiguration phaseConfig={config.phaseConfig} onChange={(phaseConfig) => onChange({ ...config, phaseConfig })} phaseIcon={PHASE_ICONS['no-go']} phaseName="no-go" badgeVariant="outline" badgeText="Häuslich" />
      </div>
    </div>
  )
}

function ErrorSection({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null
  return (
    <>
      <Separator />
      <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription><ul className="list-disc list-inside space-y-1">{errors.map((error, index) => <li key={index}>{error}</li>)}</ul></AlertDescription></Alert>
    </>
  )
}

function ContentSections(props: { config: DynamicSpendingConfig; onChange: (config: DynamicSpendingConfig) => void; retirementStartYear: number; retirementEndYear: number; baseSpendingId: string; birthYearId: string; annualGiftsId: string; errors: string[]; preview: ReturnType<typeof calculateDynamicSpendingSummary> | null; showResults: boolean; setShowResults: (show: boolean) => void }) {
  return (
    <>
      <Separator />
      <BasicConfigSection config={props.config} onChange={props.onChange} baseSpendingId={props.baseSpendingId} birthYearId={props.birthYearId} annualGiftsId={props.annualGiftsId} />
      <Separator />
      <PhasesSection config={props.config} onChange={props.onChange} />
      <Separator />
      <MedicalCostConfiguration medicalCostConfig={props.config.medicalCostConfig} onChange={(medicalCostConfig) => props.onChange({ ...props.config, medicalCostConfig })} />
      <Separator />
      <LargeExpensesConfiguration largeExpenses={props.config.largeExpenses} onChange={(largeExpenses) => props.onChange({ ...props.config, largeExpenses })} retirementStartYear={props.retirementStartYear} retirementEndYear={props.retirementEndYear} />
      <ErrorSection errors={props.errors} />
      {props.errors.length === 0 && (
        <>
          <Separator />
          <DynamicSpendingPreview summary={props.preview} showResults={props.showResults} onToggle={() => props.setShowResults(!props.showResults)} />
        </>
      )}
    </>
  )
}

export function DynamicSpendingConfiguration({ config, onChange, retirementStartYear, retirementEndYear }: DynamicSpendingConfigurationProps) {
  const [showResults, setShowResults] = useState(false)
  const enabledId = useMemo(() => generateFormId('dynamic-spending', 'enabled'), [])
  const baseSpendingId = useMemo(() => generateFormId('dynamic-spending', 'base-spending'), [])
  const birthYearId = useMemo(() => generateFormId('dynamic-spending', 'birth-year'), [])
  const annualGiftsId = useMemo(() => generateFormId('dynamic-spending', 'annual-gifts'), [])
  const errors = useMemo(() => validateDynamicSpendingConfig(config), [config])
  const preview = useMemo(() => {
    if (!config.enabled || errors.length > 0 || !showResults) return null
    try {
      const results = calculateDynamicSpending(retirementStartYear, retirementEndYear, config)
      return calculateDynamicSpendingSummary(results)
    } catch {
      return null
    }
  }, [config, errors, retirementStartYear, retirementEndYear, showResults])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5" />Dynamische Ausgabenanpassung im Ruhestand</CardTitle>
        <CardDescription>Realistische Modellierung sich ändernder Ausgabenmuster mit zunehmendem Alter (Go-Go, Slow-Go, No-Go Phasen)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor={enabledId}>Dynamische Ausgabenanpassung aktivieren</Label>
            <p className="text-sm text-muted-foreground">Berücksichtigt altersbedingte Änderungen der Ausgaben im Ruhestand</p>
          </div>
          <Switch id={enabledId} checked={config.enabled} onCheckedChange={(enabled) => onChange({ ...config, enabled })} />
        </div>
        {config.enabled && <ContentSections config={config} onChange={onChange} retirementStartYear={retirementStartYear} retirementEndYear={retirementEndYear} baseSpendingId={baseSpendingId} birthYearId={birthYearId} annualGiftsId={annualGiftsId} errors={errors} preview={preview} showResults={showResults} setShowResults={setShowResults} />}
      </CardContent>
    </Card>
  )
}
