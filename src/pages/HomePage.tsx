import { useEffect, useMemo, useRef } from 'react'
import { Button } from '../components/ui/button'
import ProfileManagement from '../components/ProfileManagement'
import DataExport from '../components/DataExport'
import SensitivityAnalysisDisplay from '../components/SensitivityAnalysisDisplay'
import Header from '../components/Header'
import SimulationModeSelector from '../components/SimulationModeSelector'
import SimulationParameters from '../components/SimulationParameters'
import { SpecialEvents } from '../components/SpecialEvents'
import { StickyOverview } from '../components/StickyOverview'
import { StickyBottomOverview } from '../components/StickyBottomOverview'
import { GlobalPlanningConfiguration } from '../components/GlobalPlanningConfiguration'
import FinancialGoalsConfiguration from '../components/FinancialGoalsConfiguration'
import ScenarioSelector from '../components/ScenarioSelector'
import { SavingsPhaseSection } from '../components/overview/SavingsPhaseSection'
import { WithdrawalPhaseSection } from '../components/overview/WithdrawalPhaseSection'

import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'
import { useSimulation } from '../contexts/useSimulation'
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary'
import { calculateWithdrawalEndYear } from '../utils/overview-calculations'
import { convertSparplanToElements } from '../utils/sparplan-utils'
import { useScenarioApplication } from '../hooks/useScenarioApplication'
import { useReturnConfiguration } from '../hooks/useReturnConfiguration'
import { calculatePhaseDateRanges } from '../utils/phase-date-ranges'

function EnhancedOverview() {
  const {
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    withdrawalConfig,
    endOfLife,
  } = useSimulation()

  const enhancedSummary = useMemo(() => {
    return getEnhancedOverviewSummary(
      simulationData,
      startEnd,
      withdrawalResults,
      rendite,
      steuerlast,
      teilfreistellungsquote,
      withdrawalConfig,
      endOfLife,
    )
  }, [
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    withdrawalConfig,
    endOfLife,
  ])

  if (!enhancedSummary || !simulationData) return null

  const savingsStartYear = Math.min(
    ...simulationData.sparplanElements.map(el =>
      new Date(el.start).getFullYear(),
    ),
  )
  const savingsEndYear = startEnd[0]

  // Calculate proper withdrawal end year using utility function
  const withdrawalEndYear = calculateWithdrawalEndYear(
    enhancedSummary,
    endOfLife,
    startEnd[1],
  )

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <h3 className="bg-gradient-to-r from-slate-700 to-slate-600 text-white m-0 p-4 sm:p-6 text-lg sm:text-xl font-bold text-center tracking-tight">
        🎯 Finanzübersicht - Schnelle Eckpunkte
      </h3>
      <SavingsPhaseSection
        savingsStartYear={savingsStartYear}
        savingsEndYear={savingsEndYear}
        enhancedSummary={enhancedSummary}
      />
      <WithdrawalPhaseSection
        withdrawalStartYear={startEnd[0] + 1}
        withdrawalEndYear={withdrawalEndYear}
        enhancedSummary={enhancedSummary}
      />
    </div>
  )
}

const HomePageContent = () => {
  const {
    sparplan,
    setSparplan,
    setSparplanElemente,
    sparplanElemente,
    startEnd,
    setStartEnd,
    simulationAnnual,
    performSimulation,
    simulationData,
    isLoading,
    endOfLife,
    steuerlast,
    setSteuerlast,
    teilfreistellungsquote,
    setTeilfreistellungsquote,
    freibetragPerYear,
    setFreibetragPerYear,
    steuerReduzierenEndkapitalSparphase,
    rendite,
    setRendite,
    returnMode,
    setReturnMode,
    averageReturn,
    setAverageReturn,
    standardDeviation,
    setStandardDeviation,
    randomSeed,
    variableReturns,
    historicalIndex,
    multiAssetConfig,
    inflationAktivSparphase,
    setInflationAktivSparphase,
    inflationsrateSparphase,
    setInflationsrateSparphase,
    inflationAnwendungSparphase,
  } = useSimulation()

  const overviewRef = useRef<HTMLDivElement>(null)

  // Handle scenario application using custom hook
  const { handleApplyScenario } = useScenarioApplication({
    setStartEnd,
    setReturnMode,
    setRendite,
    setAverageReturn,
    setStandardDeviation,
    setSteuerlast,
    setTeilfreistellungsquote,
    setFreibetragPerYear,
    setInflationAktivSparphase,
    setInflationsrateSparphase,
    setSparplan,
    performSimulation,
  })

  // Build ReturnConfiguration using custom hook
  const returnConfig = useReturnConfiguration({
    returnMode,
    rendite,
    averageReturn,
    standardDeviation,
    randomSeed,
    variableReturns,
    historicalIndex,
    multiAssetConfig,
  })

  useEffect(() => {
    performSimulation()
  }, [performSimulation])

  // Calculate phase date ranges for special events
  const { savingsStartYear, savingsEndYear, withdrawalStartYear, withdrawalEndYear }
    = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

  useEffect(() => {
    performSimulation()
  }, [performSimulation])

  return (
    <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-3xl lg:px-6 lg:max-w-5xl xl:max-w-7xl space-y-4">
      <Header />

      <Button
        onClick={() => {
          setSparplanElemente(
            convertSparplanToElements(sparplan, startEnd, simulationAnnual),
          )
          performSimulation()
        }}
        className="mb-3 sm:mb-4 w-full"
        variant="default"
      >
        🔄 Neu berechnen
      </Button>

      {simulationData && (
        <div
          ref={overviewRef}
          className="my-3 sm:my-4"
        >
          <EnhancedOverview />
        </div>
      )}

      <SimulationParameters />

      {/* Global Planning Configuration - Available for all calculations including Vorabpauschale */}
      <GlobalPlanningConfiguration startOfIndependence={startEnd[0]} />

      {/* Financial Goals Configuration */}
      <FinancialGoalsConfiguration />

      <ProfileManagement />

      <ScenarioSelector onApplyScenario={handleApplyScenario} />

      <SpecialEvents
        dispatch={(updatedSparplan) => {
          setSparplan(updatedSparplan)
          setSparplanElemente(convertSparplanToElements(updatedSparplan, startEnd, simulationAnnual))
        }}
        simulationAnnual={simulationAnnual}
        currentSparplans={sparplan}
        savingsStartYear={savingsStartYear}
        savingsEndYear={savingsEndYear}
        withdrawalStartYear={withdrawalStartYear}
        withdrawalEndYear={withdrawalEndYear}
      />

      <SimulationModeSelector />

      <DataExport />

      {/* Sensitivity Analysis */}
      {simulationData && sparplanElemente && sparplanElemente.length > 0 && (
        <SensitivityAnalysisDisplay
          config={{
            startYear: startEnd[0],
            endYear: startEnd[1],
            elements: sparplanElemente,
            steuerlast: steuerlast / 100,
            teilfreistellungsquote: teilfreistellungsquote / 100,
            simulationAnnual,
            freibetragPerYear,
            steuerReduzierenEndkapital: steuerReduzierenEndkapitalSparphase,
            inflationAktivSparphase,
            inflationsrateSparphase,
            inflationAnwendungSparphase,
          }}
          returnConfig={returnConfig}
        />
      )}

      {/* Sticky Overviews */}
      <StickyOverview
        overviewElementRef={overviewRef}
      />
      <StickyBottomOverview
        overviewElementRef={overviewRef}
      />

      {isLoading && <div className="text-center py-8 text-lg text-gray-600">⏳ Berechnung läuft...</div>}

      <footer className="mt-8 py-6 text-center bg-gray-50 border-t border-gray-200 text-gray-600 text-sm">
        <div>💼 Zinseszins-Simulation</div>
        <div>📧 by Marco</div>
        <div>🚀 Erstellt mit React, TypeScript & shadcn/ui</div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <SimulationProvider>
      <NavigationProvider>
        <HomePageContent />
      </NavigationProvider>
    </SimulationProvider>
  )
}
