import { useCallback } from 'react'
import { applyBlackSwanEvent, type BlackSwanEvent, type BlackSwanEventId } from '../../../helpers/black-swan-events'

/**
 * Helper function to apply event and trigger callback
 */
function applyEventChange(
  year: number,
  event: BlackSwanEvent,
  callback?: (eventReturns: Record<number, number> | null, eventName?: string) => void,
) {
  const eventReturns = applyBlackSwanEvent(year, event)
  callback?.(eventReturns, event.name)
}

interface UseBlackSwanHandlersProps {
  isEnabled: boolean
  selectedEvent: BlackSwanEvent | null
  eventYear: number
  availableEvents: BlackSwanEvent[]
  setIsEnabled: (enabled: boolean) => void
  setSelectedEventId: (id: BlackSwanEventId | 'none') => void
  setEventYear: (year: number) => void
  onEventChange?: (eventReturns: Record<number, number> | null, eventName?: string) => void
}

/**
 * Custom hook to manage Black Swan event handlers
 */
export function useBlackSwanHandlers({
  isEnabled,
  selectedEvent,
  eventYear,
  availableEvents,
  setIsEnabled,
  setSelectedEventId,
  setEventYear,
  onEventChange,
}: UseBlackSwanHandlersProps) {
  const handleEnabledChange = useCallback(
    (enabled: boolean) => {
      setIsEnabled(enabled)
      if (!enabled) {
        onEventChange?.(null, '')
      } else if (selectedEvent) {
        applyEventChange(eventYear, selectedEvent, onEventChange)
      }
    },
    [selectedEvent, eventYear, onEventChange, setIsEnabled],
  )

  const handleEventChange = useCallback(
    (eventId: BlackSwanEventId) => {
      setSelectedEventId(eventId)
      const event = availableEvents.find(e => e.id === eventId)
      if (event && isEnabled) {
        applyEventChange(eventYear, event, onEventChange)
      }
    },
    [availableEvents, isEnabled, eventYear, onEventChange, setSelectedEventId],
  )

  const handleYearChange = useCallback(
    (year: number) => {
      setEventYear(year)
      if (selectedEvent && isEnabled) {
        applyEventChange(year, selectedEvent, onEventChange)
      }
    },
    [selectedEvent, isEnabled, onEventChange, setEventYear],
  )

  return {
    handleEnabledChange,
    handleEventChange,
    handleYearChange,
  }
}
