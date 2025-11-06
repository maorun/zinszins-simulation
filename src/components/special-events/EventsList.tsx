import type { Sparplan } from '../../utils/sparplan-utils'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { EventCard } from './EventCard'

interface EventsListProps {
  sparplans: Sparplan[]
  onDelete: (id: number) => void
}

export function EventsList({ sparplans, onDelete }: EventsListProps) {
  const specialEvents = sparplans.filter((sparplan) => sparplan.eventType && sparplan.eventType !== 'normal')

  if (specialEvents.length === 0) {
    return null
  }

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={true}>
        <CardHeader nestingLevel={1}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left text-lg">📋 Gespeicherte Sonderereignisse</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1} className="pt-0">
            <div
              style={{
                padding: '1rem 1.5rem 0.5rem',
                color: '#666',
                fontSize: '0.9rem',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              Ihre konfigurierten Sonderereignisse für beide Lebensphasen
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {specialEvents.map((sparplan) => (
                <EventCard key={sparplan.id} sparplan={sparplan} onDelete={onDelete} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
