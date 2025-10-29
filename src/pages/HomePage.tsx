import { useRef } from 'react'
import { SpecialEvents } from '../components/SpecialEvents'
import { StickyOverview } from '../components/StickyOverview'
import { StickyBottomOverview } from '../components/StickyBottomOverview'
import { HomePageHeaderSection } from '../components/HomePageHeaderSection'
import { HomePageAnalysisSection } from '../components/HomePageAnalysisSection'
import { SavingsPhaseSection } from '../components/overview/SavingsPhaseSection'
import { WithdrawalPhaseSection } from '../components/overview/WithdrawalPhaseSection'

import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'
import { useSimulation } from '../contexts/useSimulation'
import { useScenarioApplication } from '../hooks/useScenarioApplication'
import { useReturnConfiguration } from '../hooks/useReturnConfiguration'
import { useOverviewYearRanges } from '../hooks/useOverviewYearRanges'
import { useHomePageRecalculation } from '../hooks/useHomePageRecalculation'
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

  const { enhancedSummary, savingsStartYear, savingsEndYear, withdrawalEndYear }
    = useOverviewYearRanges(
      simulationData,
      startEnd,
      withdrawalResults,
      rendite,
      steuerlast,
      teilfreistellungsquote,
      withdrawalConfig,
      endOfLife,
    )

  if (!enhancedSummary || !simulationData) return null

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

// eslint-disable-next-line max-lines-per-function -- Large component render function
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

  // Handle recalculation logic
  const { handleRecalculate, handleSpecialEventsDispatch }
    = useHomePageRecalculation(
      sparplan,
      startEnd,
      simulationAnnual,
      setSparplanElemente,
      performSimulation,
    )

  // Calculate phase date ranges for special events
  const { savingsStartYear, savingsEndYear, withdrawalStartYear, withdrawalEndYear }
    = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

  return (
    <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-3xl lg:px-6 lg:max-w-5xl xl:max-w-7xl space-y-4">
      <HomePageHeaderSection
        handleRecalculate={handleRecalculate}
        handleApplyScenario={handleApplyScenario}
        startOfIndependence={startEnd[0]}
      />

      {simulationData && (
        <div
          ref={overviewRef}
          className="my-3 sm:my-4"
        >
          <EnhancedOverview />
        </div>
      )}

      <SpecialEvents
        dispatch={(updatedSparplan) => {
          setSparplan(updatedSparplan)
          handleSpecialEventsDispatch(updatedSparplan)
        }}
        currentSparplans={sparplan}
        savingsStartYear={savingsStartYear}
        savingsEndYear={savingsEndYear}
        withdrawalStartYear={withdrawalStartYear}
        withdrawalEndYear={withdrawalEndYear}
      />

      <HomePageAnalysisSection
        simulationData={simulationData}
        sparplanElemente={sparplanElemente}
        startEnd={startEnd}
        steuerlast={steuerlast}
        teilfreistellungsquote={teilfreistellungsquote}
        simulationAnnual={simulationAnnual}
        freibetragPerYear={freibetragPerYear}
        steuerReduzierenEndkapitalSparphase={steuerReduzierenEndkapitalSparphase}
        inflationAktivSparphase={inflationAktivSparphase}
        inflationsrateSparphase={inflationsrateSparphase}
        inflationAnwendungSparphase={inflationAnwendungSparphase}
        returnConfig={returnConfig}
      />

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
