/**
 * Comprehensive Withdrawal Strategy Comparison Matrix
 * Side-by-side comparison with ranking and recommendations
 */

import { useMemo, type FC, type ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { formatCurrency } from '../utils/currency'
import {
  rankStrategies,
  getRecommendedStrategies,
  type StrategyComparisonResult,
  type RiskProfile,
  RISK_PROFILE_WEIGHTS,
} from '../utils/withdrawal-strategy-ranking'
import { Trophy, TrendingUp, Shield, DollarSign, AlertCircle } from 'lucide-react'

interface WithdrawalStrategyComparisonMatrixProps {
  comparisonResults: StrategyComparisonResult[]
  startingCapital: number
  plannedDuration: number
  riskProfile?: RiskProfile
}

/**
 * Badge component for strategy rank
 */
function RankBadge({ rank }: { rank: number }) {
  const variant = rank === 1 ? 'default' : rank <= 3 ? 'secondary' : 'outline'
  const icon = rank === 1 ? <Trophy className="h-3 w-3 inline mr-1" /> : null
  
  return (
    <Badge variant={variant} className="ml-2">
      {icon}
      #{rank}
    </Badge>
  )
}

/**
 * Visual indicator for success rate
 */
function SuccessRateIndicator({ successRate }: { successRate: number }) {
  const percentage = Math.round(successRate * 100)
  const color =
    percentage >= 90
      ? 'text-green-600'
      : percentage >= 70
        ? 'text-yellow-600'
        : 'text-red-600'
  
  return (
    <span className={color}>
      {percentage}%
    </span>
  )
}

/**
 * Risk indicator with icon
 */
function RiskIndicator({ risk }: { risk: number }) {
  const level = risk < 10 ? 'Niedrig' : risk < 20 ? 'Mittel' : 'Hoch'
  const color =
    risk < 10
      ? 'text-green-600'
      : risk < 20
        ? 'text-yellow-600'
        : 'text-red-600'
  
  return (
    <span className={color}>
      {level} ({risk.toFixed(1)}%)
    </span>
  )
}

/**
 * Score visualization bar
 */
function ScoreBar({ score }: { score: number }) {
  const percentage = Math.round(score)
  const width = `${percentage}%`
  const color =
    percentage >= 80
      ? 'bg-green-500'
      : percentage >= 60
        ? 'bg-blue-500'
        : percentage >= 40
          ? 'bg-yellow-500'
          : 'bg-red-500'
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-300`}
        style={{ width }}
      />
    </div>
  )
}

/**
 * Strategy comparison row in the matrix
 */
function StrategyRow({ result }: { result: StrategyComparisonResult }) {
  const durationDisplay =
    result.portfolioLifeYears === 'unlimited'
      ? 'Unbegrenzt'
      : `${result.portfolioLifeYears} Jahre`
  
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3 font-medium">
        {result.displayName}
        <RankBadge rank={result.rank} />
        <div className="text-xs text-gray-500 mt-1">
          {result.returnRate}% Rendite
        </div>
      </td>
      <td className="p-3 text-right">
        <div className="font-semibold">{Math.round(result.overallScore)}/100</div>
        <ScoreBar score={result.overallScore} />
      </td>
      <td className="p-3 text-right">
        {formatCurrency(result.finalCapital)}
      </td>
      <td className="p-3 text-right">
        {formatCurrency(result.totalWithdrawal)}
      </td>
      <td className="p-3 text-right">
        {formatCurrency(result.averageAnnualWithdrawal)}
      </td>
      <td className="p-3 text-right">
        {durationDisplay}
      </td>
      <td className="p-3 text-center">
        <SuccessRateIndicator successRate={result.successRate} />
      </td>
      <td className="p-3 text-center">
        <RiskIndicator risk={result.downsideRisk} />
      </td>
    </tr>
  )
}

const profileLabels: Record<RiskProfile, string> = {
  conservative: 'Konservativ',
  balanced: 'Ausgewogen',
  aggressive: 'Aggressiv',
}

const profileDescriptions: Record<RiskProfile, string> = {
  conservative: 'Fokus auf Kapitalerhalt und Langlebigkeit des Portfolios',
  balanced: 'Ausgewogenes Verhältnis zwischen Entnahmen und Sicherheit',
  aggressive: 'Maximierung der Gesamtentnahmen',
}

const profileIcons: Record<RiskProfile, ReactNode> = {
  conservative: <Shield className="h-5 w-5" />,
  balanced: <TrendingUp className="h-5 w-5" />,
  aggressive: <DollarSign className="h-5 w-5" />,
}

/**
 * Recommendation card for top strategies
 */
const RecommendationCard: FC<{
  results: StrategyComparisonResult[]
  riskProfile: RiskProfile
}> = ({ results, riskProfile }) => {
  const recommended = getRecommendedStrategies(results, riskProfile)
  
  return (
    <Alert className="mb-6">
      <div className="flex items-start gap-3">
        {profileIcons[riskProfile]}
        <div className="flex-1">
          <AlertDescription>
            <strong className="text-base">
              Empfehlung für {profileLabels[riskProfile]} Profil
            </strong>
            <p className="text-sm text-gray-600 mt-1 mb-3">
              {profileDescriptions[riskProfile]}
            </p>
            <div className="space-y-2">
              {recommended.map((result, index) => (
                <div key={result.strategy} className="flex items-center gap-2">
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    {index + 1}. Wahl
                  </Badge>
                  <span className="font-medium">{result.displayName}</span>
                  <span className="text-sm text-gray-500">
                    (Score: {Math.round(result.overallScore)}/100)
                  </span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

/**
 * Weighting information for current profile
 */
function WeightingInfo({ riskProfile }: { riskProfile: RiskProfile }) {
  const weights = RISK_PROFILE_WEIGHTS[riskProfile]
  
  return (
    <div className="text-sm text-gray-600 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">Gewichtung der Bewertungskriterien:</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-6">
        <div>Portfolio-Lebensdauer: {Math.round(weights.portfolioLife * 100)}%</div>
        <div>Gesamtentnahme: {Math.round(weights.totalWithdrawal * 100)}%</div>
        <div>Kapitalerhalt: {Math.round(weights.capitalPreservation * 100)}%</div>
        <div>Stabilität: {Math.round(weights.stability * 100)}%</div>
      </div>
    </div>
  )
}

function ComparisonLegend() {
  return (
    <div className="mt-6 text-xs text-gray-500 space-y-1">
      <p><strong>Gesamt-Score:</strong> Gewichtete Bewertung basierend auf allen Kriterien (0-100)</p>
      <p><strong>Erfolgsrate:</strong> Wahrscheinlichkeit, dass das Portfolio die geplante Dauer überlebt</p>
      <p><strong>Risiko:</strong> Volatilität der jährlichen Entnahmen (Variationskoeffizient)</p>
    </div>
  )
}

function ComparisonTableHeader() {
  return (
    <thead className="bg-gray-100 border-b-2 border-gray-300">
      <tr>
        <th className="p-3 text-left font-semibold">Strategie</th>
        <th className="p-3 text-right font-semibold">Gesamt-Score</th>
        <th className="p-3 text-right font-semibold">Endkapital</th>
        <th className="p-3 text-right font-semibold">Gesamt-Entnahme</th>
        <th className="p-3 text-right font-semibold">Ø Jährlich</th>
        <th className="p-3 text-right font-semibold">Portfolio-Lebensdauer</th>
        <th className="p-3 text-center font-semibold">Erfolgsrate</th>
        <th className="p-3 text-center font-semibold">Risiko</th>
      </tr>
    </thead>
  )
}

function ComparisonMatrixContent({
  rankedResults,
  riskProfile,
}: {
  rankedResults: StrategyComparisonResult[]
  riskProfile: RiskProfile
}) {
  return (
    <>
      <RecommendationCard results={rankedResults} riskProfile={riskProfile} />
      <WeightingInfo riskProfile={riskProfile} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <ComparisonTableHeader />
          <tbody>
            {rankedResults.map(result => (
              <StrategyRow key={result.strategy} result={result} />
            ))}
          </tbody>
        </table>
      </div>
      <ComparisonLegend />
    </>
  )
}

/**
 * Main comparison matrix component
 */
export function WithdrawalStrategyComparisonMatrix({
  comparisonResults,
  startingCapital,
  plannedDuration,
  riskProfile = 'balanced',
}: WithdrawalStrategyComparisonMatrixProps) {
  const rankedResults = useMemo(
    () => rankStrategies(comparisonResults, RISK_PROFILE_WEIGHTS[riskProfile]),
    [comparisonResults, riskProfile],
  )
  
  if (comparisonResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Strategien-Vergleichsmatrix</CardTitle>
          <CardDescription>
            Keine Strategien zum Vergleich verfügbar. Konfigurieren Sie verschiedene
            Entnahmestrategien, um einen umfassenden Vergleich zu sehen.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Strategien-Vergleichsmatrix
        </CardTitle>
        <CardDescription>
          Umfassender Vergleich verschiedener Entnahmestrategien mit Rangfolge basierend auf
          Ihrem Risikoprofil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>Startkapital bei Entnahme:</strong> {formatCurrency(startingCapital)}
            <span className="mx-2">•</span>
            <strong>Geplante Dauer:</strong> {plannedDuration} Jahre
          </p>
        </div>
        <ComparisonMatrixContent rankedResults={rankedResults} riskProfile={riskProfile} />
      </CardContent>
    </Card>
  )
}
