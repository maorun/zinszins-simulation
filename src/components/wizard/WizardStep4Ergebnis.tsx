import { useMemo } from 'react'
import { Button } from '../ui/button'
import { useSimulation } from '../../contexts/useSimulation'
import { getEnhancedOverviewSummary } from '../../utils/enhanced-summary'
import { formatCurrency } from '../../utils/currency'
import type { EnhancedSummary } from '../../utils/summary-utils'

interface WizardStep4ErgebnisProps {
  onSwitchToAdvanced: () => void
}

const STRATEGY_LABEL_MAP: Record<string, string> = {
  '4prozent': '4 %-Regel',
  '3prozent': '3 %-Regel',
  monatlich_fest: 'Monatlicher Festbetrag',
  kapitalerhalt: 'Kapitalerhalt',
  variabel_prozent: 'Variable Prozent',
  dynamisch: 'Dynamische Entnahme',
  bucket_strategie: 'Bucket-Strategie',
  rmd: 'RMD-Strategie',
  steueroptimiert: 'Steueroptimierte Entnahme',
  kapitalverzehr: 'Kapitalverzehr',
}

function MetricCard({
  label,
  value,
  subtext,
  colorClass = 'text-foreground',
}: {
  label: string
  value: string
  subtext: string
  colorClass?: string
}) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  )
}

function ErgebnisMetrics({
  summary,
  endOfLife,
  strategyLabel,
  startYear,
}: {
  summary: EnhancedSummary
  endOfLife: number
  strategyLabel: string
  startYear: number
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          label="Endkapital Sparphase"
          value={formatCurrency(summary.endkapital)}
          subtext={`zum Ende ${startYear}`}
          colorClass="text-green-600"
        />
        {summary.monatlicheAuszahlung !== undefined && summary.monatlicheAuszahlung > 0 && (
          <MetricCard
            label="Monatliche Entnahme"
            value={formatCurrency(summary.monatlicheAuszahlung)}
            subtext="im 1. Entnahmejahr"
            colorClass="text-blue-600"
          />
        )}
        {summary.endkapitalEntspharphase !== undefined && (
          <MetricCard
            label={`Restkapital ${endOfLife}`}
            value={formatCurrency(summary.endkapitalEntspharphase)}
            subtext="nach der Entnahmephase"
            colorClass={summary.endkapitalEntspharphase >= 0 ? 'text-green-600' : 'text-red-600'}
          />
        )}
        <MetricCard label="Gewählte Strategie" value={strategyLabel} subtext="Entnahme-Strategie" colorClass="text-foreground text-lg" />
      </div>
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
        🎉 <strong>Gut gemacht!</strong> Deine Basis-Simulation ist fertig. Für detailliertere Einstellungen
        wie Steuer-Konfiguration, Inflationsbereinigung und mehr kannst du zur vollständigen Ansicht wechseln.
      </div>
    </div>
  )
}

function getStrategyLabel(strategie: string | undefined): string {
  if (!strategie) return '4 %-Regel'
  return STRATEGY_LABEL_MAP[strategie] ?? strategie
}

function ErgebnisEmpty() {
  return (
    <div className="rounded-lg bg-muted p-8 text-center text-muted-foreground space-y-2">
      <p className="text-lg">⏳ Simulation läuft…</p>
      <p className="text-sm">Die Ergebnisse werden berechnet.</p>
    </div>
  )
}

export function WizardStep4Ergebnis({ onSwitchToAdvanced }: WizardStep4ErgebnisProps) {
  const { simulationData, withdrawalResults, withdrawalConfig, startEnd, endOfLife, rendite, steuerlast, teilfreistellungsquote } = useSimulation()

  const summary = useMemo(
    () => getEnhancedOverviewSummary(simulationData, startEnd, withdrawalResults, rendite, steuerlast, teilfreistellungsquote, withdrawalConfig, endOfLife),
    [simulationData, startEnd, withdrawalResults, rendite, steuerlast, teilfreistellungsquote, withdrawalConfig, endOfLife],
  )

  const strategyLabel = getStrategyLabel(withdrawalConfig?.formValue?.strategie)
  const hasResults = summary !== null && summary.endkapital > 0

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">📊 Deine Simulation</h2>
        <p className="text-sm text-muted-foreground">Hier siehst du die wichtigsten Kennzahlen auf einen Blick.</p>
      </div>
      {hasResults ? (
        <ErgebnisMetrics summary={summary!} endOfLife={endOfLife} strategyLabel={strategyLabel} startYear={startEnd[0]} />
      ) : (
        <ErgebnisEmpty />
      )}
      <div className="text-center space-y-3">
        <Button onClick={onSwitchToAdvanced} size="lg" className="w-full sm:w-auto">
          🔧 Vollständige Ansicht öffnen
        </Button>
        <p className="text-xs text-muted-foreground">
          Greife auf alle Einstellungen zu: Steuer, Inflation, Monte-Carlo, Szenario-Vergleich und mehr.
        </p>
      </div>
    </div>
  )
}
