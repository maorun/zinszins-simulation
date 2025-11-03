import { CardHeader, CardTitle } from './ui/card'
import { CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'

/**
 * Collapsible header for SavedSparplansList
 * Displays title with expand/collapse trigger
 */
export function SavedSparplansListHeader() {
  return (
    <CardHeader className="pb-4">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
          <CardTitle className="text-left text-lg">
            📋 Gespeicherte Sparpläne & Einmalzahlungen
          </CardTitle>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>
      </CollapsibleTrigger>
    </CardHeader>
  )
}
