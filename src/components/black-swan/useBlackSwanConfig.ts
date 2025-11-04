import { useState, useMemo } from 'react'
import {
  getAvailableBlackSwanEvents,
  calculateCumulativeImpact,
  type BlackSwanEventId,
} from '../../../helpers/black-swan-events'
import { generateFormId } from '../../utils/unique-id'
import { useBlackSwanHandlers } from './useBlackSwanHandlers'

interface UseBlackSwanConfigProps {
  simulationStartYear: number
  onEventChange?: (eventReturns: Record<number, number> | null, eventName?: string) => void
}

/**
 * Custom hook to manage Black Swan event configuration state and logic
 */
export function useBlackSwanConfig({
  simulationStartYear,
  onEventChange,
}: UseBlackSwanConfigProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<BlackSwanEventId | 'none'>('none')
  const [eventYear, setEventYear] = useState(simulationStartYear + 5)

  const availableEvents = useMemo(() => getAvailableBlackSwanEvents(), [])
  const selectedEvent = useMemo(
    () => (selectedEventId === 'none' ? null : availableEvents.find(e => e.id === selectedEventId) || null),
    [selectedEventId, availableEvents],
  )
  const cumulativeImpact = useMemo(
    () => (selectedEvent ? calculateCumulativeImpact(selectedEvent) : null),
    [selectedEvent],
  )

  const handlers = useBlackSwanHandlers({
    isEnabled,
    selectedEvent,
    eventYear,
    availableEvents,
    setIsEnabled,
    setSelectedEventId,
    setEventYear,
    onEventChange,
  })

  const formIds = useMemo(() => ({
    enabledRadioId: generateFormId('black-swan', 'enabled'),
    disabledRadioId: generateFormId('black-swan', 'disabled'),
    eventYearSliderId: generateFormId('black-swan', 'event-year'),
  }), [])

  return {
    isEnabled,
    selectedEventId,
    eventYear,
    selectedEvent,
    cumulativeImpact,
    availableEvents,
    ...formIds,
    ...handlers,
    formatPercent: (value: number) => `${(value * 100).toFixed(1)}%`,
  }
}
