import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { NestingProvider } from '../../lib/nesting-context'
import { useNestingLevel } from '../../lib/nesting-utils'
import SimulationConfiguration from '../SimulationConfiguration'
import TimeRangeConfiguration from '../TimeRangeConfiguration'
import { BenchmarkConfiguration } from '../BenchmarkConfiguration'
import { useSimulation } from '../../contexts/useSimulation'

/**
 * Grundeinstellungen (Basic Settings) Category
 * Groups simulation configuration, time range, and benchmark comparison
 */
export function GrundeinstellungenCategory() {
  const { benchmarkConfig, setBenchmarkConfig } = useSimulation()
  const nestingLevel = useNestingLevel()

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={nestingLevel}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">📊 Grundeinstellungen</CardTitle>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <NestingProvider level={nestingLevel}>
              <div className="space-y-4">
                <SimulationConfiguration />
                <TimeRangeConfiguration />
                <BenchmarkConfiguration
                  benchmarkConfig={benchmarkConfig}
                  onBenchmarkConfigChange={setBenchmarkConfig}
                  nestingLevel={nestingLevel + 1}
                />
              </div>
            </NestingProvider>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
