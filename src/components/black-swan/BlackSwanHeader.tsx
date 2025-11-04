import { CardTitle } from '../ui/card'
import { ChevronDown } from 'lucide-react'
import type { BlackSwanEvent } from '../../../helpers/black-swan-events'

interface BlackSwanHeaderProps {
  isEnabled: boolean
  selectedEvent: BlackSwanEvent | null
  eventYear: number
}

/**
 * Header for Black Swan event configuration with status indicator
 */
export function BlackSwanHeader({ isEnabled, selectedEvent, eventYear }: BlackSwanHeaderProps) {
  return (
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
  )
}
