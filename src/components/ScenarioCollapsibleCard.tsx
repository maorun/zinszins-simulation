import type { RefObject } from 'react'
import { Card, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'
import { GlossaryTerm } from './GlossaryTerm'
import type { FinancialScenario } from '../data/scenarios'
import { ScenarioSelectorContent } from './ScenarioSelectorContent'

interface ScenarioCollapsibleCardProps {
  navigationRef: RefObject<HTMLDivElement | null>
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  onScenarioClick: (scenario: FinancialScenario) => void
}

/**
 * Collapsible card component for ScenarioSelector
 */
export function ScenarioCollapsibleCard({
  navigationRef,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onScenarioClick,
}: ScenarioCollapsibleCardProps) {
  return (
    <Collapsible>
      <Card ref={navigationRef}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                💡 Was-wäre-wenn <GlossaryTerm term="szenario" showIcon />
              </CardTitle>
              <ChevronDown className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <ScenarioSelectorContent
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onClearSearch={onClearSearch}
            onScenarioClick={onScenarioClick}
          />
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
