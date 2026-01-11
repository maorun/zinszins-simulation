/**
 * ScenarioLibrary Component
 * 
 * Provides a library of predefined, realistic life scenarios that users can
 * import with one click. Each scenario represents a typical financial situation
 * with appropriate parameters, savings rates, and investment strategies.
 * 
 * Features:
 * - Category-based filtering (Berufsanfänger, Familie, Karrieremitte, etc.)
 * - Search functionality by keyword
 * - Detailed scenario information with assumptions
 * - One-click import to apply scenario configuration
 */

import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Badge } from './ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog'
import { ChevronDown, ChevronUp, Search, BookOpen, Info, Download } from 'lucide-react'
import {
  getPredefinedScenarios,
  getScenariosByCategory,
  getAllCategories,
  searchScenarios,
  getCategoryDisplayName,
  type PredefinedScenario,
  type ScenarioCategory,
} from '../../helpers/predefined-scenarios'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'
import { useNavigationItem } from '../hooks/useNavigationItem'

interface ScenarioLibraryProps {
  onImportScenario: (configuration: ExtendedSavedConfiguration, scenarioName: string) => void
}

interface ScenarioCardProps {
  scenario: PredefinedScenario
  onImport: () => void
}

function ScenarioDetailsContent({ scenario }: { scenario: PredefinedScenario }) {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <h4 className="font-semibold text-sm mb-2">Zielgruppe</h4>
        <p className="text-sm text-gray-700">{scenario.targetAudience}</p>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-2">Detaillierte Erklärung</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{scenario.detailedExplanation}</p>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-2">Wichtige Annahmen</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          {scenario.keyAssumptions.map((assumption, idx) => (
            <li key={idx}>{assumption}</li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
        <div>
          <p className="text-xs text-gray-500">Erwartete Rendite</p>
          <p className="text-sm font-semibold">{scenario.configuration.rendite}% p.a.</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Anlagehorizont</p>
          <p className="text-sm font-semibold">
            {scenario.configuration.startEnd[1] - scenario.configuration.startEnd[0]} Jahre
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Renditemodus</p>
          <p className="text-sm font-semibold">
            {scenario.configuration.returnMode === 'fixed'
              ? 'Fest'
              : scenario.configuration.returnMode === 'random'
                ? 'Zufällig'
                : 'Variabel'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Sparpläne</p>
          <p className="text-sm font-semibold">{scenario.configuration.sparplan.length} Einträge</p>
        </div>
      </div>
    </div>
  )
}

function ScenarioCard({ scenario, onImport }: ScenarioCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <ScenarioCardHeader scenario={scenario} />
      <ScenarioCardContent
        scenario={scenario}
        showDetails={showDetails}
        onShowDetails={setShowDetails}
        onImport={onImport}
      />
    </Card>
  )
}

function ScenarioCardHeader({ scenario }: { scenario: PredefinedScenario }) {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <CardTitle className="text-lg">{scenario.name}</CardTitle>
          <CardDescription className="mt-2">{scenario.description}</CardDescription>
        </div>
        <Badge variant="secondary" className="ml-2 shrink-0">
          {getCategoryDisplayName(scenario.category)}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {scenario.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </CardHeader>
  )
}

function ScenarioCardContent({
  scenario,
  showDetails,
  onShowDetails,
  onImport,
}: {
  scenario: PredefinedScenario
  showDetails: boolean
  onShowDetails: (show: boolean) => void
  onImport: () => void
}) {
  return (
    <CardContent className="space-y-3">
      <Dialog open={showDetails} onOpenChange={onShowDetails}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full" size="sm">
            <Info className="h-4 w-4 mr-2" />
            Details anzeigen
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{scenario.name}</DialogTitle>
            <DialogDescription>{scenario.description}</DialogDescription>
          </DialogHeader>
          <ScenarioDetailsContent scenario={scenario} />
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onShowDetails(false)}>
              Schließen
            </Button>
            <Button
              onClick={() => {
                onImport()
                onShowDetails(false)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Szenario übernehmen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button onClick={onImport} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Szenario übernehmen
      </Button>
    </CardContent>
  )
}

interface CategoryFilterProps {
  selectedCategory: ScenarioCategory | 'all'
  onSelectCategory: (category: ScenarioCategory | 'all') => void
}

function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const categories: Array<ScenarioCategory | 'all'> = ['all', ...getAllCategories()]

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(category)}
        >
          {category === 'all' ? 'Alle' : getCategoryDisplayName(category)}
        </Button>
      ))}
    </div>
  )
}

interface ScenarioLibraryProps {
  onImportScenario: (configuration: ExtendedSavedConfiguration, scenarioName: string) => void
}

function IntroductionSection() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-2 text-blue-900">
        💡 Was ist die Szenario-Bibliothek?
      </h3>
      <p className="text-sm text-blue-800 leading-relaxed">
        Die Szenario-Bibliothek bietet vordefinierte, realistische Finanzplanungs-Szenarien für
        verschiedene Lebenssituationen. Jedes Szenario enthält passende Sparraten,
        Renditeerwartungen und Anlagehorizonte. Nutzen Sie diese als Ausgangspunkt für Ihre eigene
        Planung oder zum Vergleich mit Ihrer aktuellen Situation.
      </p>
    </div>
  )
}

function NoResultsMessage({
  searchQuery,
  selectedCategory,
  onReset,
}: {
  searchQuery: string
  selectedCategory: ScenarioCategory | 'all'
  onReset: () => void
}) {
  return (
    <div className="text-center py-12 text-gray-500">
      <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p className="text-sm">
        Keine Szenarien gefunden für &quot;{searchQuery}&quot; in{' '}
        {selectedCategory === 'all' ? 'allen Kategorien' : getCategoryDisplayName(selectedCategory)}
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
        Filter zurücksetzen
      </Button>
    </div>
  )
}

export function ScenarioLibrary({ onImportScenario }: ScenarioLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  const elementRef = useNavigationItem({
    id: 'scenario-library',
    title: 'Szenario-Bibliothek',
    icon: '📚',
  })

  const filteredScenarios = useMemo(() => {
    let scenarios = getPredefinedScenarios()

    if (selectedCategory !== 'all') {
      scenarios = getScenariosByCategory(selectedCategory)
    }

    if (searchQuery.trim()) {
      scenarios = searchScenarios(searchQuery).filter((s) =>
        selectedCategory === 'all' ? true : s.category === selectedCategory,
      )
    }

    return scenarios
  }, [selectedCategory, searchQuery])

  const handleImportScenario = (scenario: PredefinedScenario) => {
    onImportScenario(scenario.configuration, scenario.name)
    setImportSuccess(scenario.name)
    setTimeout(() => setImportSuccess(null), 3000)
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card ref={elementRef} id="scenario-library">
        <ScenarioLibraryHeader filteredScenarios={filteredScenarios} isExpanded={isExpanded} />
        <CollapsibleContent>
          <ScenarioLibraryContent
            importSuccess={importSuccess}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            filteredScenarios={filteredScenarios}
            onImportScenario={handleImportScenario}
          />
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function ScenarioLibraryHeader({
  filteredScenarios,
  isExpanded,
}: {
  filteredScenarios: PredefinedScenario[]
  isExpanded: boolean
}) {
  return (
    <CollapsibleTrigger asChild>
      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Szenario-Bibliothek</CardTitle>
              <CardDescription>Vordefinierte Lebensszenarien zum direkten Import</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredScenarios.length} Szenarien</Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>
    </CollapsibleTrigger>
  )
}

function ScenarioLibraryContent({
  importSuccess,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filteredScenarios,
  onImportScenario,
}: {
  importSuccess: string | null
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCategory: ScenarioCategory | 'all'
  onCategoryChange: (category: ScenarioCategory | 'all') => void
  filteredScenarios: PredefinedScenario[]
  onImportScenario: (scenario: PredefinedScenario) => void
}) {
  return (
    <CardContent className="space-y-6">
      {importSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ Szenario &quot;{importSuccess}&quot; erfolgreich übernommen!
          </p>
        </div>
      )}

      <IntroductionSection />

      <ScenarioSearchSection searchQuery={searchQuery} onSearchChange={onSearchChange} />

      <div className="space-y-2">
        <Label>Nach Kategorie filtern</Label>
        <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={onCategoryChange} />
      </div>

      <ScenarioGridSection
        filteredScenarios={filteredScenarios}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onImportScenario={onImportScenario}
        onReset={() => {
          onSearchChange('')
          onCategoryChange('all')
        }}
      />
    </CardContent>
  )
}

function ScenarioSearchSection({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="scenario-search">Nach Szenario suchen</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id="scenario-search"
          placeholder="z.B. Berufsanfänger, Familie, DINK..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  )
}

function ScenarioGridSection({
  filteredScenarios,
  searchQuery,
  selectedCategory,
  onImportScenario,
  onReset,
}: {
  filteredScenarios: PredefinedScenario[]
  searchQuery: string
  selectedCategory: ScenarioCategory | 'all'
  onImportScenario: (scenario: PredefinedScenario) => void
  onReset: () => void
}) {
  if (filteredScenarios.length === 0) {
    return (
      <NoResultsMessage searchQuery={searchQuery} selectedCategory={selectedCategory} onReset={onReset} />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredScenarios.map((scenario) => (
        <ScenarioCard key={scenario.id} scenario={scenario} onImport={() => onImportScenario(scenario)} />
      ))}
    </div>
  )
}
