import type { BlackSwanEvent } from '../../../helpers/black-swan-events'

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
            Jahr {year}: {formatPercent(returnRate)}
          </li>
        )
      })}
    </ul>
  )
}

function EventDescription({ description }: { description: string }) {
  return (
    <p>
      <strong>Beschreibung:</strong> {description}
    </p>
  )
}

function EventDuration({ duration }: { duration: number }) {
  return (
    <p>
      <strong>Dauer:</strong> {duration} {duration === 1 ? 'Jahr' : 'Jahre'}
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
      <strong>Kumulativer Verlust:</strong>{' '}
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
      <strong>Historische Erholungszeit:</strong> ca. {recoveryYears} Jahre
    </p>
  )
}

interface EventDetailsProps {
  event: BlackSwanEvent
  eventYear: number
  cumulativeImpact: number | null
  formatPercent: (value: number) => string
}

/**
 * Displays detailed information about a selected Black Swan event
 */
export function EventDetails({ event, eventYear, cumulativeImpact, formatPercent }: EventDetailsProps) {
  const years = Object.keys(event.yearlyReturns)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <h5 className="font-semibold text-red-900 mb-2">📉 Ereignis-Details</h5>
      <div className="space-y-2 text-sm">
        <EventDescription description={event.description} />
        <EventDuration duration={event.duration} />
        <p>
          <strong>Jährliche Renditen:</strong>
        </p>
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
