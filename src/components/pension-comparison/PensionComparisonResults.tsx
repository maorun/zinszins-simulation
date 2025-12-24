import type { PensionComparisonResult, PensionTypeComparison } from '../../../helpers/pension-comparison'
import { formatCurrency } from '../../utils/currency'

interface PensionComparisonResultsProps {
  results: PensionComparisonResult
}

function getPensionTypeDescription(type: PensionTypeComparison['type']): string {
  const descriptions = {
    riester: 'Staatlich gefördert',
    ruerup: 'Basis-Rente für Selbstständige',
    betriebsrente: 'Arbeitgeberfinanziert',
    statutory: 'Gesetzliche Rentenversicherung',
  }
  return descriptions[type]
}

function getValueColorClass(value: number): string {
  if (value > 0) return 'text-green-600 font-semibold'
  if (value < 0) return 'text-red-600'
  return ''
}

function ComparisonTableRow({ comparison }: { comparison: PensionTypeComparison }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-2 px-2">
        <div className="font-medium">{comparison.displayName}</div>
        <div className="text-xs text-muted-foreground">{getPensionTypeDescription(comparison.type)}</div>
      </td>
      <td className="text-right py-2 px-2">
        <div>{formatCurrency(comparison.annualContribution)}</div>
        {comparison.annualEmployerContribution > 0 && (
          <div className="text-xs text-green-600">+ {formatCurrency(comparison.annualEmployerContribution)} AG</div>
        )}
      </td>
      <td className="text-right py-2 px-2 text-green-600">{formatCurrency(comparison.annualTaxBenefit)}</td>
      <td className="text-right py-2 px-2">
        <div>{formatCurrency(comparison.monthlyPensionNet)}</div>
        <div className="text-xs text-muted-foreground">{formatCurrency(comparison.annualPensionNet)}/Jahr</div>
      </td>
      <td className="text-right py-2 px-2">
        <span className={getValueColorClass(comparison.roi)}>
          {comparison.roi > 0 ? '+' : ''}
          {(comparison.roi * 100).toFixed(1)}%
        </span>
      </td>
      <td className="text-right py-2 px-2">
        <span className={getValueColorClass(comparison.netLifetimeBenefit)}>
          {formatCurrency(comparison.netLifetimeBenefit)}
        </span>
      </td>
    </tr>
  )
}

function ComparisonTable({ results }: { results: PensionComparisonResult }) {
  const enabledComparisons = results.comparisons.filter(c => c.enabled)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2 font-semibold">Rentenart</th>
            <th className="text-right py-2 px-2 font-semibold">Jährl. Beitrag</th>
            <th className="text-right py-2 px-2 font-semibold">Steuer­vorteil</th>
            <th className="text-right py-2 px-2 font-semibold">Netto­rente/Mon.</th>
            <th className="text-right py-2 px-2 font-semibold">ROI</th>
            <th className="text-right py-2 px-2 font-semibold">Lebenszeit­gewinn</th>
          </tr>
        </thead>
        <tbody>
          {enabledComparisons.map(comparison => (
            <ComparisonTableRow key={comparison.type} comparison={comparison} />
          ))}
        </tbody>
        {enabledComparisons.length > 1 && <ComparisonTableFooter results={results} />}
      </table>
    </div>
  )
}

function ComparisonTableFooter({ results }: { results: PensionComparisonResult }) {
  return (
    <tfoot className="border-t-2 bg-gray-50">
      <tr className="font-semibold">
        <td className="py-2 px-2">Gesamt</td>
        <td className="text-right py-2 px-2">{formatCurrency(results.summary.totalAnnualContributions)}</td>
        <td className="text-right py-2 px-2 text-green-600">
          {formatCurrency(results.summary.totalAnnualTaxBenefits)}
        </td>
        <td className="text-right py-2 px-2">
          <div>{formatCurrency(results.summary.totalMonthlyPensionNet)}</div>
          <div className="text-xs text-muted-foreground font-normal">
            {formatCurrency(results.summary.totalAnnualPensionNet)}/Jahr
          </div>
        </td>
        <td className="text-right py-2 px-2">
          <span className={getValueColorClass(results.summary.combinedROI)}>
            {results.summary.combinedROI > 0 ? '+' : ''}
            {(results.summary.combinedROI * 100).toFixed(1)}%
          </span>
        </td>
        <td className="text-right py-2 px-2">
          <span className={getValueColorClass(results.summary.combinedNetLifetimeBenefit)}>
            {formatCurrency(results.summary.combinedNetLifetimeBenefit)}
          </span>
        </td>
      </tr>
    </tfoot>
  )
}

function BestOptionsHighlight({ results }: { results: PensionComparisonResult }) {
  const enabledComparisons = results.comparisons.filter(c => c.enabled)

  if (!results.bestROI || !results.bestNetBenefit || enabledComparisons.length <= 1) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-green-900 mb-1">🏆 Beste Rendite (ROI)</div>
        <div className="text-lg font-bold text-green-700">{results.bestROI.displayName}</div>
        <div className="text-sm text-green-600 mt-1">ROI: +{(results.bestROI.roi * 100).toFixed(1)}%</div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-blue-900 mb-1">💰 Höchster Lebenszeitgewinn</div>
        <div className="text-lg font-bold text-blue-700">{results.bestNetBenefit.displayName}</div>
        <div className="text-sm text-blue-600 mt-1">{formatCurrency(results.bestNetBenefit.netLifetimeBenefit)}</div>
      </div>
    </div>
  )
}

function DetailedBreakdown({ comparison }: { comparison: PensionTypeComparison }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="font-medium mb-3">{comparison.displayName}</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Gesamte Beiträge</div>
          <div className="font-semibold">{formatCurrency(comparison.totalContributions)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Gesamte Steuervorteile</div>
          <div className="font-semibold text-green-600">{formatCurrency(comparison.totalTaxBenefits)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Gesamte Nettorente</div>
          <div className="font-semibold">{formatCurrency(comparison.totalNetPension)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Bruttorente/Monat</div>
          <div className="font-semibold">{formatCurrency(comparison.monthlyPensionGross)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Nettorente/Monat</div>
          <div className="font-semibold">{formatCurrency(comparison.monthlyPensionNet)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Lebenszeitgewinn</div>
          <div className={`font-semibold ${getValueColorClass(comparison.netLifetimeBenefit)}`}>
            {formatCurrency(comparison.netLifetimeBenefit)}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricsExplanation() {
  return (
    <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">📊 Erklärung der Metriken</p>
      <ul className="list-disc list-inside space-y-1 text-blue-800">
        <li>
          <strong>Jährlicher Beitrag:</strong> Ihre eigenen Einzahlungen pro Jahr (ohne Arbeitgeberzuschuss)
        </li>
        <li>
          <strong>Steuervorteil:</strong> Jährliche Steuerersparnis durch Zulagen oder Sonderausgabenabzug
        </li>
        <li>
          <strong>Nettorente:</strong> Monatliche Rente nach Abzug von Steuern und Sozialversicherung
        </li>
        <li>
          <strong>ROI:</strong> Rendite Ihrer Investition (Gesamtrente + Steuervorteile) / Gesamtbeiträge - 1
        </li>
        <li>
          <strong>Lebenszeitgewinn:</strong> Gesamte Nettorente - Beiträge + Steuervorteile (Ihr Nettogewinn über die
          gesamte Lebenszeit)
        </li>
      </ul>
    </div>
  )
}

export function PensionComparisonResults({ results }: PensionComparisonResultsProps) {
  const enabledComparisons = results.comparisons.filter(c => c.enabled)

  if (enabledComparisons.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Aktivieren Sie mindestens eine Rentenversicherung, um den Vergleich zu sehen.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ComparisonTable results={results} />
      <BestOptionsHighlight results={results} />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Detaillierte Aufschlüsselung</h3>
        {enabledComparisons.map(comparison => (
          <DetailedBreakdown key={comparison.type} comparison={comparison} />
        ))}
      </div>
      <MetricsExplanation />
    </div>
  )
}
