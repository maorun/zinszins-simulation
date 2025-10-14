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

import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'
import { useSimulation } from '../contexts/useSimulation'
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary'
import { convertSparplanToElements } from '../utils/sparplan-utils'
import { useScenarioApplication } from '../hooks/useScenarioApplication'

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

  // Calculate proper withdrawal end year (same logic as StickyBottomOverview)
  let withdrawalEndYear = endOfLife || startEnd[1] // Use global end of life or fall back to startEnd[1]

  // If we have segmented withdrawal, use the actual end year from segments
  if (enhancedSummary.isSegmentedWithdrawal
    && enhancedSummary.withdrawalSegments
    && enhancedSummary.withdrawalSegments.length > 0) {
    // Find the latest end year from all segments
    const segmentEndYears = enhancedSummary.withdrawalSegments
      .map(segment => segment.endYear)
      .filter(year => typeof year === 'number' && !isNaN(year))

    if (segmentEndYears.length > 0) {
      withdrawalEndYear = Math.max(...segmentEndYears)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <h3 className="bg-gradient-to-r from-slate-700 to-slate-600 text-white m-0 p-4 sm:p-6 text-lg sm:text-xl font-bold text-center tracking-tight">
        🎯 Finanzübersicht - Schnelle Eckpunkte
      </h3>
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h4 className="m-0 mb-3 sm:mb-4 text-slate-700 text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
          📈 Ansparphase (
          {savingsStartYear}
          {' '}
          -
          {' '}
          {savingsEndYear}
          )
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
            <span className="font-medium text-gray-700 text-sm">💰 Gesamte Einzahlungen</span>
            <span className="font-bold text-slate-700 text-right text-sm sm:text-base">
              {enhancedSummary.startkapital.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
          </div>
          <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
            <span className="font-medium text-gray-700 text-sm">🎯 Endkapital Ansparphase</span>
            <span className="font-bold text-green-600 text-base sm:text-lg text-right">
              {enhancedSummary.endkapital.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
          </div>
          <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
            <span className="font-medium text-gray-700 text-sm">📊 Gesamtzinsen Ansparphase</span>
            <span className="font-bold text-slate-700 text-right text-sm sm:text-base">
              {enhancedSummary.zinsen.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
          </div>
          <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
            <span className="font-medium text-gray-700 text-sm">📈 Rendite Ansparphase</span>
            <span className="font-bold text-slate-700 text-right text-sm sm:text-base">
              {enhancedSummary.renditeAnsparphase.toFixed(2)}
              % p.a.
            </span>
          </div>
        </div>
      </div>
      {enhancedSummary.endkapitalEntspharphase !== undefined && (
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h4 className="m-0 mb-3 sm:mb-4 text-slate-700 text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
            💸 Entsparphase (
            {startEnd[0] + 1}
            {' '}
            -
            {' '}
            {withdrawalEndYear}
            )
            {enhancedSummary.isSegmentedWithdrawal
              && enhancedSummary.withdrawalSegments
              && enhancedSummary.withdrawalSegments.length > 1 && (
              <span className="text-sm text-cyan-600 font-normal">
                {' '}
                -
                {enhancedSummary.withdrawalSegments.length}
                {' '}
                Phasen
              </span>
            )}
          </h4>

          {enhancedSummary.isSegmentedWithdrawal
            && enhancedSummary.withdrawalSegments
            && enhancedSummary.withdrawalSegments.length > 1
            ? (
          // Display segmented withdrawal phases
                <div className="flex flex-col gap-3 sm:gap-4">
                  {enhancedSummary.withdrawalSegments.map(segment => (
                    <div
                      key={segment.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 border-l-4 border-l-cyan-600"
                    >
                      <h5 className="m-0 mb-2.5 sm:mb-3 text-slate-700 text-sm sm:text-base font-semibold">
                        {segment.name}
                        {' '}
                        (
                        {segment.startYear}
                        {' '}
                        -
                        {segment.endYear}
                        ) -
                        {segment.strategy}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                          <span className="font-medium text-gray-700 text-sm">🏁 Startkapital</span>
                          <span className="font-bold text-slate-700 text-right text-sm sm:text-base">
                            {segment.startkapital.toLocaleString('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                          <span className="font-medium text-gray-700 text-sm">💰 Endkapital</span>
                          <span className="font-bold text-slate-700 text-right">
                            {segment.endkapital.toLocaleString('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                          <span className="font-medium text-gray-700 text-sm">💸 Entnahme gesamt</span>
                          <span className="font-bold text-slate-700 text-right">
                            {segment.totalWithdrawn.toLocaleString('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </span>
                        </div>
                        {segment.averageMonthlyWithdrawal > 0 && (
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                            <span className="font-medium text-gray-700 text-sm">💶 Monatlich Ø</span>
                            <span className="font-bold text-slate-700 text-right">
                              {segment.averageMonthlyWithdrawal.toLocaleString('de-DE', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Overall withdrawal summary */}
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4 border-l-4 border-l-green-600 bg-gradient-to-r from-gray-50 to-green-50">
                    <h5 className="m-0 mb-3 text-slate-700 text-base font-semibold">📊 Gesamt-Übersicht</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
                        <span className="font-medium text-gray-700 text-sm">🏁 Endkapital Gesamt</span>
                        <span className="font-bold text-slate-700 text-right">
                          {enhancedSummary.endkapitalEntspharphase.toLocaleString(
                            'de-DE',
                            { style: 'currency', currency: 'EUR' },
                          )}
                        </span>
                      </div>
                      {enhancedSummary.monatlicheAuszahlung && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
                          <span className="font-medium text-gray-700 text-sm">💶 Letzte Monatl. Auszahlung</span>
                          <span className="font-bold text-cyan-600 text-lg text-right">
                            {enhancedSummary.monatlicheAuszahlung.toLocaleString(
                              'de-DE',
                              { style: 'currency', currency: 'EUR' },
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
          // Display single withdrawal phase (original format)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                    <span className="font-medium text-gray-700 text-sm">🏁 Endkapital Entsparphase</span>
                    <span className="font-bold text-slate-700 text-right">
                      {enhancedSummary.endkapitalEntspharphase.toLocaleString(
                        'de-DE',
                        { style: 'currency', currency: 'EUR' },
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
                    <span className="font-medium text-gray-700 text-sm">💶 Monatliche Auszahlung</span>
                    <span className="font-bold text-cyan-600 text-lg text-right">
                      {(enhancedSummary.monatlicheAuszahlung || 0).toLocaleString(
                        'de-DE',
                        { style: 'currency', currency: 'EUR' },
                      )}
                    </span>
                  </div>
                </div>
              )}
        </div>
      )}
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

  // Build ReturnConfiguration from context properties
  const returnConfig = useMemo(() => {
    const config: import('../utils/random-returns').ReturnConfiguration = { mode: returnMode }

    switch (returnMode) {
      case 'fixed':
        config.fixedRate = rendite / 100
        break
      case 'random':
        config.randomConfig = {
          averageReturn: averageReturn / 100,
          standardDeviation: standardDeviation / 100,
          seed: randomSeed,
        }
        break
      case 'variable':
        config.variableConfig = {
          yearlyReturns: variableReturns,
        }
        break
      case 'historical':
        config.historicalConfig = {
          indexId: historicalIndex,
        }
        break
      case 'multiasset':
        config.multiAssetConfig = multiAssetConfig
        break
    }

    return config
  }, [
    returnMode,
    rendite,
    averageReturn,
    standardDeviation,
    randomSeed,
    variableReturns,
    historicalIndex,
    multiAssetConfig,
  ])

  useEffect(() => {
    performSimulation()
  }, [performSimulation])

  // Calculate phase date ranges for special events
  const savingsStartYear = sparplan.length > 0
    ? Math.min(...sparplan.map(p => new Date(p.start).getFullYear()))
    : new Date().getFullYear()
  const savingsEndYear = startEnd[0]
  const withdrawalStartYear = startEnd[0] + 1
  const withdrawalEndYear = endOfLife

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
