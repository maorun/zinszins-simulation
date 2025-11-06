import { formatRiskMetric, type RiskMetrics, type PortfolioData } from '../utils/risk-metrics'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'

interface DrawdownAnalysisProps {
  riskMetrics: RiskMetrics | null
  portfolioData: PortfolioData
  hasRiskData: boolean
}

interface DrawdownStatisticsProps {
  riskMetrics: RiskMetrics & { drawdownSeries: NonNullable<RiskMetrics['drawdownSeries']> }
}

function DrawdownStatistics({ riskMetrics }: DrawdownStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="text-sm font-medium text-gray-600">Maximum Drawdown</div>
        <div className="text-lg font-bold text-red-700">{formatRiskMetric(riskMetrics.maxDrawdown, 'percentage')}</div>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="text-sm font-medium text-gray-600">Durchschnittlicher Drawdown</div>
        <div className="text-lg font-bold text-orange-700">
          {formatRiskMetric(
            riskMetrics.drawdownSeries.reduce((sum, item) => sum + item.drawdown, 0) /
              riskMetrics.drawdownSeries.length,
            'percentage',
          )}
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="text-sm font-medium text-gray-600">Perioden im Drawdown</div>
        <div className="text-lg font-bold text-yellow-700">
          {riskMetrics.drawdownSeries.filter((item) => item.drawdown > 0).length} Jahre
        </div>
      </div>
    </div>
  )
}

interface DrawdownTableProps {
  riskMetrics: RiskMetrics & { drawdownSeries: NonNullable<RiskMetrics['drawdownSeries']> }
  portfolioData: PortfolioData
}

function DrawdownTable({ riskMetrics, portfolioData }: DrawdownTableProps) {
  const significantDrawdowns = riskMetrics.drawdownSeries.filter((item) => item.drawdown > 1)
  const displayItems = significantDrawdowns.slice(0, 10)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jahr</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Portfolio-Wert
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drawdown
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayItems.map((item, index) => (
              <tr key={index} className={item.drawdown > 10 ? 'bg-red-50' : 'bg-white'}>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {portfolioData.years[item.year] || `Jahr ${item.year + 1}`}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{formatRiskMetric(item.value, 'currency')}</td>
                <td className="px-4 py-2 text-sm font-medium">
                  <span className={`${item.drawdown > 10 ? 'text-red-600' : 'text-orange-600'}`}>
                    -{formatRiskMetric(item.drawdown, 'percentage')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {significantDrawdowns.length > 10 && (
        <p className="text-sm text-gray-500 mt-2">Zeigt die ersten 10 Jahre mit signifikanten Drawdowns (&gt; 1%).</p>
      )}
    </>
  )
}

export function DrawdownAnalysis({ riskMetrics, portfolioData, hasRiskData }: DrawdownAnalysisProps) {
  if (!riskMetrics?.drawdownSeries || !hasRiskData || riskMetrics.drawdownSeries.length <= 3) {
    return null
  }

  // At this point we know drawdownSeries exists
  const validRiskMetrics = riskMetrics as RiskMetrics & {
    drawdownSeries: NonNullable<RiskMetrics['drawdownSeries']>
  }

  const hasSignificantDrawdowns = validRiskMetrics.drawdownSeries.filter((item) => item.drawdown > 0.1).length > 0

  return (
    <CollapsibleCard className="border-l-4 border-l-orange-400">
      <CollapsibleCardHeader>📈 Drawdown-Analyse</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Drawdown-Analyse:</strong> Zeigt die historische Entwicklung von Verlusten ausgehend von Höchstständen
          des Portfolios. Ein Drawdown von 20% bedeutet, dass das Portfolio 20% unter seinem bisherigen Höchststand
          liegt.
        </p>

        {hasSignificantDrawdowns ? (
          <>
            <DrawdownStatistics riskMetrics={validRiskMetrics} />
            <DrawdownTable riskMetrics={validRiskMetrics} portfolioData={portfolioData} />
          </>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800 font-semibold mb-2">✅ Keine signifikanten Drawdowns</div>
            <div className="text-sm text-green-700">
              Im simulierten Zeitraum gab es keine nennenswerten Verluste vom Höchststand. Dies deutet auf eine stabile
              Aufwärtsentwicklung hin.
            </div>
          </div>
        )}
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
