import type { PensionComparisonResult } from '../../../helpers/pension-comparison'
import { formatCurrency } from '../../utils/currency'

interface PensionComparisonResultsProps {
  results: PensionComparisonResult
}

export function PensionComparisonResults({ results }: PensionComparisonResultsProps) {
  const enabledComparisons = results.comparisons.filter((c) => c.enabled)

  if (enabledComparisons.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Aktivieren Sie mindestens eine Rentenversicherung, um den Vergleich zu sehen.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
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
            {enabledComparisons.map((comparison) => (
              <tr key={comparison.type} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2">
                  <div className="font-medium">{comparison.displayName}</div>
                  <div className="text-xs text-muted-foreground">
                    {comparison.type === 'riester' && 'Staatlich gefördert'}
                    {comparison.type === 'ruerup' && 'Basis-Rente für Selbstständige'}
                    {comparison.type === 'betriebsrente' && 'Arbeitgeberfinanziert'}
                    {comparison.type === 'statutory' && 'Gesetzliche Rentenversicherung'}
                  </div>
                </td>
                <td className="text-right py-2 px-2">
                  <div>{formatCurrency(comparison.annualContribution)}</div>
                  {comparison.annualEmployerContribution > 0 && (
                    <div className="text-xs text-green-600">
                      + {formatCurrency(comparison.annualEmployerContribution)} AG
                    </div>
                  )}
                </td>
                <td className="text-right py-2 px-2 text-green-600">
                  {formatCurrency(comparison.annualTaxBenefit)}
                </td>
                <td className="text-right py-2 px-2">
                  <div>{formatCurrency(comparison.monthlyPensionNet)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(comparison.annualPensionNet)}/Jahr
                  </div>
                </td>
                <td className="text-right py-2 px-2">
                  <span
                    className={
                      comparison.roi > 0
                        ? 'text-green-600 font-semibold'
                        : comparison.roi < 0
                          ? 'text-red-600'
                          : ''
                    }
                  >
                    {comparison.roi > 0 ? '+' : ''}
                    {(comparison.roi * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="text-right py-2 px-2">
                  <span
                    className={
                      comparison.netLifetimeBenefit > 0
                        ? 'text-green-600 font-semibold'
                        : comparison.netLifetimeBenefit < 0
                          ? 'text-red-600'
                          : ''
                    }
                  >
                    {formatCurrency(comparison.netLifetimeBenefit)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          {enabledComparisons.length > 1 && (
            <tfoot className="border-t-2 bg-gray-50">
              <tr className="font-semibold">
                <td className="py-2 px-2">Gesamt</td>
                <td className="text-right py-2 px-2">
                  {formatCurrency(results.summary.totalAnnualContributions)}
                </td>
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
                  <span
                    className={
                      results.summary.combinedROI > 0
                        ? 'text-green-600'
                        : results.summary.combinedROI < 0
                          ? 'text-red-600'
                          : ''
                    }
                  >
                    {results.summary.combinedROI > 0 ? '+' : ''}
                    {(results.summary.combinedROI * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="text-right py-2 px-2">
                  <span
                    className={
                      results.summary.combinedNetLifetimeBenefit > 0
                        ? 'text-green-600'
                        : results.summary.combinedNetLifetimeBenefit < 0
                          ? 'text-red-600'
                          : ''
                    }
                  >
                    {formatCurrency(results.summary.combinedNetLifetimeBenefit)}
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Best Options Highlight */}
      {results.bestROI && results.bestNetBenefit && enabledComparisons.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-green-900 mb-1">🏆 Beste Rendite (ROI)</div>
            <div className="text-lg font-bold text-green-700">{results.bestROI.displayName}</div>
            <div className="text-sm text-green-600 mt-1">
              ROI: +{(results.bestROI.roi * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-900 mb-1">💰 Höchster Lebenszeitgewinn</div>
            <div className="text-lg font-bold text-blue-700">{results.bestNetBenefit.displayName}</div>
            <div className="text-sm text-blue-600 mt-1">
              {formatCurrency(results.bestNetBenefit.netLifetimeBenefit)}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Detaillierte Aufschlüsselung</h3>
        {enabledComparisons.map((comparison) => (
          <div key={comparison.type} className="bg-gray-50 rounded-lg p-4">
            <div className="font-medium mb-3">{comparison.displayName}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Gesamte Beiträge</div>
                <div className="font-semibold">{formatCurrency(comparison.totalContributions)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Gesamte Steuervorteile</div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(comparison.totalTaxBenefits)}
                </div>
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
                <div
                  className={`font-semibold ${
                    comparison.netLifetimeBenefit > 0
                      ? 'text-green-600'
                      : comparison.netLifetimeBenefit < 0
                        ? 'text-red-600'
                        : ''
                  }`}
                >
                  {formatCurrency(comparison.netLifetimeBenefit)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
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
            <strong>Lebenszeitgewinn:</strong> Gesamte Nettorente - Beiträge + Steuervorteile (Ihr Nettogewinn über
            die gesamte Lebenszeit)
          </li>
        </ul>
      </div>
    </div>
  )
}
