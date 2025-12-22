import { formatCurrency } from '../../utils/currency'
import { RiskLevelBadge, ScenarioComparison } from './components'
import type { analyzeSequenceRisk } from '../../../helpers/sequence-risk'

type AnalysisResult = ReturnType<typeof analyzeSequenceRisk>

interface AnalysisResultsProps {
  analysis: AnalysisResult
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Risikobewertung</h3>
        <RiskLevelBadge level={analysis.riskLevel} />
      </div>

      <ScenarioComparison
        bestCase={analysis.bestCase}
        averageCase={analysis.averageCase}
        worstCase={analysis.worstCase}
      />

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-sm">Unterschied zwischen Best- und Worst-Case</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Endkapital-Differenz</p>
            <p className="font-medium">{formatCurrency(analysis.outcomeDifference.portfolioValueDiff)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Jahre-Differenz</p>
            <p className="font-medium">{analysis.outcomeDifference.yearsSurvivedDiff} Jahre</p>
          </div>
        </div>
        {analysis.outcomeDifference.percentageDiff !== Infinity && (
          <p className="text-xs text-muted-foreground">
            Das entspricht einem Unterschied von {analysis.outcomeDifference.percentageDiff.toFixed(1)}%
          </p>
        )}
      </div>

      {analysis.recommendations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Empfehlungen</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="text-blue-600 font-bold">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
