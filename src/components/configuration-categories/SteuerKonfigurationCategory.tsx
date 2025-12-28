import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { NestingProvider } from '../../lib/nesting-context'
import { useNestingLevel } from '../../lib/nesting-utils'
import TaxConfiguration from '../TaxConfiguration'

interface SteuerKonfigurationCategoryProps {
  planningMode?: 'individual' | 'couple'
}

/**
 * Steuer-Konfiguration (Tax Configuration) Category
 * Groups all tax-related configurations
 */
export function SteuerKonfigurationCategory({ planningMode = 'individual' }: SteuerKonfigurationCategoryProps) {
  const nestingLevel = useNestingLevel()

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={nestingLevel}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">💰 Steuer-Konfiguration</CardTitle>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <NestingProvider level={nestingLevel}>
              <TaxConfiguration planningMode={planningMode} />
            </NestingProvider>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
