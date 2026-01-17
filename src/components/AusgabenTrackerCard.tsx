/**
 * AusgabenTrackerCard - UI component for detailed retirement expense planning
 *
 * Allows users to configure categorized expenses with individual inflation rates
 * and life-phase adjustments for realistic retirement planning.
 */

import { useState, useMemo, type Dispatch, type SetStateAction } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Info, TrendingUp, AlertCircle } from 'lucide-react'
import {
  createDefaultAusgabenTrackerConfig,
  berechneAusgabenZeitraum,
  validateAusgabenTrackerConfig,
  berechneGesamtausgaben,
  berechneDurchschnittlicheAusgaben,
  findeHoechsteAusgaben,
  findeNiedrigsteAusgaben,
  KATEGORIE_NAMEN,
  LEBENSABSCHNITT_NAMEN,
  LEBENSABSCHNITT_BESCHREIBUNGEN,
  type AusgabenTrackerConfig,
  type AusgabenKategorie,
  type JahresAusgaben,
} from '../../helpers/ausgaben-tracker'
import { generateFormId } from '../utils/unique-id'
import { formatCurrency } from '../utils/currency'

interface AusgabenTrackerCardProps {
  /** Start year of retirement phase */
  startjahr: number
  /** End year of retirement phase */
  endjahr: number
  /** Birth year for age calculation */
  geburtsjahr: number
  /** Callback when expenses configuration changes */
  onAusgabenChange?: (ausgaben: JahresAusgaben[]) => void
}

interface SummaryStatsProps {
  gesamt: number
  durchschnitt: number
  hoechste: JahresAusgaben | null
  niedrigste: JahresAusgaben | null
}

function SummaryStats({ gesamt, durchschnitt, hoechste, niedrigste }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Gesamtausgaben</p>
        <p className="text-2xl font-bold">{formatCurrency(gesamt)}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Durchschnitt/Jahr</p>
        <p className="text-2xl font-bold">{formatCurrency(durchschnitt)}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Höchste Ausgaben</p>
        <p className="text-xl font-semibold">
          {hoechste && formatCurrency(hoechste.gesamt)}
        </p>
        <p className="text-xs text-muted-foreground">{hoechste && `Jahr ${hoechste.jahr}`}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Niedrigste Ausgaben</p>
        <p className="text-xl font-semibold">
          {niedrigste && formatCurrency(niedrigste.gesamt)}
        </p>
        <p className="text-xs text-muted-foreground">
          {niedrigste && `Jahr ${niedrigste.jahr}`}
        </p>
      </div>
    </div>
  )
}

interface CategoryConfigTableProps {
  config: AusgabenTrackerConfig
  ids: Record<string, string>
  onUpdateKategorie: (
    kategorie: AusgabenKategorie,
    field: 'betrag' | 'inflationsrate' | 'aktiv',
    value: number | boolean,
  ) => void
}

interface CategoryRowProps {
  kategorie: AusgabenKategorie
  katConfig: { betrag: number; inflationsrate: number; aktiv: boolean }
  ids: Record<string, string>
  onUpdateKategorie: (
    kategorie: AusgabenKategorie,
    field: 'betrag' | 'inflationsrate' | 'aktiv',
    value: number | boolean,
  ) => void
}

function CategoryRow({ kategorie, katConfig, ids, onUpdateKategorie }: CategoryRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{KATEGORIE_NAMEN[kategorie]}</TableCell>
      <TableCell>
        <Input
          id={ids[`${kategorie}Betrag` as keyof typeof ids]}
          type="number"
          min="0"
          step="10"
          value={katConfig.betrag}
          onChange={(e) => onUpdateKategorie(kategorie, 'betrag', parseFloat(e.target.value) || 0)}
          className="w-24"
          disabled={!katConfig.aktiv}
        />
      </TableCell>
      <TableCell>
        <Input
          id={ids[`${kategorie}Inflation` as keyof typeof ids]}
          type="number"
          min="0"
          max="20"
          step="0.1"
          value={(katConfig.inflationsrate * 100).toFixed(1)}
          onChange={(e) =>
            onUpdateKategorie(kategorie, 'inflationsrate', parseFloat(e.target.value) / 100 || 0)
          }
          className="w-20"
          disabled={!katConfig.aktiv}
        />
      </TableCell>
      <TableCell className="text-center">
        <Switch
          id={ids[`${kategorie}Aktiv` as keyof typeof ids]}
          checked={katConfig.aktiv}
          onCheckedChange={(checked) => onUpdateKategorie(kategorie, 'aktiv', checked)}
        />
      </TableCell>
    </TableRow>
  )
}

function CategoryConfigTable({ config, ids, onUpdateKategorie }: CategoryConfigTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategorie</TableHead>
            <TableHead>Monatlich (€)</TableHead>
            <TableHead>Inflation (%)</TableHead>
            <TableHead className="text-center">Aktiv</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(Object.keys(config.kategorien) as AusgabenKategorie[]).map((kategorie) => (
            <CategoryRow
              key={kategorie}
              kategorie={kategorie}
              katConfig={config.kategorien[kategorie]}
              ids={ids}
              onUpdateKategorie={onUpdateKategorie}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface LifePhaseInfoProps {
  config: AusgabenTrackerConfig
}

function LifePhaseInfo({ config }: LifePhaseInfoProps) {
  return (
    <div className="space-y-2">
      {config.lebensabschnitte.map((abschnitt, index) => {
        const lebensabschnitt =
          index === 0 ? 'aktiv' : index === 1 ? 'eingeschraenkt' : 'pflegebedarf'
        return (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
            <Badge variant={index === 0 ? 'default' : index === 1 ? 'secondary' : 'outline'}>
              {abschnitt.alterVon}-{abschnitt.alterBis || '∞'}
            </Badge>
            <div className="flex-1 space-y-1">
              <p className="font-medium">{LEBENSABSCHNITT_NAMEN[lebensabschnitt]}</p>
              <p className="text-sm text-muted-foreground">
                {LEBENSABSCHNITT_BESCHREIBUNGEN[lebensabschnitt]}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface YearDetailsTableProps {
  ausgabenZeitraum: JahresAusgaben[]
}

function YearDetailsTable({ ausgabenZeitraum }: YearDetailsTableProps) {
  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jahr</TableHead>
            <TableHead>Alter</TableHead>
            <TableHead>Phase</TableHead>
            <TableHead className="text-right">Ausgaben/Jahr</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ausgabenZeitraum.map((jahr) => (
            <TableRow key={jahr.jahr}>
              <TableCell className="font-medium">{jahr.jahr}</TableCell>
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
              <TableCell className="text-right font-mono">{formatCurrency(jahr.gesamt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface AusgabenCardContentProps {
  validationErrors: string[]
  statistiken: SummaryStatsProps
  config: AusgabenTrackerConfig
  ids: Record<string, string>
  updateKategorie: (
    kategorie: AusgabenKategorie,
    field: 'betrag' | 'inflationsrate' | 'aktiv',
    value: number | boolean,
  ) => void
  showDetails: boolean
  setShowDetails: (show: boolean) => void
  ausgabenZeitraum: JahresAusgaben[]
}

interface YearOverviewSectionProps {
  showDetails: boolean
  setShowDetails: (show: boolean) => void
  ausgabenZeitraum: JahresAusgaben[]
}

function YearOverviewSection({
  showDetails,
  setShowDetails,
  ausgabenZeitraum,
}: YearOverviewSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Jahr-für-Jahr Übersicht</h3>
        <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Weniger anzeigen' : 'Details anzeigen'}
        </Button>
      </div>
      {showDetails && <YearDetailsTable ausgabenZeitraum={ausgabenZeitraum} />}
    </div>
  )
}

function AusgabenCardContent({
  validationErrors,
  statistiken,
  config,
  ids,
  updateKategorie,
  showDetails,
  setShowDetails,
  ausgabenZeitraum,
}: AusgabenCardContentProps) {
  return (
    <CardContent className="space-y-6">
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <SummaryStats {...statistiken} />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ausgabenkategorien</h3>
        <CategoryConfigTable config={config} ids={ids} onUpdateKategorie={updateKategorie} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Lebensabschnitte im Ruhestand</h3>
        <LifePhaseInfo config={config} />
      </div>

      <YearOverviewSection
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        ausgabenZeitraum={ausgabenZeitraum}
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Die Ausgaben werden automatisch an Ihre Lebensphase angepasst. Im aktiven Ruhestand sind
          die Reise- und Freizeitausgaben höher, während im Alter die Gesundheitskosten steigen.
          Jede Kategorie hat eine individuelle Inflationsrate, die auf historischen Daten basiert.
        </AlertDescription>
      </Alert>
    </CardContent>
  )
}

function useAusgabenTrackerData(
  startjahr: number,
  endjahr: number,
  config: AusgabenTrackerConfig,
  onAusgabenChange?: (ausgaben: JahresAusgaben[]) => void,
) {
  const ausgabenZeitraum = useMemo(
    () => berechneAusgabenZeitraum(startjahr, endjahr, config),
    [startjahr, endjahr, config],
  )

  const statistiken = useMemo(
    () => ({
      gesamt: berechneGesamtausgaben(ausgabenZeitraum),
      durchschnitt: berechneDurchschnittlicheAusgaben(ausgabenZeitraum),
      hoechste: findeHoechsteAusgaben(ausgabenZeitraum),
      niedrigste: findeNiedrigsteAusgaben(ausgabenZeitraum),
    }),
    [ausgabenZeitraum],
  )

  const validationErrors = useMemo(() => validateAusgabenTrackerConfig(config), [config])

  useMemo(() => {
    if (onAusgabenChange) {
      onAusgabenChange(ausgabenZeitraum)
    }
  }, [ausgabenZeitraum, onAusgabenChange])

  return { ausgabenZeitraum, statistiken, validationErrors }
}

function useFormIds() {
  return useMemo(
    () => ({
      fixkostenBetrag: generateFormId('ausgaben-tracker', 'fixkosten-betrag'),
      fixkostenInflation: generateFormId('ausgaben-tracker', 'fixkosten-inflation'),
      fixkostenAktiv: generateFormId('ausgaben-tracker', 'fixkosten-aktiv'),
      lebenshaltungBetrag: generateFormId('ausgaben-tracker', 'lebenshaltung-betrag'),
      lebenshaltungInflation: generateFormId('ausgaben-tracker', 'lebenshaltung-inflation'),
      lebenshaltungAktiv: generateFormId('ausgaben-tracker', 'lebenshaltung-aktiv'),
      gesundheitBetrag: generateFormId('ausgaben-tracker', 'gesundheit-betrag'),
      gesundheitInflation: generateFormId('ausgaben-tracker', 'gesundheit-inflation'),
      gesundheitAktiv: generateFormId('ausgaben-tracker', 'gesundheit-aktiv'),
      freizeitBetrag: generateFormId('ausgaben-tracker', 'freizeit-betrag'),
      freizeitInflation: generateFormId('ausgaben-tracker', 'freizeit-inflation'),
      freizeitAktiv: generateFormId('ausgaben-tracker', 'freizeit-aktiv'),
      reisenBetrag: generateFormId('ausgaben-tracker', 'reisen-betrag'),
      reisenInflation: generateFormId('ausgaben-tracker', 'reisen-inflation'),
      reisenAktiv: generateFormId('ausgaben-tracker', 'reisen-aktiv'),
      einmaligBetrag: generateFormId('ausgaben-tracker', 'einmalig-betrag'),
      einmaligInflation: generateFormId('ausgaben-tracker', 'einmalig-inflation'),
      einmaligAktiv: generateFormId('ausgaben-tracker', 'einmalig-aktiv'),
    }),
    [],
  )
}

function useKategorieUpdater(
  setConfig: Dispatch<SetStateAction<AusgabenTrackerConfig>>,
) {
  return (
    kategorie: AusgabenKategorie,
    field: 'betrag' | 'inflationsrate' | 'aktiv',
    value: number | boolean,
  ) => {
    setConfig((prev) => ({
      ...prev,
      kategorien: {
        ...prev.kategorien,
        [kategorie]: {
          ...prev.kategorien[kategorie],
          [field]: value,
        },
      },
    }))
  }
}

export function AusgabenTrackerCard({
  startjahr,
  endjahr,
  geburtsjahr,
  onAusgabenChange,
}: AusgabenTrackerCardProps) {
  const [config, setConfig] = useState<AusgabenTrackerConfig>(() =>
    createDefaultAusgabenTrackerConfig(geburtsjahr),
  )
  const [showDetails, setShowDetails] = useState(false)

  const ids = useFormIds()
  const { ausgabenZeitraum, statistiken, validationErrors } = useAusgabenTrackerData(
    startjahr,
    endjahr,
    config,
    onAusgabenChange,
  )

  const updateKategorie = useKategorieUpdater(setConfig)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ausgaben-Tracker für Ruhestandsplanung
        </CardTitle>
        <CardDescription>
          Detaillierte Planung Ihrer Ausgaben im Ruhestand mit kategoriespezifischen
          Inflationsraten und lebensabschnitts-basierten Anpassungen
        </CardDescription>
      </CardHeader>
      <AusgabenCardContent
        validationErrors={validationErrors}
        statistiken={statistiken}
        config={config}
        ids={ids}
        updateKategorie={updateKategorie}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        ausgabenZeitraum={ausgabenZeitraum}
      />
    </Card>
  )
}

