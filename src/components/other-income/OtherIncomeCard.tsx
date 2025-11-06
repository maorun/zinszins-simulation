import { type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'

interface OtherIncomeCardProps {
  children: ReactNode
}

export function OtherIncomeCard({ children }: OtherIncomeCardProps) {
  return (
    <Card className="mb-6">
      <Collapsible defaultOpen={false}>
        <CardHeader className="pb-4">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">💰 Andere Einkünfte</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
