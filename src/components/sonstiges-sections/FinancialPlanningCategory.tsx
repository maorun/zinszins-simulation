import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useNestingLevel } from '../../lib/nesting-utils'
import { NestingProvider } from '../../lib/nesting-context'
import { PlanningConfigurations } from './PlanningConfigurations'

interface FinancialPlanningCategoryProps {
  startOfIndependence: number
}

/**
 * Financial Planning Category
 * Groups all financial planning and lifestyle configuration components
 */
export function FinancialPlanningCategory({ startOfIndependence }: FinancialPlanningCategoryProps) {
  const nestingLevel = useNestingLevel()

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={nestingLevel}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">💼 Finanzplanung & Lebenssituationen</CardTitle>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <NestingProvider level={nestingLevel}>
              <PlanningConfigurations startOfIndependence={startOfIndependence} />
            </NestingProvider>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
