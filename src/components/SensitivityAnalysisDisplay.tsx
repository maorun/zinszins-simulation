import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import {
  runSensitivityAnalysis,
  getMostImpactfulParameters,
  SENSITIVITY_PARAMETERS,
  type SensitivityAnalysisConfig,
  type SensitivityResult,
} from '../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../utils/random-returns'
import { formatCurrency } from '../utils/currency'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface SensitivityAnalysisDisplayProps {
  config: SensitivityAnalysisConfig
  returnConfig: ReturnConfiguration
  title?: string
}

const SensitivityAnalysisDisplay: React.FC<SensitivityAnalysisDisplayProps> = ({
  config,
  returnConfig,
  title = '📊 Sensitivitätsanalyse',
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Run sensitivity analysis for all parameters
  const analysisResults = useMemo(() => {
    const results = new Map<string, SensitivityResult[]>()
    const baseResults = new Map<string, SensitivityResult>()

    for (const [paramName, parameter] of Object.entries(SENSITIVITY_PARAMETERS)) {
      const paramResults = runSensitivityAnalysis(parameter, config, returnConfig)

      if (paramResults.length > 0) {
        results.set(paramName, paramResults)

        // Find the base result (closest to parameter's base value)
        const baseResult = paramResults.reduce((prev, curr) =>
          Math.abs(curr.parameterValue - parameter.baseValue) < Math.abs(prev.parameterValue - parameter.baseValue)
            ? curr
            : prev,
        )
        baseResults.set(paramName, baseResult)
      }
    }

    return { results, baseResults }
  }, [config, returnConfig])

  // Get parameter ranking by impact
  const parameterRanking = useMemo(() => {
    return getMostImpactfulParameters(analysisResults.results, analysisResults.baseResults)
  }, [analysisResults])

  // Format chart data for a specific parameter
  const getChartData = (paramName: string) => {
    const results = analysisResults.results.get(paramName)
    if (!results) return []

    const parameter = SENSITIVITY_PARAMETERS[paramName]
    return results.map(result => ({
      name: parameter.formatValue(result.parameterValue),
      Endkapital: result.finalCapital,
      Einzahlungen: result.totalContributions,
      Gewinne: result.totalGains,
    }))
  }

  // Get impact description
  const getImpactDescription = (impact: number) => {
    if (impact > 5) return { emoji: '🔴', text: 'Sehr hoher Einfluss', color: 'text-red-600' }
    if (impact > 2) return { emoji: '🟠', text: 'Hoher Einfluss', color: 'text-orange-600' }
    if (impact > 0.5) return { emoji: '🟡', text: 'Mittlerer Einfluss', color: 'text-yellow-600' }
    return { emoji: '🟢', text: 'Geringer Einfluss', color: 'text-green-600' }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-6">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <span>{title}</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Introduction */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-gray-700">
                <strong>Was ist Sensitivitätsanalyse?</strong>
                {' '}
                Diese Analyse zeigt Ihnen, wie sich Änderungen einzelner Parameter auf Ihr Endkapital auswirken.
                So können Sie besser verstehen, welche Faktoren den größten Einfluss auf Ihre finanzielle Planung haben.
              </p>
            </div>

            {/* Parameter Ranking */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                🎯 Einflussreichste Parameter
              </h3>
              <div className="space-y-2">
                {parameterRanking.map((ranking, index) => {
                  const parameter = SENSITIVITY_PARAMETERS[ranking.parameter]
                  const impactInfo = getImpactDescription(ranking.impact)
                  return (
                    <div
                      key={ranking.parameter}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-400">
                          #
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-gray-800">{parameter.displayName}</div>
                          <div className={`text-sm ${impactInfo.color}`}>
                            {impactInfo.emoji}
                            {' '}
                            {impactInfo.text}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Sensitivität</div>
                        <div className="font-bold text-gray-800">
                          {ranking.impact.toFixed(2)}
                          %
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Detailed Analysis for Each Parameter */}
            {parameterRanking.slice(0, 3).map((ranking) => {
              const parameter = SENSITIVITY_PARAMETERS[ranking.parameter]
              const results = analysisResults.results.get(ranking.parameter)
              const baseResult = analysisResults.baseResults.get(ranking.parameter)
              const chartData = getChartData(ranking.parameter)

              if (!results || !baseResult) return null

              const lowestResult = results[0]
              const highestResult = results[results.length - 1]
              const capitalRange = Math.abs(highestResult.finalCapital - lowestResult.finalCapital)

              return (
                <div key={ranking.parameter} className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    📈
                    {' '}
                    {parameter.displayName}
                  </h3>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-red-50 to-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <div className="text-xs text-gray-600 mb-1">
                        Niedrigster Wert (
                        {parameter.formatValue(lowestResult.parameterValue)}
                        )
                      </div>
                      <div className="font-bold text-gray-800">
                        {formatCurrency(lowestResult.finalCapital)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-green-50 p-3 rounded-lg border-l-4 border-green-400">
                      <div className="text-xs text-gray-600 mb-1">
                        Höchster Wert (
                        {parameter.formatValue(highestResult.parameterValue)}
                        )
                      </div>
                      <div className="font-bold text-gray-800">
                        {formatCurrency(highestResult.finalCapital)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border-l-4 border-purple-400">
                      <div className="text-xs text-gray-600 mb-1">Spannweite</div>
                      <div className="font-bold text-gray-800">
                        {formatCurrency(capitalRange)}
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-white p-4 rounded-lg border">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line
                          type="monotone"
                          dataKey="Endkapital"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Einzahlungen"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Gewinne"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Interpretation */}
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                    <strong>💡 Interpretation:</strong>
                    {' '}
                    {ranking.parameter === 'returnRate' && (
                      'Die Rendite hat einen starken Einfluss auf Ihr Endkapital. Kleine Änderungen in der durchschnittlichen Rendite können über lange Zeiträume zu großen Unterschieden führen.'
                    )}
                    {ranking.parameter === 'savingsAmount' && (
                      'Ihre regelmäßigen Einzahlungen sind entscheidend für den Vermögensaufbau. Höhere Sparraten führen linear zu mehr Endkapital.'
                    )}
                    {ranking.parameter === 'taxRate' && (
                      'Die Steuerlast reduziert Ihre Rendite. Steueroptimierung kann einen bedeutenden Unterschied machen.'
                    )}
                    {ranking.parameter === 'inflationRate' && (
                      'Inflation reduziert die reale Kaufkraft Ihres Kapitals. Ihre Rendite sollte über der Inflationsrate liegen, um reale Gewinne zu erzielen.'
                    )}
                    {ranking.parameter === 'investmentPeriod' && (
                      'Der Anlagehorizont ist einer der wichtigsten Faktoren. Längere Anlagezeiträume ermöglichen stärkeren Zinseszinseffekt.'
                    )}
                  </div>
                </div>
              )
            })}

            {/* Action Items */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <h4 className="font-semibold text-gray-800 mb-2">✅ Handlungsempfehlungen</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • Fokussieren Sie sich auf die einflussreichsten Parameter in Ihrer Planung
                </li>
                <li>
                  • Nutzen Sie diese Erkenntnisse, um realistische Szenarien zu entwickeln
                </li>
                <li>
                  • Bedenken Sie, dass Sie manche Parameter (z.B. Rendite) nicht direkt kontrollieren können
                </li>
                <li>
                  • Andere Parameter (z.B. Sparrate, Anlagedauer) können Sie aktiv steuern
                </li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default SensitivityAnalysisDisplay
