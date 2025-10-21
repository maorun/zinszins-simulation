import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { createDefaultWithdrawalSegment, type WithdrawalSegment } from '../utils/segmented-withdrawal'
import { WithdrawalSegmentForm } from './WithdrawalSegmentForm'
import { useNestingLevel } from '../lib/nesting-utils'
import type { SegmentedComparisonStrategy } from '../utils/config-storage'

interface SegmentedComparisonConfigurationProps {
  segmentedComparisonStrategies: SegmentedComparisonStrategy[]
  withdrawalStartYear: number
  withdrawalEndYear: number
  onAddStrategy: (strategy: SegmentedComparisonStrategy) => void
  onUpdateStrategy: (strategyId: string, updates: Partial<SegmentedComparisonStrategy>) => void
  onRemoveStrategy: (strategyId: string) => void
}

/**
 * Component to render individual strategy card
 */
function StrategyCardHeader({
  strategy,
  nestingLevel,
  onUpdateName,
  onRemove,
}: {
  strategy: SegmentedComparisonStrategy
  nestingLevel: number
  onUpdateName: (id: string, name: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <CardHeader nestingLevel={nestingLevel + 1}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Label htmlFor={`strategy-name-${strategy.id}`}>Konfigurationsname</Label>
          <Input
            id={`strategy-name-${strategy.id}`}
            value={strategy.name}
            onChange={e => onUpdateName(strategy.id, e.target.value)}
            className="mt-1"
            placeholder="z.B. Konservativ-Aggressiv"
          />
        </div>
        <Button
          onClick={() => onRemove(strategy.id)}
          variant="ghost"
          size="sm"
          className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
          aria-label="Konfiguration löschen"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  )
}

function StrategyCardContent({
  strategy,
  nestingLevel,
  withdrawalStartYear,
  withdrawalEndYear,
  onUpdateSegments,
}: {
  strategy: SegmentedComparisonStrategy
  nestingLevel: number
  withdrawalStartYear: number
  withdrawalEndYear: number
  onUpdateSegments: (id: string, segments: WithdrawalSegment[]) => void
}) {
  return (
    <CardContent nestingLevel={nestingLevel + 1}>
      <div className="space-y-4">
        <Separator />
        <div>
          <Label className="text-sm font-medium">
            Phasen konfigurieren ({strategy.segments.length} Phase{strategy.segments.length !== 1 ? 'n' : ''})
          </Label>
          <div className="mt-2">
            <WithdrawalSegmentForm
              segments={strategy.segments}
              onSegmentsChange={segments => onUpdateSegments(strategy.id, segments)}
              withdrawalStartYear={withdrawalStartYear}
              withdrawalEndYear={withdrawalEndYear}
            />
          </div>
        </div>
      </div>
    </CardContent>
  )
}

function StrategyCard({
  strategy,
  nestingLevel,
  withdrawalStartYear,
  withdrawalEndYear,
  onUpdateName,
  onUpdateSegments,
  onRemove,
}: {
  strategy: SegmentedComparisonStrategy
  nestingLevel: number
  withdrawalStartYear: number
  withdrawalEndYear: number
  onUpdateName: (id: string, name: string) => void
  onUpdateSegments: (id: string, segments: WithdrawalSegment[]) => void
  onRemove: (id: string) => void
}) {
  return (
    <Card key={strategy.id} nestingLevel={nestingLevel + 1} className="border-2">
      <StrategyCardHeader strategy={strategy} nestingLevel={nestingLevel} onUpdateName={onUpdateName} onRemove={onRemove} />
      <StrategyCardContent
        strategy={strategy}
        nestingLevel={nestingLevel}
        withdrawalStartYear={withdrawalStartYear}
        withdrawalEndYear={withdrawalEndYear}
        onUpdateSegments={onUpdateSegments}
      />
    </Card>
  )
}

export function SegmentedComparisonConfiguration({
  segmentedComparisonStrategies = [],
  withdrawalStartYear,
  withdrawalEndYear,
  onAddStrategy,
  onUpdateStrategy,
  onRemoveStrategy,
}: SegmentedComparisonConfigurationProps) {
  const nestingLevel = useNestingLevel()

  // Add a new segmented comparison strategy
  const handleAddStrategy = () => {
    const newId = `segmented_strategy_${Date.now()}`
    const defaultSegment = createDefaultWithdrawalSegment(
      'main',
      'Hauptphase',
      withdrawalStartYear,
      withdrawalEndYear,
    )

    const newStrategy: SegmentedComparisonStrategy = {
      id: newId,
      name: `Konfiguration ${segmentedComparisonStrategies.length + 1}`,
      segments: [defaultSegment],
    }

    onAddStrategy(newStrategy)
  }

  // Update strategy name
  const handleUpdateStrategyName = (strategyId: string, name: string) => {
    onUpdateStrategy(strategyId, { name })
  }

  // Update strategy segments
  const handleUpdateStrategySegments = (strategyId: string, segments: WithdrawalSegment[]) => {
    onUpdateStrategy(strategyId, { segments })
  }

  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0"
            asChild
          >
            <CardHeader nestingLevel={nestingLevel} className="cursor-pointer hover:bg-gray-50/50">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  🔄 Geteilte Phasen Vergleich
                </CardTitle>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium mb-2">Geteilte Phasen Vergleich</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Erstelle und vergleiche verschiedene Konfigurationen von geteilten Entnahme-Phasen.
                  Jede Konfiguration kann mehrere Phasen mit unterschiedlichen Strategien enthalten.
                </p>

                <Button
                  onClick={handleAddStrategy}
                  className="mb-4"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Konfiguration hinzufügen
                </Button>
              </div>

              {segmentedComparisonStrategies.length === 0
                ? (
                    <Card nestingLevel={nestingLevel + 1}>
                      <CardContent nestingLevel={nestingLevel + 1} className="pt-6">
                        <p className="text-center text-muted-foreground">
                          Noch keine Vergleichskonfigurationen erstellt.
                          Klicke auf "Neue Konfiguration hinzufügen", um zu beginnen.
                        </p>
                      </CardContent>
                    </Card>
                  )
                : (
                    <div className="space-y-4">
                      {segmentedComparisonStrategies.map(strategy => (
                        <StrategyCard
                          key={strategy.id}
                          strategy={strategy}
                          nestingLevel={nestingLevel}
                          withdrawalStartYear={withdrawalStartYear}
                          withdrawalEndYear={withdrawalEndYear}
                          onUpdateName={handleUpdateStrategyName}
                          onUpdateSegments={handleUpdateStrategySegments}
                          onRemove={onRemoveStrategy}
                        />
                      ))}
                    </div>
                  )}

              {segmentedComparisonStrategies.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">💡 Hinweise zum Vergleich</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Jede Konfiguration kann verschiedene Phasen mit unterschiedlichen Strategien haben</li>
                    <li>• Der Vergleich zeigt Endkapital, Gesamtentnahme und Laufzeit für jede Konfiguration</li>
                    <li>• Alle Konfigurationen verwenden das gleiche Startkapital aus der Ansparphase</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
