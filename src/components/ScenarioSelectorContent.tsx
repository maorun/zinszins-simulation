import { useMemo } from 'react'
import { Alert, AlertDescription } from './ui/alert'
import { CardContent } from './ui/card'
import { Lightbulb } from 'lucide-react'
import {
  predefinedScenarios,
  getScenarioCategories,
  searchScenarios,
  type FinancialScenario,
} from '../data/scenarios'
import { ScenarioSearchBar } from './ScenarioSearchBar'
import { ScenarioCategoryList } from './ScenarioCategoryList'

interface ScenarioSelectorContentProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  onScenarioClick: (scenario: FinancialScenario) => void
}

/**
 * Content component for ScenarioSelector
 */
export function ScenarioSelectorContent({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onScenarioClick,
}: ScenarioSelectorContentProps) {
  // Filter scenarios based on search query
  const filteredScenarios = useMemo(() => {
    if (!searchQuery.trim()) {
      return predefinedScenarios
    }
    return searchScenarios(searchQuery)
  }, [searchQuery])

  // Group scenarios by category
  const scenariosByCategory = useMemo(() => {
    const categories = getScenarioCategories()
    return categories.map(category => ({
      ...category,
      scenarios: filteredScenarios.filter(s => s.category === category.id),
    }))
  }, [filteredScenarios])

  return (
    <CardContent className="space-y-4">
      {/* Introduction */}
      <Alert className="bg-blue-50 border-blue-200">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          <strong>Lernszenarien entdecken:</strong>
          {' '}
          Erkunden Sie vordefinierte Finanzszenarien, um verschiedene
          Anlagestrategien kennenzulernen. Jedes Szenario zeigt realistische
          Beispiele mit Lernpunkten und Risiken.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <ScenarioSearchBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
      />

      {/* Scenario Categories */}
      <ScenarioCategoryList
        categories={scenariosByCategory}
        onScenarioClick={onScenarioClick}
        hasNoResults={filteredScenarios.length === 0}
      />
    </CardContent>
  )
}
