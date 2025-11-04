import { CardHeader, CardTitle } from './ui/card'
import { CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'

export function GlobalPlanningCardHeader() {
  return (
    <CardHeader>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
          <CardTitle className="text-lg font-semibold text-blue-800">
            👥 Globale Planung (Einzelperson/Ehepaar)
          </CardTitle>
          <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
    </CardHeader>
  )
}
