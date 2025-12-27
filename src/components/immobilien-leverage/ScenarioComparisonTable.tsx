import type { LeverageComparisonResults } from '../../../helpers/immobilien-leverage'
import { formatCurrency } from '../../utils/currency'

function getRiskColor(riskLevel: string): string {
  const colors: Record<string, string> = {
    niedrig: 'text-green-600',
    mittel: 'text-yellow-600',
    hoch: 'text-orange-600',
    'sehr hoch': 'text-red-600',
  }
  return colors[riskLevel] || 'text-gray-600'
}

interface ScenarioTableRowProps {
  result: LeverageComparisonResults['scenarios'][0]
  isRecommended: boolean
  isBestReturn: boolean
  isBestRisk: boolean
}

function ScenarioTableRow({ result, isRecommended, isBestReturn, isBestRisk }: ScenarioTableRowProps) {
  const riskColor = getRiskColor(result.riskIndicators.riskLevel)

  return (
    <tr className={`border-b hover:bg-gray-50 ${isRecommended ? 'bg-blue-50 font-semibold' : ''}`}>
      <td className="p-2">
        {result.scenario.name}
        {isRecommended && ' ⭐'}
        {isBestReturn && ' 📈'}
        {isBestRisk && ' 🛡️'}
      </td>
      <td className="text-right p-2">{formatCurrency(result.downPayment)}</td>
      <td className="text-right p-2">{formatCurrency(result.loanAmount)}</td>
      <td className="text-right p-2">{result.loanToValue.toFixed(1)}%</td>
      <td className="text-right p-2">{result.scenario.interestRate.toFixed(2)}%</td>
      <td className="text-right p-2">{formatCurrency(result.annualMortgagePayment)}</td>
      <td className="text-right p-2 font-semibold">{result.cashOnCashReturn.toFixed(2)}%</td>
      <td className="text-right p-2">
        {result.leverageEffect > 0 ? '+' : ''}
        {result.leverageEffect.toFixed(2)}%
      </td>
      <td className={`text-center p-2 ${riskColor}`}>
        {result.riskIndicators.riskLevel.charAt(0).toUpperCase() +
          result.riskIndicators.riskLevel.slice(1)}
      </td>
    </tr>
  )
}

interface ScenarioComparisonTableProps {
  results: LeverageComparisonResults
}

export function ScenarioComparisonTable({ results }: ScenarioComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left p-2">Szenario</th>
            <th className="text-right p-2">Eigenkapital</th>
            <th className="text-right p-2">Darlehen</th>
            <th className="text-right p-2">LTV</th>
            <th className="text-right p-2">Zinssatz</th>
            <th className="text-right p-2">Jährl. Rate</th>
            <th className="text-right p-2">Cash-on-Cash</th>
            <th className="text-right p-2">Hebeleffekt</th>
            <th className="text-center p-2">Risiko</th>
          </tr>
        </thead>
        <tbody>
          {results.scenarios.map((result, index) => {
            const isRecommended = result.scenario.name === results.recommendedScenario
            const isBestReturn = result.scenario.name === results.bestByReturn
            const isBestRisk = result.scenario.name === results.bestByRisk

            return (
              <ScenarioTableRow
                key={index}
                result={result}
                isRecommended={isRecommended}
                isBestReturn={isBestReturn}
                isBestRisk={isBestRisk}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
