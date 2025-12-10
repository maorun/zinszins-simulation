import { SENSITIVITY_PARAMETERS, type SensitivityResult } from '../utils/sensitivity-analysis'
import SummaryStats from './SummaryStats'
import SensitivityChart from './SensitivityChart'

interface ParameterRanking {
  parameter: string
  impact: number
}

interface DetailedParameterAnalysisProps {
  ranking: ParameterRanking
  results: SensitivityResult[]
  baseResult: SensitivityResult
}

// Format chart data for a specific parameter
const getChartData = (paramName: string, results: SensitivityResult[]) => {
  const parameter = SENSITIVITY_PARAMETERS[paramName]
  return results.map(result => ({
    name: parameter.formatValue(result.parameterValue),
    Endkapital: result.finalCapital,
    Einzahlungen: result.totalContributions,
    Gewinne: result.totalGains,
  }))
}

// Get interpretation text for a parameter
const getInterpretationText = (parameterName: string): string => {
  const interpretations: Record<string, string> = {
    returnRate:
      'Die Rendite hat einen starken Einfluss auf Ihr Endkapital. Kleine Änderungen in der durchschnittlichen Rendite können über lange Zeiträume zu großen Unterschieden führen.',
    savingsAmount:
      'Ihre regelmäßigen Einzahlungen sind entscheidend für den Vermögensaufbau. Höhere Sparraten führen linear zu mehr Endkapital.',
    taxRate: 'Die Steuerlast reduziert Ihre Rendite. Steueroptimierung kann einen bedeutenden Unterschied machen.',
    inflationRate:
      'Inflation reduziert die reale Kaufkraft Ihres Kapitals. Ihre Rendite sollte über der Inflationsrate liegen, um reale Gewinne zu erzielen.',
    investmentPeriod:
      'Der Anlagehorizont ist einer der wichtigsten Faktoren. Längere Anlagezeiträume ermöglichen stärkeren Zinseszinseffekt.',
  }

  return interpretations[parameterName] || ''
}

function DetailedParameterAnalysis({ ranking, results }: DetailedParameterAnalysisProps) {
  const parameter = SENSITIVITY_PARAMETERS[ranking.parameter]
  const chartData = getChartData(ranking.parameter, results)

  const lowestResult = results[0]
  const highestResult = results[results.length - 1]
  const capitalRange = Math.abs(highestResult.finalCapital - lowestResult.finalCapital)

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">📈 {parameter.displayName}</h3>

      {/* Summary Stats */}
      <SummaryStats
        lowestValue={lowestResult.finalCapital}
        lowestLabel={parameter.formatValue(lowestResult.parameterValue)}
        highestValue={highestResult.finalCapital}
        highestLabel={parameter.formatValue(highestResult.parameterValue)}
        rangeValue={capitalRange}
      />

      {/* Chart */}
      <SensitivityChart data={chartData} />

      {/* Interpretation */}
      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
        <strong>💡 Interpretation:</strong> {getInterpretationText(ranking.parameter)}
      </div>
    </div>
  )
}

export default DetailedParameterAnalysis
