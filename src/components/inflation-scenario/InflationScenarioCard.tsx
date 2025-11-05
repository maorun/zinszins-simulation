import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { InflationScenarioContent } from './InflationScenarioContent'
import type { InflationScenario, InflationScenarioId } from '../../../helpers/inflation-scenarios'

interface InflationScenarioCardProps {
  isEnabled: boolean
  selectedScenarioId: InflationScenarioId | 'none'
  scenarioYear: number
  availableScenarios: InflationScenario[]
  selectedScenario: InflationScenario | null
  cumulativeInflation: number | null
  averageInflation: number | null
  purchasingPowerImpact: number | null
  scenarioColors: { bg: string, text: string }
  enabledRadioId: string
  disabledRadioId: string
  scenarioYearSliderId: string
  simulationStartYear: number
  handleEnabledChange: (value: string) => void
  handleScenarioChange: (scenarioId: InflationScenarioId) => void
  handleYearChange: (year: number) => void
}

/**
 * Main card component for inflation scenario configuration
 */
export const InflationScenarioCard = (props: InflationScenarioCardProps) => {
  return (
    <Collapsible>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                🌡️ Inflationsszenarien
              </CardTitle>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            <InflationScenarioContent {...props} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
