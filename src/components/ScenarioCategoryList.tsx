import { Alert, AlertDescription } from './ui/alert'
import type { FinancialScenario } from '../data/scenarios'

interface ScenarioButtonProps {
  scenario: FinancialScenario
  onClick: (scenario: FinancialScenario) => void
}

/**
 * Component to render individual scenario button
 */
function ScenarioButton({ scenario, onClick }: ScenarioButtonProps) {
  return (
    <button
      onClick={() => onClick(scenario)}
      className="text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
      type="button"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{scenario.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
            {scenario.name}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">{scenario.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {scenario.config.monthlyContribution > 0
                ? `${scenario.config.monthlyContribution}€/Monat`
                : 'Einmalanlage'}
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {scenario.config.expectedReturn}% Rendite
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              {scenario.config.retirementYear - scenario.config.startYear} Jahre
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

interface CategoryWithScenarios {
  id: string
  name: string
  icon: string
  scenarios: FinancialScenario[]
}

interface ScenarioCategoryListProps {
  categories: CategoryWithScenarios[]
  onScenarioClick: (scenario: FinancialScenario) => void
  hasNoResults: boolean
}

/**
 * Component to display scenarios grouped by category
 */
export function ScenarioCategoryList({ categories, onScenarioClick, hasNoResults }: ScenarioCategoryListProps) {
  if (hasNoResults) {
    return (
      <Alert>
        <AlertDescription className="text-sm text-gray-600">
          Keine Szenarien gefunden. Versuchen Sie einen anderen Suchbegriff.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      {categories.map(
        category =>
          category.scenarios.length > 0 && (
            <div key={category.id} className="space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                {category.name}
                <span className="text-sm font-normal text-gray-500">({category.scenarios.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.scenarios.map(scenario => (
                  <ScenarioButton key={scenario.id} scenario={scenario} onClick={onScenarioClick} />
                ))}
              </div>
            </div>
          ),
      )}
    </>
  )
}
