import type { MonteCarloResult } from './monte-carlo-helpers'

interface ScenarioCardProps {
  scenario: MonteCarloResult
}

const ScenarioCard = ({ scenario }: ScenarioCardProps) => {
  const isSuccess = scenario.scenario.includes('Best Case')
  const isDanger = scenario.scenario.includes('Worst Case') || scenario.isBlackSwan
  const isInfo = scenario.scenario.includes('Median')

  let cardClasses = 'border border-gray-200 rounded-lg p-4 bg-white shadow-sm'
  if (isSuccess) cardClasses += ' border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-green-100'
  else if (isDanger) cardClasses += ' border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-red-100'
  else if (isInfo) cardClasses += ' border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-50 to-cyan-100'

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-base text-gray-800">{scenario.scenario}</span>
        <span className="font-semibold text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded-xl">
          {scenario.probability}
        </span>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed">{scenario.description}</div>
    </div>
  )
}

export default ScenarioCard
