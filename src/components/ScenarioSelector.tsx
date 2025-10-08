import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog'
import { TooltipProvider } from './ui/tooltip'
import { ChevronDown, Lightbulb, AlertTriangle, UserCheck, Play, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigationItem } from '../hooks/useNavigationItem'
import { GlossaryTerm } from './GlossaryTerm'
import {
  predefinedScenarios,
  getScenarioCategories,
  searchScenarios,
  type FinancialScenario,
} from '../data/scenarios'

interface ScenarioSelectorProps {
  onApplyScenario: (scenario: FinancialScenario) => void
}

/**
 * ScenarioSelector Component
 * Displays predefined What-If scenarios and allows users to apply them to their simulation
 */
export function ScenarioSelector({ onApplyScenario }: ScenarioSelectorProps) {
  const [selectedScenario, setSelectedScenario] = useState<FinancialScenario | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navigationRef = useNavigationItem({
    id: 'scenario-selector',
    title: 'Was-wäre-wenn Szenarien',
    icon: '💡',
    level: 0,
  })

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

  const handleScenarioClick = (scenario: FinancialScenario) => {
    setSelectedScenario(scenario)
    setIsDetailsOpen(true)
  }

  const handleApplyScenario = () => {
    if (!selectedScenario) return

    try {
      onApplyScenario(selectedScenario)
      setIsDetailsOpen(false)
      toast.success(`Szenario "${selectedScenario.name}" wurde angewendet`)
    }
    catch (error) {
      console.error('Failed to apply scenario:', error)
      toast.error('Fehler beim Anwenden des Szenarios')
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  return (
    <TooltipProvider>
      <Collapsible>
        <Card ref={navigationRef}>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 hover:bg-transparent"
              >
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  💡 Was-wäre-wenn
                  {' '}
                  <GlossaryTerm term="szenario" showIcon />
                </CardTitle>
                <ChevronDown className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsibleContent>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Szenarien durchsuchen..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Scenario Categories */}
              {scenariosByCategory.map(category => (
                category.scenarios.length > 0 && (
                  <div key={category.id} className="space-y-3">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      {category.name}
                      <span className="text-sm font-normal text-gray-500">
                        (
                        {category.scenarios.length}
                        )
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.scenarios.map(scenario => (
                        <button
                          key={scenario.id}
                          onClick={() => handleScenarioClick(scenario)}
                          className="text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
                          type="button"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                              {scenario.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                                {scenario.name}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {scenario.description}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {scenario.config.monthlyContribution > 0
                                    ? `${scenario.config.monthlyContribution}€/Monat`
                                    : 'Einmalanlage'}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {scenario.config.expectedReturn}
                                  % Rendite
                                </span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {scenario.config.retirementYear - scenario.config.startYear}
                                  {' '}
                                  Jahre
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}

              {/* No results */}
              {filteredScenarios.length === 0 && (
                <Alert>
                  <AlertDescription className="text-sm text-gray-600">
                    Keine Szenarien gefunden. Versuchen Sie einen anderen Suchbegriff.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Scenario Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedScenario && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <span className="text-3xl">{selectedScenario.icon}</span>
                  {selectedScenario.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Description */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedScenario.description}</p>
                </div>

                {/* Configuration Overview */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    📊 Szenario-Konfiguration
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Zeitraum:</span>
                      <div className="text-gray-700">
                        {selectedScenario.config.retirementYear - selectedScenario.config.startYear}
                        {' '}
                        Jahre
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Monatlich:</span>
                      <div className="text-gray-700">
                        {selectedScenario.config.monthlyContribution}
                        €
                      </div>
                    </div>
                    {selectedScenario.config.initialInvestment && (
                      <div>
                        <span className="text-blue-700 font-medium">Startkapital:</span>
                        <div className="text-gray-700">
                          {selectedScenario.config.initialInvestment.toLocaleString('de-DE')}
                          €
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-blue-700 font-medium">Erwartete Rendite:</span>
                      <div className="text-gray-700">
                        {selectedScenario.config.expectedReturn}
                        % p.a.
                      </div>
                    </div>
                    {selectedScenario.config.volatility && (
                      <div>
                        <span className="text-blue-700 font-medium">
                          <GlossaryTerm term="volatilitaet">Volatilität</GlossaryTerm>
                          :
                        </span>
                        <div className="text-gray-700">
                          {selectedScenario.config.volatility}
                          %
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-blue-700 font-medium">TER:</span>
                      <div className="text-gray-700">
                        {selectedScenario.config.ter || 0}
                        % p.a.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Points */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Lernpunkte
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {selectedScenario.learningPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risiken & Nachteile
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {selectedScenario.risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold flex-shrink-0">!</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suitable For */}
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Geeignet für
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {selectedScenario.suitableFor.map((suitable, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold flex-shrink-0">→</span>
                        <span>{suitable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <DialogClose asChild>
                  <Button variant="outline">
                    Abbrechen
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleApplyScenario}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Szenario anwenden
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default ScenarioSelector
