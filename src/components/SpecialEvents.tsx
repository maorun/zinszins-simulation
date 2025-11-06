import type { Sparplan } from '../utils/sparplan-utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useNavigationItem } from '../hooks/useNavigationItem'
import { EventsList } from './special-events/EventsList'
import { SpecialEventForm } from './special-events/SpecialEventForm'
import { useSpecialEvents } from '../hooks/useSpecialEvents'

interface SpecialEventsProps {
  dispatch: (val: Sparplan[]) => void
  currentSparplans?: Sparplan[]
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

export function SpecialEvents({
  dispatch,
  currentSparplans = [],
  savingsStartYear,
  savingsEndYear,
  withdrawalStartYear,
  withdrawalEndYear,
}: SpecialEventsProps) {
  const { specialEventFormValues, setSpecialEventFormValues, handleSubmit, handleDeleteSparplan } = useSpecialEvents(
    currentSparplans,
    dispatch,
  )

  const navigationRef = useNavigationItem({
    id: 'special-events',
    title: 'Sonderereignisse verwalten',
    icon: '🎯',
    level: 0,
  })

  return (
    <Card nestingLevel={0} className="mb-6" ref={navigationRef}>
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={0}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left text-lg">🎯 Sonderereignisse verwalten</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={0} className="pt-0">
            <p className="mb-4 text-gray-600 text-sm">
              Verwalten Sie besondere Ereignisse wie Erbschaften oder größere Ausgaben für beide Lebensphasen
            </p>
            <SpecialEventForm
              formValues={specialEventFormValues}
              onFormChange={setSpecialEventFormValues}
              onSubmit={handleSubmit}
              savingsStartYear={savingsStartYear}
              savingsEndYear={savingsEndYear}
              withdrawalStartYear={withdrawalStartYear}
              withdrawalEndYear={withdrawalEndYear}
            />
            <EventsList sparplans={currentSparplans} onDelete={handleDeleteSparplan} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
