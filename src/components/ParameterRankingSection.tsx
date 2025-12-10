import ParameterRankingCard from './ParameterRankingCard'

interface ParameterRanking {
  parameter: string
  impact: number
}

interface ParameterRankingSectionProps {
  rankings: ParameterRanking[]
}

function ParameterRankingSection({ rankings }: ParameterRankingSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-800">🎯 Einflussreichste Parameter</h3>
      <div className="space-y-2">
        {rankings.map((ranking, index) => (
          <ParameterRankingCard key={ranking.parameter} ranking={ranking} index={index} />
        ))}
      </div>
    </div>
  )
}

export default ParameterRankingSection
