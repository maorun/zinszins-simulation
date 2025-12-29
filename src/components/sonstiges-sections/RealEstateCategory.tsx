import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useNestingLevel } from '../../lib/nesting-utils'
import { NestingProvider } from '../../lib/nesting-context'
import { RealEstateConfigurations } from './RealEstateConfigurations'

/**
 * Real Estate Category
 * Groups all real estate analysis and comparison components
 */
export function RealEstateCategory() {
  const nestingLevel = useNestingLevel()

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={nestingLevel}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">🏠 Immobilien-Analysen</CardTitle>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <NestingProvider level={nestingLevel}>
              <RealEstateConfigurations />
            </NestingProvider>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
