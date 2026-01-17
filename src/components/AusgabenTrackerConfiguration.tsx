import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import {
  AlertCircle,
  Euro,
  Heart,
  Plane,
  Activity,
  Home,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'
import { useMemo, useState, type ReactNode } from 'react'
import { generateFormId } from '../utils/unique-id'
import {
  type AusgabenTrackerConfig,
  type AusgabenKategorie,
  type JahresAusgaben,
  berechneAusgabenZeitraum,
  validateAusgabenTrackerConfig,
  berechneGesamtausgaben,
  berechneDurchschnittlicheAusgaben,
  findeHoechsteAusgaben,
  findeNiedrigsteAusgaben,
  KATEGORIE_NAMEN,
  LEBENSABSCHNITT_NAMEN,
} from '../../helpers/ausgaben-tracker'
import { formatCurrency } from '../utils/currency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

interface AusgabenTrackerConfigurationProps {
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
  retirementStartYear: number
  retirementEndYear: number
}

const KATEGORIE_ICONS: Record<AusgabenKategorie, ReactNode> = {
  fixkosten: <Home className="h-4 w-4" />,
  lebenshaltung: <ShoppingBag className="h-4 w-4" />,
  gesundheit: <Heart className="h-4 w-4" />,
  freizeit: <Activity className="h-4 w-4" />,
  reisen: <Plane className="h-4 w-4" />,
  einmalig: <Euro className="h-4 w-4" />,
}

function KategorieHeader({
  kategorie,
  aktivId,
  katConfig,
  config,
  onChange,
}: {
  kategorie: AusgabenKategorie
  aktivId: string
  katConfig: { betrag: number; inflationsrate: number; aktiv: boolean }
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {KATEGORIE_ICONS[kategorie]}
        <Label htmlFor={aktivId} className="font-medium">
          {KATEGORIE_NAMEN[kategorie]}
        </Label>
      </div>
      <Switch
        id={aktivId}
        checked={katConfig.aktiv}
        onCheckedChange={(checked) =>
          onChange({
            ...config,
            kategorien: {
              ...config.kategorien,
              [kategorie]: { ...katConfig, aktiv: checked },
            },
          })
        }
      />
    </div>
  )
}

function BetragInput({
  betragId,
  katConfig,
  kategorie,
  config,
  onChange,
}: {
  betragId: string
  katConfig: { betrag: number; inflationsrate: number; aktiv: boolean }
  kategorie: AusgabenKategorie
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={betragId} className="text-xs">
        Monatlich (€)
      </Label>
      <Input
        id={betragId}
        type="number"
        value={katConfig.betrag}
        onChange={(e) =>
          onChange({
            ...config,
            kategorien: {
              ...config.kategorien,
              [kategorie]: {
                ...katConfig,
                betrag: Number(e.target.value),
              },
            },
          })
        }
        min={0}
        step={50}
      />
    </div>
  )
}

function InflationInput({
  inflationId,
  katConfig,
  kategorie,
  config,
  onChange,
}: {
  inflationId: string
  katConfig: { betrag: number; inflationsrate: number; aktiv: boolean }
  kategorie: AusgabenKategorie
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={inflationId} className="text-xs">
        Inflation (% p.a.)
      </Label>
      <Input
        id={inflationId}
        type="number"
        value={(katConfig.inflationsrate * 100).toFixed(1)}
        onChange={(e) =>
          onChange({
            ...config,
            kategorien: {
              ...config.kategorien,
              [kategorie]: {
                ...katConfig,
                inflationsrate: Number(e.target.value) / 100,
              },
            },
          })
        }
        min={0}
        max={20}
        step={0.1}
      />
    </div>
  )
}

function KategorieInputs({
  betragId,
  inflationId,
  katConfig,
  kategorie,
  config,
  onChange,
}: {
  betragId: string
  inflationId: string
  katConfig: { betrag: number; inflationsrate: number; aktiv: boolean }
  kategorie: AusgabenKategorie
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <BetragInput
        betragId={betragId}
        katConfig={katConfig}
        kategorie={kategorie}
        config={config}
        onChange={onChange}
      />
      <InflationInput
        inflationId={inflationId}
        katConfig={katConfig}
        kategorie={kategorie}
        config={config}
        onChange={onChange}
      />
    </div>
  )
}

function KategorieCardContent({
  kategorie,
  katConfig,
  config,
  onChange,
  aktivId,
  betragId,
  inflationId,
}: {
  kategorie: AusgabenKategorie
  katConfig: { betrag: number; inflationsrate: number; aktiv: boolean }
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
  aktivId: string
  betragId: string
  inflationId: string
}) {
  return (
    <div className="space-y-3">
      <KategorieHeader
        kategorie={kategorie}
        aktivId={aktivId}
        katConfig={katConfig}
        config={config}
        onChange={onChange}
      />
      {katConfig.aktiv && (
        <KategorieInputs
          betragId={betragId}
          inflationId={inflationId}
          katConfig={katConfig}
          kategorie={kategorie}
          config={config}
          onChange={onChange}
        />
      )}
    </div>
  )
}

function KategorieCard({
  kategorie,
  config,
  onChange,
}: {
  kategorie: AusgabenKategorie
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
}) {
  const katConfig = config.kategorien[kategorie]
  const aktivId = useMemo(
    () => generateFormId('ausgaben-tracker', kategorie, 'aktiv'),
    [kategorie],
  )
  const betragId = useMemo(
    () => generateFormId('ausgaben-tracker', kategorie, 'betrag'),
    [kategorie],
  )
  const inflationId = useMemo(
    () => generateFormId('ausgaben-tracker', kategorie, 'inflation'),
    [kategorie],
  )

  return (
    <Card className={!katConfig.aktiv ? 'opacity-60' : ''}>
      <CardContent className="pt-4">
        <KategorieCardContent
          kategorie={kategorie}
          katConfig={katConfig}
          config={config}
          onChange={onChange}
          aktivId={aktivId}
          betragId={betragId}
          inflationId={inflationId}
        />
      </CardContent>
    </Card>
  )
}

function KategorieConfigSection({
  config,
  onChange,
}: {
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
}) {
  const kategorien: AusgabenKategorie[] = [
    'fixkosten',
    'lebenshaltung',
    'gesundheit',
    'freizeit',
    'reisen',
    'einmalig',
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Ausgabenkategorien</h3>
        <p className="text-sm text-muted-foreground">
          Konfigurieren Sie Ihre monatlichen Ausgaben je Kategorie mit individuellen Inflationsraten
        </p>
      </div>

      <div className="space-y-3">
        {kategorien.map((kategorie) => (
          <KategorieCard
            key={kategorie}
            kategorie={kategorie}
            config={config}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}

function LebensabschnitteInfo() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Ausgaben verändern sich mit dem Alter: Mehr Reisen in der aktiven Phase, erhöhte
        Gesundheitskosten bei eingeschränkter Mobilität, deutlich höhere Pflegekosten im hohen
        Alter.
      </AlertDescription>
    </Alert>
  )
}

function GeburtjahrSection({
  config,
  onChange,
}: {
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
}) {
  const geburtjahrId = useMemo(() => generateFormId('ausgaben-tracker', 'geburtsjahr'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={geburtjahrId}>Geburtsjahr</Label>
      <Input
        id={geburtjahrId}
        type="number"
        value={config.geburtsjahr}
        onChange={(e) => onChange({ ...config, geburtsjahr: Number(e.target.value) })}
        min={1920}
        max={new Date().getFullYear() - 18}
      />
      <p className="text-sm text-muted-foreground">
        Für Altersberechnung und Lebensabschnitts-Zuordnung
      </p>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string
  value: string
  subtitle?: string
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryStatistics({
  gesamt,
  durchschnitt,
  hoechste,
  niedrigste,
}: {
  gesamt: number
  durchschnitt: number
  hoechste: JahresAusgaben | null
  niedrigste: JahresAusgaben | null
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Gesamtausgaben" value={formatCurrency(gesamt)} />
      <StatCard label="Ø pro Jahr" value={formatCurrency(durchschnitt)} />
      <StatCard
        label="Höchstes Jahr"
        value={hoechste ? formatCurrency(hoechste.gesamt) : '-'}
        subtitle={hoechste ? `${hoechste.jahr} (Alter ${hoechste.alter})` : ''}
      />
      <StatCard
        label="Niedrigstes Jahr"
        value={niedrigste ? formatCurrency(niedrigste.gesamt) : '-'}
        subtitle={niedrigste ? `${niedrigste.jahr} (Alter ${niedrigste.alter})` : ''}
      />
    </div>
  )
}

function AusgabenTable({ ausgaben }: { ausgaben: JahresAusgaben[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Jahr-für-Jahr Aufschlüsselung</CardTitle>
        <CardDescription>
          Detaillierte Ausgabenentwicklung über den Ruhestandszeitraum
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jahr</TableHead>
                <TableHead>Alter</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead className="text-right">Gesamt (€/Jahr)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ausgaben.map((jahr) => (
                <TableRow key={jahr.jahr}>
                  <TableCell>{jahr.jahr}</TableCell>
                  <TableCell>{jahr.alter}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        jahr.lebensabschnitt === 'aktiv'
                          ? 'default'
                          : jahr.lebensabschnitt === 'eingeschraenkt'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {LEBENSABSCHNITT_NAMEN[jahr.lebensabschnitt]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(jahr.gesamt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function AusgabenPreview({
  ausgaben,
  showPreview,
  onToggle,
}: {
  ausgaben: JahresAusgaben[]
  showPreview: boolean
  onToggle: () => void
}) {
  if (ausgaben.length === 0) return null

  const gesamt = berechneGesamtausgaben(ausgaben)
  const durchschnitt = berechneDurchschnittlicheAusgaben(ausgaben)
  const hoechste = findeHoechsteAusgaben(ausgaben)
  const niedrigste = findeNiedrigsteAusgaben(ausgaben)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Ausgabenvorschau</h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {showPreview && (
        <>
          <SummaryStatistics
            gesamt={gesamt}
            durchschnitt={durchschnitt}
            hoechste={hoechste}
            niedrigste={niedrigste}
          />
          <AusgabenTable ausgaben={ausgaben} />
        </>
      )}
    </div>
  )
}

function ErrorSection({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null
  return (
    <>
      <Separator />
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </>
  )
}

function ConfigurationContent({
  config,
  onChange,
  errors,
  ausgaben,
  showPreview,
  setShowPreview,
}: {
  config: AusgabenTrackerConfig
  onChange: (config: AusgabenTrackerConfig) => void
  errors: string[]
  ausgaben: JahresAusgaben[]
  showPreview: boolean
  setShowPreview: (show: boolean) => void
}) {
  return (
    <>
      <GeburtjahrSection config={config} onChange={onChange} />
      <Separator />
      <KategorieConfigSection config={config} onChange={onChange} />
      <Separator />
      <LebensabschnitteInfo />
      <ErrorSection errors={errors} />
      {errors.length === 0 && (
        <>
          <Separator />
          <AusgabenPreview
            ausgaben={ausgaben}
            showPreview={showPreview}
            onToggle={() => setShowPreview(!showPreview)}
          />
        </>
      )}
    </>
  )
}

export function AusgabenTrackerConfiguration({
  config,
  onChange,
  retirementStartYear,
  retirementEndYear,
}: AusgabenTrackerConfigurationProps) {
  const [showPreview, setShowPreview] = useState(false)
  const enabledId = useMemo(() => generateFormId('ausgaben-tracker', 'enabled'), [])

  // Validate configuration
  const errors = useMemo(() => validateAusgabenTrackerConfig(config), [config])

  // Calculate preview if no errors
  const ausgaben = useMemo(() => {
    if (errors.length > 0) return []
    return berechneAusgabenZeitraum(retirementStartYear, retirementEndYear, config)
  }, [config, retirementStartYear, retirementEndYear, errors])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>Ausgaben-Tracker für Ruhestandsplanung</CardTitle>
            <CardDescription>
              Detaillierte Ausgabenplanung mit kategorisierten Ausgaben und
              lebensabschnitts-basierten Anpassungen
            </CardDescription>
          </div>
          <Switch
            id={enabledId}
            checked={true}
            onCheckedChange={() => {
              // In future: implement enable/disable logic
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ConfigurationContent
          config={config}
          onChange={onChange}
          errors={errors}
          ausgaben={ausgaben}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
        />
      </CardContent>
    </Card>
  )
}

