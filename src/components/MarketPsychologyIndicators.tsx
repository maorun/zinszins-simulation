import { useState, useMemo } from 'react'
import { TrendingUp, Search, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { CollapsibleCard, CollapsibleCardHeader, CollapsibleCardContent } from './ui/collapsible-card'
import { Input } from './ui/input'
import {
  getMarketPsychologyState,
  getSentimentColor,
  getSentimentLabel,
  type MarketIndicator,
} from '../data/market-psychology'

/**
 * Format indicator value for display with visual indicator
 */
function formatIndicatorValue(value: number): { display: string; color: string } {
  const color = value <= 40 ? 'text-red-600' : value >= 60 ? 'text-green-600' : 'text-gray-600'
  return {
    display: `${value}/100`,
    color,
  }
}

/**
 * Individual Indicator Card Component
 */
interface IndicatorCardProps {
  indicator: MarketIndicator
}

function IndicatorCard({ indicator }: IndicatorCardProps) {
  const valueDisplay = useMemo(() => formatIndicatorValue(indicator.currentValue), [indicator.currentValue])

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-semibold">{indicator.germanName}</h4>
            <p className="text-xs text-gray-500">{indicator.name}</p>
          </div>
          <div className={`text-lg font-bold ${valueDisplay.color}`}>{valueDisplay.display}</div>
        </div>
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <div className="space-y-3 text-sm">
          <div>
            <h5 className="font-semibold text-gray-700 mb-1">Beschreibung</h5>
            <p className="text-gray-600">{indicator.description}</p>
          </div>
          <div>
            <h5 className="font-semibold text-gray-700 mb-1">Interpretation</h5>
            <p className="text-gray-600">{indicator.interpretation}</p>
          </div>
          <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
            <span>Quelle: {indicator.source}</span>
            {indicator.lastUpdate && <span>{indicator.lastUpdate}</span>}
          </div>
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}

/**
 * Sentiment Gauge Visual Component
 */
interface SentimentGaugeProps {
  score: number
}

function SentimentGauge({ score }: SentimentGaugeProps) {
  // Create gradient segments for the gauge
  const segments = [
    { start: 0, end: 20, color: 'bg-red-500', label: 'Extreme Angst' },
    { start: 20, end: 40, color: 'bg-orange-500', label: 'Angst' },
    { start: 40, end: 60, color: 'bg-gray-400', label: 'Neutral' },
    { start: 60, end: 80, color: 'bg-green-500', label: 'Gier' },
    { start: 80, end: 100, color: 'bg-emerald-600', label: 'Extreme Gier' },
  ]

  return (
    <div className="space-y-3">
      {/* Score display */}
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-800">{score}</div>
        <div className="text-sm text-gray-500">von 100</div>
      </div>

      {/* Gauge visualization */}
      <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden flex">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`${segment.color} flex-1 transition-all`}
            style={{
              opacity: score >= segment.start && score <= segment.end ? 1 : 0.3,
            }}
          />
        ))}
        {/* Score indicator */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-black shadow-lg"
          style={{
            left: `${score}%`,
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Segment labels */}
      <div className="flex justify-between text-xs text-gray-600">
        {segments.map((segment, index) => (
          <span key={index} className="flex-1 text-center">
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Overall Sentiment Display Component
 */
interface OverallSentimentDisplayProps {
  sentimentLabel: string
  sentimentColor: string
  sentimentScore: number
  interpretation: string
  recommendation: string
  historicalContext: string
}

function OverallSentimentDisplay({
  sentimentLabel,
  sentimentColor,
  sentimentScore,
  interpretation,
  recommendation,
  historicalContext,
}: OverallSentimentDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gesamt-Sentiment</h3>
        <span className={`px-4 py-2 rounded-lg border text-sm font-semibold ${sentimentColor}`}>
          {sentimentLabel}
        </span>
      </div>

      <SentimentGauge score={sentimentScore} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Interpretation</h4>
        <p className="text-sm text-blue-800">{interpretation}</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">Empfehlung</h4>
        <p className="text-sm text-green-800">{recommendation}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Historischer Kontext</h4>
        <p className="text-sm text-gray-700">{historicalContext}</p>
      </div>
    </div>
  )
}

/**
 * Educational Note Component
 */
function EducationalNote() {
  return (
    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-yellow-800">
        <p className="font-semibold mb-1">Bildungszwecke</p>
        <p>
          Diese Indikatoren dienen ausschließlich Bildungszwecken und verwenden Beispielwerte. Sie sind keine
          Anlageberatung. Sentiment-Indikatoren können hilfreich sein, sollten aber nie alleinige Grundlage für
          Investmententscheidungen sein.
        </p>
      </div>
    </div>
  )
}

/**
 * Usage Guidance Component
 */
function UsageGuidance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Wie nutze ich diese Indikatoren?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-gray-700">
        <div>
          <h4 className="font-semibold mb-1">🎯 Langfristige Perspektive</h4>
          <p>
            Sentiment-Indikatoren sind am nützlichsten für langfristige Anleger. Extreme Fear kann auf
            Kaufgelegenheiten hindeuten, Extreme Greed auf überhitzte Märkte.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-1">⚖️ Nicht isoliert betrachten</h4>
          <p>
            Nutzen Sie Sentiment-Indikatoren als einen von mehreren Faktoren in Ihrer Analyse. Fundamentaldaten,
            Bewertungen und Ihre persönliche Risikotoleranz sind ebenso wichtig.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-1">🔄 Konträrer Ansatz</h4>
          <p>
            Viele erfolgreiche Investoren nutzen Sentiment konträr: Sie kaufen, wenn andere ängstlich sind, und
            werden vorsichtig, wenn andere gierig sind (Warren Buffett-Prinzip).
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-1">⏰ Timing ist schwierig</h4>
          <p>
            Selbst bei extremen Sentiment-Werten kann es noch Wochen oder Monate dauern, bis sich die Märkte drehen.
            Market-Timing ist extrem schwierig - Sparpläne sind oft die bessere Alternative.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Indicators List Component
 */
interface IndicatorsListProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredIndicators: Array<[string, MarketIndicator]>
  totalIndicators: number
}

function IndicatorsList({ searchTerm, setSearchTerm, filteredIndicators, totalIndicators }: IndicatorsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Einzelne Indikatoren</CardTitle>
        <CardDescription>Detaillierte Übersicht aller Markt-Sentiment-Indikatoren</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Indikatoren durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="text-sm text-gray-500">
          {filteredIndicators.length} von {totalIndicators} Indikatoren
        </div>

        <div className="space-y-3">
          {filteredIndicators.length > 0 ? (
            filteredIndicators.map(([key, indicator]) => <IndicatorCard key={key} indicator={indicator} />)
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Keine Indikatoren gefunden für &quot;{searchTerm}&quot;</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Main Market Psychology Indicators Component
 */
export function MarketPsychologyIndicators() {
  const [searchTerm, setSearchTerm] = useState('')
  const psychologyState = useMemo(() => getMarketPsychologyState(), [])

  const filteredIndicators = useMemo(() => {
    if (!searchTerm) return Object.entries(psychologyState.indicators)

    const term = searchTerm.toLowerCase()
    return Object.entries(psychologyState.indicators).filter(
      ([, indicator]) =>
        indicator.name.toLowerCase().includes(term) ||
        indicator.germanName.toLowerCase().includes(term) ||
        indicator.description.toLowerCase().includes(term),
    )
  }, [searchTerm, psychologyState.indicators])

  const sentimentColor = useMemo(() => getSentimentColor(psychologyState.overallSentiment), [psychologyState.overallSentiment])
  const sentimentLabel = useMemo(() => getSentimentLabel(psychologyState.overallSentiment), [psychologyState.overallSentiment])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Marktpsychologie-Indikatoren</CardTitle>
          </div>
          <CardDescription>
            Fear & Greed Index und weitere Sentiment-Indikatoren zur Unterstützung bei Anlageentscheidungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OverallSentimentDisplay
            sentimentLabel={sentimentLabel}
            sentimentColor={sentimentColor}
            sentimentScore={psychologyState.sentimentScore}
            interpretation={psychologyState.interpretation}
            recommendation={psychologyState.recommendation}
            historicalContext={psychologyState.historicalContext}
          />
          <EducationalNote />
        </CardContent>
      </Card>

      <IndicatorsList
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredIndicators={filteredIndicators}
        totalIndicators={Object.keys(psychologyState.indicators).length}
      />

      <UsageGuidance />
    </div>
  )
}
