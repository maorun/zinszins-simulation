import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { SparenView } from './SparenView'
import { EntnahmeView } from './EntnahmeView'
import { SonstigesView } from './SonstigesView'
import type { FinancialScenario } from '../data/scenarios'

interface MainNavigationProps {
  handleApplyScenario: (scenario: FinancialScenario) => void
  startOfIndependence: number
  sensitivityConfig: {
    simulationData: unknown
    sparplanElemente: unknown
    returnConfig: unknown
  }
}

/**
 * Main Navigation Component with Sticky Tabs
 * Provides mobile-friendly and desktop-optimized navigation between main app sections
 */
export function MainNavigation({ handleApplyScenario, startOfIndependence, sensitivityConfig }: MainNavigationProps) {
  return (
    <div className="relative">
      {/* Sticky Navigation */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 mb-4">
        <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-3xl lg:px-6 lg:max-w-5xl xl:max-w-7xl">
          <Tabs defaultValue="sparen" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14">
              <TabsTrigger value="sparen" className="text-sm sm:text-base">
                💰 Sparen
              </TabsTrigger>
              <TabsTrigger value="entnahme" className="text-sm sm:text-base">
                🏦 Entnahme
              </TabsTrigger>
              <TabsTrigger value="sonstiges" className="text-sm sm:text-base">
                ⚙️ Sonstiges
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="sparen" forceMount className="data-[state=inactive]:hidden mt-4">
              <SparenView handleApplyScenario={handleApplyScenario} startOfIndependence={startOfIndependence} />
            </TabsContent>

            <TabsContent value="entnahme" forceMount className="data-[state=inactive]:hidden mt-4">
              <EntnahmeView />
            </TabsContent>

            <TabsContent value="sonstiges" forceMount className="data-[state=inactive]:hidden mt-4">
              <SonstigesView sensitivityConfig={sensitivityConfig} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
