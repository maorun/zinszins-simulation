import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Calculator, TrendingDown, AlertCircle, Info } from 'lucide-react'
import { formatCurrency } from '../utils/currency'
import { generateFormId } from '../utils/unique-id'
import {
  compareKirchensteuerImpact,
  simulateSperrvermerk,
  calculateEffectiveTaxRate,
  type KirchensteuerConfig,
} from '../../helpers/kirchensteuer-optimization'
import { Alert, AlertDescription } from './ui/alert'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

interface KirchensteuerOptimizationCardProps {
  kirchensteuerAktiv: boolean
  kirchensteuersatz: number
  kapitalertragsteuer: number
  teilfreistellungsquote: number
}

function TaxScenarioCard({
  title,
  total,
  netEarnings,
  effectiveRate,
  colorClass,
  textColorClass,
}: {
  title: string
  total: number
  netEarnings: number
  effectiveRate: number
  colorClass: string
  textColorClass: string
}) {
  return (
    <div className={`p-4 border rounded-lg ${colorClass}`}>
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gesamtsteuer:</span>
          <span className={`font-medium ${textColorClass}`}>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nettoertrag:</span>
          <span className="font-medium">{formatCurrency(netEarnings)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Effektiver Steuersatz:</span>
          <span className="font-medium">{effectiveRate.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  )
}

function ComparisonSummary({
  comparison,
  years,
}: {
  comparison: ReturnType<typeof compareKirchensteuerImpact>
  years: number
}) {
  return (
    <Alert>
      <TrendingDown className="h-4 w-4" />
      <AlertDescription>
        <strong>Mehrbelastung durch Kirchensteuer:</strong> {formatCurrency(comparison.mehrbelastung)} über {years} Jahre
        <br />
        <span className="text-sm text-muted-foreground">
          Das entspricht {comparison.mehrbelastungProzent.toFixed(2)}% Ihrer gesamten Kapitalerträge
        </span>
      </AlertDescription>
    </Alert>
  )
}

function ComparisonCards({
  comparison,
  effectiveRateWith,
  effectiveRateWithout,
}: {
  comparison: ReturnType<typeof compareKirchensteuerImpact>
  effectiveRateWith: number
  effectiveRateWithout: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TaxScenarioCard
        title="⛪ Mit Kirchensteuer"
        total={comparison.mitKirchensteuer.gesamtsteuer}
        netEarnings={comparison.mitKirchensteuer.nettoertrag}
        effectiveRate={effectiveRateWith}
        colorClass="bg-red-50"
        textColorClass="text-red-700"
      />
      <TaxScenarioCard
        title="💰 Ohne Kirchensteuer"
        total={comparison.ohneKirchensteuer.gesamtsteuer}
        netEarnings={comparison.ohneKirchensteuer.nettoertrag}
        effectiveRate={effectiveRateWithout}
        colorClass="bg-green-50"
        textColorClass="text-green-700"
      />
    </div>
  )
}

function ComparisonResultsDisplay({
  config,
  averageYearlyGains,
  years,
}: {
  config: KirchensteuerConfig
  averageYearlyGains: number
  years: number
}) {
  const yearlyGains = useMemo(
    () =>
      Array.from({ length: years }, (_, i) => ({
        jahr: new Date().getFullYear() + i,
        kapitalertrag: averageYearlyGains,
      })),
    [averageYearlyGains, years],
  )

  const comparison = useMemo(() => compareKirchensteuerImpact(yearlyGains, config), [yearlyGains, config])
  const effectiveRateWith = useMemo(() => calculateEffectiveTaxRate({ ...config, kirchensteuerAktiv: true }), [config])
  const effectiveRateWithout = useMemo(() => calculateEffectiveTaxRate({ ...config, kirchensteuerAktiv: false }), [config])

  return (
    <div className="space-y-4">
      <ComparisonCards comparison={comparison} effectiveRateWith={effectiveRateWith} effectiveRateWithout={effectiveRateWithout} />
      <ComparisonSummary comparison={comparison} years={years} />
    </div>
  )
}

function SperrvermarkSimulationDisplay({ config, totalGains }: { config: KirchensteuerConfig; totalGains: number }) {
  const simulation = useMemo(() => simulateSperrvermerk(totalGains, config), [totalGains, config])

  if (!config.kirchensteuerAktiv) {
    return null
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">🔒 Sperrvermerk-Simulation</h4>

      <Table>
        <TableCaption>Vergleich: Automatische Abführung vs. Sperrvermerk</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Szenario</TableHead>
            <TableHead className="text-right">Gesamtsteuer</TableHead>
            <TableHead className="text-right">Nettoertrag</TableHead>
            <TableHead className="text-right">Manuelle Zahlung</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Automatische Abführung</TableCell>
            <TableCell className="text-right">{formatCurrency(simulation.automatischeAbfuehrung.gesamtsteuer)}</TableCell>
            <TableCell className="text-right">{formatCurrency(simulation.automatischeAbfuehrung.nettoertrag)}</TableCell>
            <TableCell className="text-right text-muted-foreground">—</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Mit Sperrvermerk</TableCell>
            <TableCell className="text-right">{formatCurrency(simulation.mitSperrvermerk.gesamtsteuer)}</TableCell>
            <TableCell className="text-right">{formatCurrency(simulation.mitSperrvermerk.nettoertrag)}</TableCell>
            <TableCell className="text-right text-orange-600 font-medium">
              {formatCurrency(simulation.mitSperrvermerk.manuelleZahlung)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">{simulation.hinweis}</AlertDescription>
      </Alert>
    </div>
  )
}

function YearlyGainsInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Durchschnittliche jährliche Kapitalerträge (€)</Label>
      <Input
        id={id}
        type="number"
        min="0"
        step="500"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="z.B. 5000"
      />
      <p className="text-xs text-muted-foreground">Ihre erwarteten durchschnittlichen Kapitalerträge pro Jahr</p>
    </div>
  )
}

function YearsInput({ id, value, onChange }: { id: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Planungszeitraum (Jahre)</Label>
      <Input
        id={id}
        type="number"
        min="1"
        max="50"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="z.B. 20"
      />
      <p className="text-xs text-muted-foreground">Zeitraum für die Langfristplanung (1-50 Jahre)</p>
    </div>
  )
}

function InputSection({
  averageYearlyGainsId,
  yearsId,
  averageYearlyGains,
  years,
  onAverageYearlyGainsChange,
  onYearsChange,
  onCalculate,
}: {
  averageYearlyGainsId: string
  yearsId: string
  averageYearlyGains: number
  years: number
  onAverageYearlyGainsChange: (value: number) => void
  onYearsChange: (value: number) => void
  onCalculate: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <YearlyGainsInput id={averageYearlyGainsId} value={averageYearlyGains} onChange={onAverageYearlyGainsChange} />
        <YearsInput id={yearsId} value={years} onChange={onYearsChange} />
      </div>
      <Button onClick={onCalculate} className="w-full">
        <Calculator className="mr-2 h-4 w-4" />
        Kirchensteuer-Auswirkung berechnen
      </Button>
    </div>
  )
}

function InformationSection({ teilfreistellungsquote }: { teilfreistellungsquote: number }) {
  return (
    <div className="p-4 bg-blue-50 rounded-lg text-sm space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Info className="h-4 w-4" />
        Wichtige Hinweise zur Kirchensteuer
      </h4>
      <ul className="space-y-1 ml-5 list-disc text-muted-foreground">
        <li>
          <strong>Bundeslandabhängig:</strong> 8% (Bayern, Baden-Württemberg) oder 9% (andere Bundesländer)
        </li>
        <li>
          <strong>Berechnungsbasis:</strong> Kirchensteuer wird auf die Abgeltungsteuer (25%) berechnet, nicht auf den
          vollen Kapitalertrag
        </li>
        <li>
          <strong>Teilfreistellung:</strong> Bei Aktienfonds wird die Teilfreistellung (derzeit {teilfreistellungsquote}
          %) vor der Steuerberechnung abgezogen
        </li>
        <li>
          <strong>Sperrvermerk:</strong> Verhindert automatische Abführung, ändert aber nicht die Steuerschuld
        </li>
        <li>
          <strong>Austritt:</strong> Ein Kirchenaustritt beendet die Kirchensteuerpflicht ab dem Folgemonat
        </li>
      </ul>
    </div>
  )
}

function DisabledStateCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Kirchensteuer-Optimierung
        </CardTitle>
        <CardDescription>Langfristige Finanzplanung unter Berücksichtigung der Kirchensteuer</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kirchensteuer ist derzeit deaktiviert. Aktivieren Sie die Kirchensteuer in der Steuerkonfiguration, um die
            Optimierungsfunktionen nutzen zu können.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function ResultsSection({
  config,
  averageYearlyGains,
  years,
}: {
  config: KirchensteuerConfig
  averageYearlyGains: number
  years: number
}) {
  return (
    <div className="space-y-6 pt-4 border-t">
      <ComparisonResultsDisplay config={config} averageYearlyGains={averageYearlyGains} years={years} />
      <div className="pt-4 border-t">
        <SperrvermarkSimulationDisplay config={config} totalGains={averageYearlyGains} />
      </div>
    </div>
  )
}

export function KirchensteuerOptimizationCard({
  kirchensteuerAktiv,
  kirchensteuersatz,
  kapitalertragsteuer,
  teilfreistellungsquote,
}: KirchensteuerOptimizationCardProps) {
  const [averageYearlyGains, setAverageYearlyGains] = useState(5000)
  const [years, setYears] = useState(20)
  const [showCalculation, setShowCalculation] = useState(false)

  const config: KirchensteuerConfig = useMemo(
    () => ({ kirchensteuerAktiv, kirchensteuersatz, kapitalertragsteuer, teilfreistellungsquote }),
    [kirchensteuerAktiv, kirchensteuersatz, kapitalertragsteuer, teilfreistellungsquote],
  )

  const averageYearlyGainsId = useMemo(() => generateFormId('kirchensteuer-opt', 'average-yearly-gains'), [])
  const yearsId = useMemo(() => generateFormId('kirchensteuer-opt', 'years'), [])

  if (!kirchensteuerAktiv) {
    return <DisabledStateCard />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Kirchensteuer-Optimierung
        </CardTitle>
        <CardDescription>
          Vergleichen Sie die langfristige Auswirkung der Kirchensteuer auf Ihre Kapitalerträge und erkunden Sie
          Optimierungsstrategien
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <InputSection
          averageYearlyGainsId={averageYearlyGainsId}
          yearsId={yearsId}
          averageYearlyGains={averageYearlyGains}
          years={years}
          onAverageYearlyGainsChange={setAverageYearlyGains}
          onYearsChange={setYears}
          onCalculate={() => setShowCalculation(true)}
        />
        {showCalculation && averageYearlyGains > 0 && years > 0 && (
          <ResultsSection config={config} averageYearlyGains={averageYearlyGains} years={years} />
        )}
        <InformationSection teilfreistellungsquote={teilfreistellungsquote} />
      </CardContent>
    </Card>
  )
}
