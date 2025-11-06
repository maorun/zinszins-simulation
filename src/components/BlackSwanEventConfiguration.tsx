import { Card, CardHeader, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { BlackSwanHeader } from './black-swan/BlackSwanHeader'
import { BlackSwanContent } from './black-swan/BlackSwanContent'
import { useBlackSwanConfig } from './black-swan/useBlackSwanConfig'

interface BlackSwanEventConfigurationProps {
  onEventChange?: (eventReturns: Record<number, number> | null, eventName?: string) => void
  simulationStartYear: number
}

/**
 * Black Swan Event Configuration Component
 * Allows users to simulate extreme market events (crashes) in their portfolio
 */
const BlackSwanEventConfiguration = ({ onEventChange, simulationStartYear }: BlackSwanEventConfigurationProps) => {
  const config = useBlackSwanConfig({ simulationStartYear, onEventChange })

  return (
    <Card className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <BlackSwanHeader
              isEnabled={config.isEnabled}
              selectedEvent={config.selectedEvent}
              eventYear={config.eventYear}
            />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <BlackSwanContent
              isEnabled={config.isEnabled}
              selectedEvent={config.selectedEvent}
              selectedEventId={config.selectedEventId}
              eventYear={config.eventYear}
              cumulativeImpact={config.cumulativeImpact}
              availableEvents={config.availableEvents}
              simulationStartYear={simulationStartYear}
              enabledRadioId={config.enabledRadioId}
              disabledRadioId={config.disabledRadioId}
              eventYearSliderId={config.eventYearSliderId}
              handleEnabledChange={config.handleEnabledChange}
              handleEventChange={config.handleEventChange}
              handleYearChange={config.handleYearChange}
              formatPercent={config.formatPercent}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default BlackSwanEventConfiguration
