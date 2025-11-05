import React from 'react'
import { SENSITIVITY_PARAMETERS } from '../utils/sensitivity-analysis'

interface ParameterRanking {
  parameter: string
  impact: number
}

interface ParameterRankingCardProps {
  ranking: ParameterRanking
  index: number
}

const getImpactDescription = (impact: number) => {
  if (impact > 5) return { emoji: '🔴', text: 'Sehr hoher Einfluss', color: 'text-red-600' }
  if (impact > 2) return { emoji: '🟠', text: 'Hoher Einfluss', color: 'text-orange-600' }
  if (impact > 0.5) return { emoji: '🟡', text: 'Mittlerer Einfluss', color: 'text-yellow-600' }
  return { emoji: '🟢', text: 'Geringer Einfluss', color: 'text-green-600' }
}

const ParameterRankingCard: React.FC<ParameterRankingCardProps> = ({ ranking, index }) => {
  const parameter = SENSITIVITY_PARAMETERS[ranking.parameter]
  const impactInfo = getImpactDescription(ranking.impact)

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
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
}

export default ParameterRankingCard
