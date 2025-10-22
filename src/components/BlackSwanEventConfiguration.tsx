import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Slider } from './ui/slider'
import {
  getAvailableBlackSwanEvents,
  applyBlackSwanEvent,
  calculateCumulativeImpact,
  type BlackSwanEventId,
  type BlackSwanEvent,
} from '../../helpers/black-swan-events'
import { generateFormId } from '../utils/unique-id'

interface BlackSwanEventConfigurationProps {
  onEventChange?: (eventReturns: Record<number, number> | null, eventName?: string) => void
  simulationStartYear: number
}

/**
 * Component to display detailed event information
 */
/**
 * Renders yearly returns list for an event
 */
function YearlyReturnsList({
  years,
  eventYear,
  yearlyReturns,
  formatPercent,
}: {
  years: number[]
  eventYear: number
  yearlyReturns: Record<number, number>
  formatPercent: (value: number) => string
}) {
  return (
    <ul className="list-disc list-inside ml-4">
      {years.map((offset) => {
        const year = eventYear + offset
        const returnRate = yearlyReturns[offset]
        return (
          <li key={offset} className={returnRate < 0 ? 'text-red-700 font-medium' : 'text-green-700'}>
            Jahr
            {' '}
            {year}
            :
            {' '}
            {formatPercent(returnRate)}
          </li>
        )
      })}
    </ul>
  )
}

function EventDescription({ description }: { description: string }) {
  return (
    <p>
      <strong>Beschreibung:</strong>
      {' '}
      {description}
    </p>
  )
}

function EventDuration({ duration }: { duration: number }) {
  return (
    <p>
      <strong>Dauer:</strong>
      {' '}
      {duration}
      {' '}
      {duration === 1 ? 'Jahr' : 'Jahre'}
    </p>
  )
}

function CumulativeImpactDisplay({
  cumulativeImpact,
  formatPercent,
}: {
  cumulativeImpact: number | null
  formatPercent: (value: number) => string
}) {
  if (cumulativeImpact === null) {
    return null
  }

  return (
    <p className="mt-2 pt-2 border-t border-red-300">
      <strong>Kumulativer Verlust:</strong>
      {' '}
      <span className="text-red-700 font-semibold">{formatPercent(cumulativeImpact)}</span>
    </p>
  )
}

function RecoveryTimeDisplay({ recoveryYears }: { recoveryYears?: number }) {
  if (!recoveryYears) {
    return null
  }

  return (
    <p className="text-gray-600">
      <strong>Historische Erholungszeit:</strong>
      {' '}
      ca.
      {' '}
      {recoveryYears}
      {' '}
      Jahre
    </p>
  )
}

function EventDetails({
  event,
  eventYear,
  cumulativeImpact,
  formatPercent,
}: {
  event: BlackSwanEvent
  eventYear: number
  cumulativeImpact: number | null
  formatPercent: (value: number) => string
}) {
  const years = Object.keys(event.yearlyReturns).map(Number).sort((a, b) => a - b)

  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <h5 className="font-semibold text-red-900 mb-2">📉 Ereignis-Details</h5>
      <div className="space-y-2 text-sm">
        <EventDescription description={event.description} />
        <EventDuration duration={event.duration} />
        <p><strong>Jährliche Renditen:</strong></p>
        <YearlyReturnsList
          years={years}
          eventYear={eventYear}
          yearlyReturns={event.yearlyReturns}
          formatPercent={formatPercent}
        />
        <CumulativeImpactDisplay cumulativeImpact={cumulativeImpact} formatPercent={formatPercent} />
        <RecoveryTimeDisplay recoveryYears={event.recoveryYears} />
      </div>
    </div>
  )
}

/**
 * Black Swan Event Configuration Component
 * Allows users to simulate extreme market events (crashes) in their portfolio
 */
const BlackSwanEventConfiguration = ({
  onEventChange,
  simulationStartYear,
}: BlackSwanEventConfigurationProps) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<BlackSwanEventId | 'none'>('none')
  const [eventYear, setEventYear] = useState(simulationStartYear + 5)

  // Generate stable IDs for form elements
  const enabledRadioId = useMemo(() => generateFormId('black-swan', 'enabled'), [])
  const disabledRadioId = useMemo(() => generateFormId('black-swan', 'disabled'), [])
  const eventYearSliderId = useMemo(() => generateFormId('black-swan', 'event-year'), [])

  const availableEvents = useMemo(() => getAvailableBlackSwanEvents(), [])

  const selectedEvent = useMemo(() => {
    if (selectedEventId === 'none')
      return null
    return availableEvents.find(e => e.id === selectedEventId) || null
  }, [selectedEventId, availableEvents])

  const cumulativeImpact = useMemo(() => {
    if (!selectedEvent)
      return null
    return calculateCumulativeImpact(selectedEvent)
  }, [selectedEvent])

  const handleEnabledChange = (value: string) => {
    const enabled = value === 'enabled'
    setIsEnabled(enabled)

    if (!enabled) {
      onEventChange?.(null, '')
    }
    else if (selectedEvent) {
      const eventReturns = applyBlackSwanEvent(eventYear, selectedEvent)
      onEventChange?.(eventReturns, selectedEvent.name)
    }
  }

  const handleEventChange = (eventId: BlackSwanEventId) => {
    setSelectedEventId(eventId)
    const event = availableEvents.find(e => e.id === eventId)

    if (event && isEnabled) {
      const eventReturns = applyBlackSwanEvent(eventYear, event)
      onEventChange?.(eventReturns, event.name)
    }
  }

  const handleYearChange = (year: number) => {
    setEventYear(year)

    if (selectedEvent && isEnabled) {
      const eventReturns = applyBlackSwanEvent(year, selectedEvent)
      onEventChange?.(eventReturns, selectedEvent.name)
    }
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  const renderEventDetails = (event: BlackSwanEvent) => (
    <EventDetails
      event={event}
      eventYear={eventYear}
      cumulativeImpact={cumulativeImpact}
      formatPercent={formatPercent}
    />
  )

  return (
    <Card className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left flex items-center gap-2">
                🦢 Black Swan Ereignisse
                {isEnabled && selectedEvent && (
                  <span className="text-sm font-normal text-red-600">
                    (
                    {selectedEvent.name}
                    {' '}
                    ab
                    {' '}
                    {eventYear}
                    )
                  </span>
                )}
              </CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-6">
              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">ℹ️ Was sind Black Swan Ereignisse?</h5>
                <p className="text-sm text-gray-700 mb-2">
                  Black Swan Ereignisse sind extreme, seltene Markteinbrüche wie die Dotcom-Blase (2000-2003),
                  die Finanzkrise (2008-2009) oder die COVID-19 Pandemie (2020). Diese Szenarien helfen Ihnen,
                  die Widerstandsfähigkeit Ihres Portfolios in Krisenzeiten zu testen.
                </p>
                <p className="text-sm text-blue-800 font-medium">
                  💡 Hinweis: Black Swan Ereignisse funktionieren am besten mit dem "Variable Renditen" Modus.
                  Wechseln Sie zur Rendite-Konfiguration und wählen Sie "Variable Renditen", um Black Swan
                  Szenarien in die Simulation zu integrieren.
                </p>
              </div>

              {/* Enable/Disable */}
              <div className="space-y-3">
                <Label>Black Swan Szenario aktivieren</Label>
                <RadioGroup value={isEnabled ? 'enabled' : 'disabled'} onValueChange={handleEnabledChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="disabled" id={disabledRadioId} />
                    <Label htmlFor={disabledRadioId} className="font-normal cursor-pointer">
                      Deaktiviert (Standard Monte Carlo)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="enabled" id={enabledRadioId} />
                    <Label htmlFor={enabledRadioId} className="font-normal cursor-pointer">
                      Aktiviert (Black Swan Szenario anwenden)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Event Selection */}
              {isEnabled && (
                <>
                  <div className="space-y-3">
                    <Label>Ereignis auswählen</Label>
                    <RadioGroup
                      value={selectedEventId}
                      onValueChange={value => handleEventChange(value as BlackSwanEventId)}
                    >
                      {availableEvents.map(event => (
                        <div key={event.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={event.id} id={`event-${event.id}`} />
                          <Label htmlFor={`event-${event.id}`} className="font-normal cursor-pointer">
                            {event.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Event Year Selection */}
                  <div className="space-y-3">
                    <Label htmlFor={eventYearSliderId}>
                      Jahr des Ereignisses:
                      {' '}
                      <strong>{eventYear}</strong>
                    </Label>
                    <Slider
                      id={eventYearSliderId}
                      value={[eventYear]}
                      onValueChange={([value]) => handleYearChange(value)}
                      min={simulationStartYear}
                      max={simulationStartYear + 30}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{simulationStartYear}</span>
                      <span>{simulationStartYear + 30}</span>
                    </div>
                  </div>

                  {/* Event Details */}
                  {selectedEvent && renderEventDetails(selectedEvent)}
                </>
              )}

              {/* Warning */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h6 className="font-semibold mb-2 text-yellow-900">⚠️ Wichtiger Hinweis</h6>
                <p className="text-sm text-gray-700">
                  Black Swan Ereignisse sind per Definition selten und extrem. Diese Szenarien dienen
                  ausschließlich zur Stresstestung Ihres Portfolios und sollten nicht als
                  Vorhersage zukünftiger Marktentwicklungen verstanden werden.
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default BlackSwanEventConfiguration
