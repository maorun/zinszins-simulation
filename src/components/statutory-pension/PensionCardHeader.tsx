import { CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'

interface PensionCardHeaderProps {
  nestingLevel: number
}

export function PensionCardHeader({ nestingLevel }: PensionCardHeaderProps) {
  return (
    <CollapsibleTrigger asChild>
      <Button variant="ghost" className="w-full justify-between p-0" asChild>
        <CardHeader nestingLevel={nestingLevel} className="cursor-pointer hover:bg-gray-50/50">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2">🏛️ Gesetzliche Renten-Konfiguration</CardTitle>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </CardHeader>
      </Button>
    </CollapsibleTrigger>
  )
}
