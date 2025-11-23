import { AlertCircle, TrendingUp, Calendar, Target, DollarSign, Minimize2 } from 'lucide-react'
import { type AdjustmentRecommendation, type AdjustmentType, type AdjustmentSeverity } from '../../../helpers/goal-adjustments'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import type { ReactElement } from 'react'

interface GoalAdjustmentRecommendationsProps {
  recommendations: AdjustmentRecommendation[]
  goalName: string
  onTrack: boolean
}

/**
 * Get icon for recommendation type
 */
function getRecommendationIcon(type: AdjustmentType): ReactElement {
  const iconClass = 'w-5 h-5'
  
  switch (type) {
    case 'increase-savings':
      return <DollarSign className={iconClass} />
    case 'adjust-timeline':
      return <Calendar className={iconClass} />
    case 'adjust-expectations':
      return <Target className={iconClass} />
    case 'improve-returns':
      return <TrendingUp className={iconClass} />
    case 'reduce-costs':
      return <Minimize2 className={iconClass} />
    case 'on-track':
      return <Target className={iconClass} />
  }
}

/**
 * Get color classes for severity
 */
function getSeverityColorClasses(severity: AdjustmentSeverity): {
  border: string
  bg: string
  text: string
  iconBg: string
} {
  switch (severity) {
    case 'low':
      return {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        iconBg: 'bg-blue-100',
      }
    case 'medium':
      return {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        text: 'text-yellow-900',
        iconBg: 'bg-yellow-100',
      }
    case 'high':
      return {
        border: 'border-orange-200',
        bg: 'bg-orange-50',
        text: 'text-orange-900',
        iconBg: 'bg-orange-100',
      }
    case 'critical':
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        text: 'text-red-900',
        iconBg: 'bg-red-100',
      }
  }
}

/**
 * Get severity label in German
 */
function getSeverityLabel(severity: AdjustmentSeverity): string {
  switch (severity) {
    case 'low':
      return 'Niedrig'
    case 'medium':
      return 'Mittel'
    case 'high':
      return 'Hoch'
    case 'critical':
      return 'Kritisch'
  }
}

/**
 * Component for displaying a single recommendation
 */
function RecommendationCard({ recommendation }: { recommendation: AdjustmentRecommendation }) {
  const colors = getSeverityColorClasses(recommendation.severity)
  const icon = getRecommendationIcon(recommendation.type)
  const isOnTrack = recommendation.type === 'on-track'

  return (
    <div className={`border ${colors.border} ${colors.bg} rounded-lg p-4 ${colors.text}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`${colors.iconBg} rounded-lg p-2 flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-base">{recommendation.title}</h4>
            {!isOnTrack && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50 flex-shrink-0">
                {getSeverityLabel(recommendation.severity)}
              </span>
            )}
          </div>
          <p className="text-sm opacity-90">{recommendation.description}</p>
        </div>
      </div>

      {/* Action Items */}
      {recommendation.actionItems.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium opacity-75">Handlungsschritte:</p>
          <ul className="space-y-1.5">
            {recommendation.actionItems.map((item, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Impact */}
      {recommendation.impact && (
        <div className="mt-3 pt-3 border-t border-current/10">
          <p className="text-sm italic opacity-75">
            <strong>Auswirkung:</strong> {recommendation.impact}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Component for displaying goal adjustment recommendations
 */
export function GoalAdjustmentRecommendations({
  recommendations,
  goalName,
  onTrack,
}: GoalAdjustmentRecommendationsProps) {
  if (recommendations.length === 0) {
    return null
  }

  const isOnTrackStatus = onTrack && recommendations[0]?.type === 'on-track'

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="w-5 h-5" />
          {isOnTrackStatus ? `Empfehlungen für "${goalName}"` : `Anpassungsempfehlungen für "${goalName}"`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isOnTrackStatus && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-900">
              Sie sind auf einem guten Weg, Ihr Ziel zu erreichen! Bleiben Sie diszipliniert bei Ihrer Strategie.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </div>

        {!isOnTrackStatus && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 italic">
              💡 <strong>Hinweis:</strong> Diese Empfehlungen basieren auf Ihrer aktuellen Situation. Passen Sie Ihre
              Strategie schrittweise an und überprüfen Sie regelmäßig Ihren Fortschritt.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
