import { useMemo } from 'react'
import { Button } from '../ui/button'
import { useSimulation } from '../../contexts/useSimulation'
import { getEnhancedOverviewSummary } from '../../utils/enhanced-summary'
import { formatCurrency } from '../../utils/currency'

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

export function WizardStep4Ergebnis({ onSwitchToAdvanced }: WizardStep4ErgebnisProps) {
  const { simulationData, withdrawalResults, withdrawalConfig, startEnd, endOfLife, rendite, steuerlast, teilfreistellungsquote } = useSimulation()

  const summary = useMemo(
    () =>
      getEnhancedOverviewSummary(
        simulationData,
        startEnd,
        withdrawalResults,
        rendite,
        steuerlast,
        teilfreistellungsquote,
        withdrawalConfig,
        endOfLife,
      ),
    [simulationData, startEnd, withdrawalResults, rendite, steuerlast, teilfreistellungsquote, withdrawalConfig, endOfLife],
  )

  const strategyLabel =
    STRATEGY_LABEL_MAP[withdrawalConfig?.formValue?.strategie ?? ''] ??
    withdrawalConfig?.formValue?.strategie ??
    '4 %-Regel'

  const hasResults = summary !== null && summary.endkapital > 0

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">📊 Deine Simulation</h2>
        <p className="text-sm text-muted-foreground">
          Hier siehst du die wichtigsten Kennzahlen auf einen Blick.
        </p>
      </div>

      {hasResults ? (
        <div className="space-y-4">
          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-4 text-center space-y-1">
              <p className="text-sm text-muted-foreground">Endkapital Sparphase</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary!.endkapital)}</p>
              <p className="text-xs text-muted-foreground">zum Ende {startEnd[0]}</p>
            </div>

            {summary!.monatlicheAuszahlung !== undefined && summary!.monatlicheAuszahlung > 0 && (
              <div className="rounded-lg border bg-card p-4 text-center space-y-1">
                <p className="text-sm text-muted-foreground">Monatliche Entnahme</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary!.monatlicheAuszahlung)}
                </p>
                <p className="text-xs text-muted-foreground">im 1. Entnahmejahr</p>
              </div>
            )}

            {summary!.endkapitalEntspharphase !== undefined && (
              <div className="rounded-lg border bg-card p-4 text-center space-y-1">
                <p className="text-sm text-muted-foreground">Restkapital {endOfLife}</p>
                <p className={`text-2xl font-bold ${summary!.endkapitalEntspharphase >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary!.endkapitalEntspharphase)}
                </p>
                <p className="text-xs text-muted-foreground">nach der Entnahmephase</p>
              </div>
            )}

            <div className="rounded-lg border bg-card p-4 text-center space-y-1">
              <p className="text-sm text-muted-foreground">Gewählte Strategie</p>
              <p className="text-lg font-bold">{strategyLabel}</p>
              <p className="text-xs text-muted-foreground">Entnahme-Strategie</p>
            </div>
          </div>

          {/* Progress to next step hint */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            🎉 <strong>Gut gemacht!</strong> Deine Basis-Simulation ist fertig. Für detailliertere
            Einstellungen wie Steuer-Konfiguration, Inflationsbereinigung, alternative Rendite-Modi und
            mehr kannst du zur vollständigen Ansicht wechseln.
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-muted p-8 text-center text-muted-foreground space-y-2">
          <p className="text-lg">⏳ Simulation läuft…</p>
          <p className="text-sm">Die Ergebnisse werden berechnet.</p>
        </div>
      )}

      {/* Switch to advanced view */}
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
