import { InfoBox } from './InfoBox'
import { EnableDisableToggle } from './EnableDisableToggle'
import { WarningBox } from './WarningBox'
import { EnabledEventConfig } from './EnabledEventConfig'
import type { BlackSwanEvent, BlackSwanEventId } from '../../../helpers/black-swan-events'

interface BlackSwanContentProps {
  isEnabled: boolean
  selectedEvent: BlackSwanEvent | null
  selectedEventId: BlackSwanEventId | 'none'
  eventYear: number
  cumulativeImpact: number | null
  availableEvents: BlackSwanEvent[]
  simulationStartYear: number
  enabledRadioId: string
  disabledRadioId: string
  eventYearSliderId: string
  handleEnabledChange: (enabled: boolean) => void
  handleEventChange: (eventId: BlackSwanEventId) => void
  handleYearChange: (year: number) => void
  formatPercent: (value: number) => string
}

/**
 * Content area for Black Swan event configuration
 */
export function BlackSwanContent(props: BlackSwanContentProps) {
  return (
    <div className="space-y-6">
      <InfoBox />

      <EnableDisableToggle
        isEnabled={props.isEnabled}
        onEnabledChange={props.handleEnabledChange}
        enabledRadioId={props.enabledRadioId}
        disabledRadioId={props.disabledRadioId}
      />

      {props.isEnabled && (
        <EnabledEventConfig
          selectedEvent={props.selectedEvent}
          selectedEventId={props.selectedEventId}
          eventYear={props.eventYear}
          cumulativeImpact={props.cumulativeImpact}
          availableEvents={props.availableEvents}
          simulationStartYear={props.simulationStartYear}
          eventYearSliderId={props.eventYearSliderId}
          handleEventChange={props.handleEventChange}
          handleYearChange={props.handleYearChange}
          formatPercent={props.formatPercent}
        />
      )}

      <WarningBox />
    </div>
  )
}
