import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import type { BlackSwanEvent, BlackSwanEventId } from '../../../helpers/black-swan-events'

interface EventSelectorProps {
  selectedEventId: BlackSwanEventId | 'none'
  availableEvents: BlackSwanEvent[]
  onEventChange: (eventId: BlackSwanEventId) => void
}

/**
 * Selector for choosing which Black Swan event to simulate
 */
export function EventSelector({ selectedEventId, availableEvents, onEventChange }: EventSelectorProps) {
  const handleValueChange = (value: string) => {
    onEventChange(value as BlackSwanEventId)
  }

  return (
    <div className="space-y-3">
      <Label>Ereignis auswählen</Label>
      <RadioGroup value={selectedEventId} onValueChange={handleValueChange}>
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
  )
}
