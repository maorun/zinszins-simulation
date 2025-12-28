import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { NestingProvider } from '../lib/nesting-context'
import { useSimulation } from '../contexts/useSimulation'
import { useNavigationItem } from '../hooks/useNavigationItem'
import { GrundeinstellungenCategory } from './configuration-categories/GrundeinstellungenCategory'
import { SteuerKonfigurationCategory } from './configuration-categories/SteuerKonfigurationCategory'

const SimulationParameters = () => {
  const { planningMode } = useSimulation()
  const navigationRef = useNavigationItem({
    id: 'configuration',
    title: 'Konfiguration',
    icon: '⚙️',
    level: 0,
  })

  return (
    <Card nestingLevel={0} className="mb-4" ref={navigationRef}>
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={0}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">⚙️ Konfiguration</CardTitle>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={0}>
            <NestingProvider level={0}>
              <div className="space-y-4">
                <GrundeinstellungenCategory />
                <SteuerKonfigurationCategory planningMode={planningMode} />
              </div>
            </NestingProvider>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default SimulationParameters
