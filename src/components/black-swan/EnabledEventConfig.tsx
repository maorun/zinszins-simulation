import { EventSelector } from './EventSelector'
import { EventYearSlider } from './EventYearSlider'
import { EventDetails } from './EventDetails'
import type { BlackSwanEvent, BlackSwanEventId } from '../../../helpers/black-swan-events'

interface EnabledEventConfigProps {
  selectedEvent: BlackSwanEvent | null
  selectedEventId: BlackSwanEventId | 'none'
  eventYear: number
  cumulativeImpact: number | null
  availableEvents: BlackSwanEvent[]
  simulationStartYear: number
  eventYearSliderId: string
  handleEventChange: (eventId: BlackSwanEventId) => void
  handleYearChange: (year: number) => void
  formatPercent: (value: number) => string
}

/**
 * Configuration options shown when Black Swan is enabled
 */
export function EnabledEventConfig({
  selectedEvent,
  selectedEventId,
  eventYear,
  cumulativeImpact,
  availableEvents,
  simulationStartYear,
  eventYearSliderId,
  handleEventChange,
  handleYearChange,
  formatPercent,
}: EnabledEventConfigProps) {
  return (
    <>
      <EventSelector
        selectedEventId={selectedEventId}
        availableEvents={availableEvents}
        onEventChange={handleEventChange}
      />

      <EventYearSlider
        eventYear={eventYear}
        simulationStartYear={simulationStartYear}
        onYearChange={handleYearChange}
        eventYearSliderId={eventYearSliderId}
      />

      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          eventYear={eventYear}
          cumulativeImpact={cumulativeImpact}
          formatPercent={formatPercent}
        />
      )}
    </>
  )
}
