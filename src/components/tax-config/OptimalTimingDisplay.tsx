import { type ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Clock, TrendingUp, TrendingDown } from 'lucide-react'
import type { OptimalTimingRecommendation } from '../../../helpers/loss-carryforward-simulator'
import { formatCurrency } from '../../utils/currency'

interface OptimalTimingDisplayProps {
  timingRecommendations: OptimalTimingRecommendation[]
}

export function OptimalTimingDisplay({ timingRecommendations }: OptimalTimingDisplayProps) {
  if (timingRecommendations.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Optimale Zeitplanung
        </CardTitle>
        <CardDescription>Jahr-für-Jahr Empfehlungen zur optimalen Gewinnrealisierung</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {timingRecommendations.map(rec => (
            <TimingRecommendationCard key={rec.year} recommendation={rec} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TimingRecommendationCard({ recommendation }: { recommendation: OptimalTimingRecommendation }) {
  return (
    <div className={`border rounded-lg p-4 ${getPriorityBorderClass(recommendation.priority)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-lg">{recommendation.year}</span>
            <Badge variant={getPriorityVariant(recommendation.priority)}>{getPriorityLabel(recommendation.priority)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{recommendation.reasoning}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendation.recommendedStockGainRealization > 0 && (
              <MetricDisplay
                label="Aktiengewinne"
                value={formatCurrency(recommendation.recommendedStockGainRealization)}
                icon={<TrendingUp className="h-3 w-3" />}
                small
              />
            )}
            {recommendation.recommendedOtherGainRealization > 0 && (
              <MetricDisplay
                label="Sonstige Gewinne"
                value={formatCurrency(recommendation.recommendedOtherGainRealization)}
                icon={<TrendingUp className="h-3 w-3" />}
                small
              />
            )}
            <MetricDisplay
              label="Steuerersparnis"
              value={formatCurrency(recommendation.projectedTaxSavings)}
              icon={<TrendingDown className="h-3 w-3" />}
              small
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricDisplay({ label, value, icon, small }: { label: string; value: string; icon?: ReactNode; small?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={small ? 'font-medium text-sm' : 'font-bold'}>{value}</p>
    </div>
  )
}

function getPriorityBorderClass(priority: 'low' | 'medium' | 'high'): string {
  const classes = {
    low: 'border-gray-300',
    medium: 'border-yellow-300',
    high: 'border-green-400',
  }
  return classes[priority]
}

function getPriorityVariant(priority: 'low' | 'medium' | 'high'): 'default' | 'secondary' | 'outline' {
  const variants: Record<'low' | 'medium' | 'high', 'default' | 'secondary' | 'outline'> = {
    low: 'outline',
    medium: 'secondary',
    high: 'default',
  }
  return variants[priority]
}

function getPriorityLabel(priority: 'low' | 'medium' | 'high'): string {
  const labels = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
  }
  return labels[priority]
}
