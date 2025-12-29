import { lazy } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useNestingLevel } from '../../lib/nesting-utils'
import { NestingProvider } from '../../lib/nesting-context'
import { ConfigurationSection } from './ConfigurationSection'
import type { SensitivityAnalysisConfig } from '../../utils/sensitivity-analysis'
import type { ReturnConfiguration } from '../../utils/random-returns'

const DataExport = lazy(() => import('../DataExport'))
const SensitivityAnalysisDisplay = lazy(() => import('../SensitivityAnalysisDisplay'))
const ProfileManagement = lazy(() => import('../ProfileManagement'))

interface AnalysisToolsCategoryProps {
  sensitivityConfig: SensitivityAnalysisConfig
  returnConfig: ReturnConfiguration
  hasSimulationData: boolean
}

/**
 * Analysis & Tools Category
 * Groups data export, sensitivity analysis, and profile management tools
 */
export function AnalysisToolsCategory({
  sensitivityConfig,
  returnConfig,
  hasSimulationData,
}: AnalysisToolsCategoryProps) {
  const nestingLevel = useNestingLevel()

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={nestingLevel}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">📊 Analysen & Werkzeuge</CardTitle>
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
                <ConfigurationSection Component={DataExport} />
                <ConfigurationSection
                  Component={SensitivityAnalysisDisplay}
                  componentProps={{ config: sensitivityConfig, returnConfig }}
                  condition={hasSimulationData}
                />
                <ConfigurationSection Component={ProfileManagement} />
              </div>
            </NestingProvider>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
