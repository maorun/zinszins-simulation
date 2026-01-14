import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { type DynamicSpendingSummary } from '../../../helpers/dynamic-spending'

interface DynamicSpendingPreviewProps {
  summary: DynamicSpendingSummary | null
  showResults: boolean
  onToggle: () => void
}

function formatCurrency(value: number) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function PreviewMetrics({ summary }: { summary: DynamicSpendingSummary }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Durchschnittliche Jahresausgaben" value={formatCurrency(summary.averageAnnualSpending)} />
        <MetricCard label="Go-Go / Slow-Go / No-Go Jahre" value={`${summary.goGoYears} / ${summary.slowGoYears} / ${summary.noGoYears}`} />
        <MetricCard label="Gesamt-Ausgaben" value={formatCurrency(summary.totalSpending)} />
      </div>

      {summary.totalLargeExpenses > 0 && (
        <Alert><AlertDescription>Großausgaben: {formatCurrency(summary.totalLargeExpenses)}</AlertDescription></Alert>
      )}

      {summary.totalMedicalCosts > 0 && (
        <Alert><AlertDescription>Gesamt-Gesundheitskosten: {formatCurrency(summary.totalMedicalCosts)}</AlertDescription></Alert>
      )}
    </>
  )
}

export function DynamicSpendingPreview({ summary, showResults, onToggle }: DynamicSpendingPreviewProps) {
  return (
    <div className="space-y-4">
      <Button onClick={onToggle} variant="outline" className="w-full">
        {showResults ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
      </Button>
      {showResults && summary && (
        <div className="space-y-4">
          <PreviewMetrics summary={summary} />
        </div>
      )}
    </div>
  )
}
