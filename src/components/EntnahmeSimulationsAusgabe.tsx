import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Calculator } from 'lucide-react'

// No more temporary components needed!
import type { SparplanElement } from '../utils/sparplan-utils'
import type {
  WithdrawalStrategy,
  WithdrawalResult,
} from '../../helpers/withdrawal'
import type {
  HealthInsuranceType,
  StatutoryHealthInsuranceConfig,
  PrivateHealthInsuranceConfig,
} from '../../helpers/health-insurance'
import {
  defaultStatutoryHealthInsuranceConfig,
  defaultStatutoryHealthInsuranceConfigRetirement,
  defaultPrivateHealthInsuranceConfig,
} from '../../helpers/health-insurance'
import { createDefaultWithdrawalSegment } from '../utils/segmented-withdrawal'
import { WithdrawalSegmentForm } from './WithdrawalSegmentForm'
import { DynamicWithdrawalConfiguration } from './DynamicWithdrawalConfiguration'
import { RMDWithdrawalConfiguration } from './RMDWithdrawalConfiguration'
import { BucketStrategyConfiguration } from './BucketStrategyConfiguration'
import { KapitalerhaltConfiguration } from './KapitalerhaltConfiguration'
import { StatutoryPensionConfiguration } from './StatutoryPensionConfiguration'
import { HealthInsuranceConfiguration } from './HealthInsuranceConfiguration'
import { EntnahmeSimulationDisplay } from './EntnahmeSimulationDisplay'
import { SegmentedComparisonConfiguration } from './SegmentedComparisonConfiguration'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { useWithdrawalCalculations } from '../hooks/useWithdrawalCalculations'
import { useWithdrawalModals } from '../hooks/useWithdrawalModals'
import CalculationExplanationModal from './CalculationExplanationModal'
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal'
import { useSimulation } from '../contexts/useSimulation'
import type {
  WithdrawalReturnMode,
  ComparisonStrategy,
} from '../utils/config-storage'
import { calculateEndOfLifeYear, calculateCurrentAge, getDefaultLifeExpectancy } from '../../helpers/life-expectancy'
import { calculateJointLifeExpectancy } from '../../helpers/rmd-tables'

// Helper function for strategy display names
function getStrategyDisplayName(strategy: WithdrawalStrategy): string {
  switch (strategy) {
    case '4prozent':
      return '4% Regel'
    case '3prozent':
      return '3% Regel'
    case 'variabel_prozent':
      return 'Variable Prozent'
    case 'monatlich_fest':
      return 'Monatlich fest'
    case 'dynamisch':
      return 'Dynamische Strategie'
    case 'bucket_strategie':
      return 'Drei-Eimer-Strategie'
    case 'rmd':
      return 'RMD (Lebenserwartung)'
    case 'kapitalerhalt':
      return 'Kapitalerhalt / Ewige Rente'
    default:
      return strategy
  }
}

export function EntnahmeSimulationsAusgabe({
  startEnd,
  elemente,
  dispatchEnd,
  onWithdrawalResultsChange,
  steuerlast,
  teilfreistellungsquote,
}: {
  startEnd: [number, number]
  elemente: SparplanElement[]
  dispatchEnd: (val: [number, number]) => void
  onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void
  steuerlast: number
  teilfreistellungsquote: number
}) {
  const [startOfIndependence] = startEnd

  // Use custom hooks for state management
  const {
    currentConfig,
    updateConfig,
    updateFormValue,
    updateComparisonStrategy,
    updateSegmentedComparisonStrategy,
    addSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy,
  } = useWithdrawalConfig()

  const { withdrawalData, comparisonResults, segmentedComparisonResults = [] } = useWithdrawalCalculations(
    elemente,
    startOfIndependence,
    currentConfig,
    steuerlast,
    teilfreistellungsquote,
  )

  // Access global Grundfreibetrag configuration and End of Life settings
  const {
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    endOfLife: globalEndOfLife,
    lifeExpectancyTable,
    customLifeExpectancy,
    setEndOfLife,
    setLifeExpectancyTable,
    setCustomLifeExpectancy,
    birthYear,
    setBirthYear,
    expectedLifespan,
    setExpectedLifespan,
    useAutomaticCalculation,
    setUseAutomaticCalculation,
    // Gender and couple planning
    planningMode,
    setPlanningMode,
    gender,
    setGender,
    spouse,
    setSpouse,
  } = useSimulation()

  const {
    showCalculationModal,
    setShowCalculationModal,
    calculationDetails,
    showVorabpauschaleModal,
    setShowVorabpauschaleModal,
    selectedVorabDetails,
    handleCalculationInfoClick,
  } = useWithdrawalModals(
    currentConfig.formValue,
    currentConfig.useSegmentedWithdrawal,
    currentConfig.withdrawalSegments,
    withdrawalData,
    startOfIndependence,
    steuerlast,
    teilfreistellungsquote,
  )

  // Extract values from config for easier access
  const formValue = currentConfig.formValue
  const withdrawalReturnMode = currentConfig.withdrawalReturnMode
  const withdrawalVariableReturns = currentConfig.withdrawalVariableReturns
  const withdrawalAverageReturn = currentConfig.withdrawalAverageReturn
  const withdrawalStandardDeviation = currentConfig.withdrawalStandardDeviation
  const withdrawalRandomSeed = currentConfig.withdrawalRandomSeed
  const useSegmentedWithdrawal = currentConfig.useSegmentedWithdrawal
  const withdrawalSegments = currentConfig.withdrawalSegments
  const useComparisonMode = currentConfig.useComparisonMode
  const comparisonStrategies = currentConfig.comparisonStrategies
  const useSegmentedComparisonMode = currentConfig.useSegmentedComparisonMode
  const segmentedComparisonStrategies = currentConfig.segmentedComparisonStrategies

  // Notify parent component when withdrawal results change
  useEffect(() => {
    if (onWithdrawalResultsChange && withdrawalData) {
      onWithdrawalResultsChange(withdrawalData.withdrawalResult)
    }
  }, [withdrawalData, onWithdrawalResultsChange])

  // Update withdrawal segments when startOfIndependence changes (for segmented withdrawal)
  useEffect(() => {
    if (useSegmentedWithdrawal && withdrawalSegments.length > 0) {
      // Update the start year of the first segment to match the new savings end
      const updatedSegments = withdrawalSegments.map((segment, index) => {
        if (index === 0) {
          // Update the first segment to start at the new withdrawal start year
          return {
            ...segment,
            startYear: startOfIndependence + 1,
          }
        }
        return segment
      })

      // Only update if there's an actual change
      if (updatedSegments[0]?.startYear !== withdrawalSegments[0]?.startYear) {
        updateConfig({ withdrawalSegments: updatedSegments })
      }
    }
  }, [
    startOfIndependence,
    useSegmentedWithdrawal,
    withdrawalSegments,
    updateConfig,
  ])

  return (
    <>
      <Card className="mb-4">
        <Collapsible defaultOpen={false}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                <CardTitle className="text-left">Variablen</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {/* Global End of Life Configuration */}
              <Card className="mb-6">
                <Collapsible defaultOpen={false}>
                  <CardHeader>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                        <CardTitle className="text-lg font-semibold text-blue-800">Globale Konfiguration</CardTitle>
                        <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>

                      {/* Toggle between manual and automatic calculation */}
                      <div className="mb-6 p-3 border rounded-lg bg-white">
                        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <div className="space-y-1">
                            <Label htmlFor="calculation-mode" className="font-medium">Lebensende Berechnung</Label>
                            <p className="text-sm text-muted-foreground hidden sm:block">
                              Manuell für direkte Jahreseingabe, Automatisch für Geburtsjahr-basierte Berechnung
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm ${!useAutomaticCalculation ? 'font-medium' : 'text-muted-foreground'}`}>
                              Manuell
                            </span>
                            <Switch
                              id="calculation-mode"
                              checked={useAutomaticCalculation}
                              onCheckedChange={setUseAutomaticCalculation}
                            />
                            <span className={`text-sm ${useAutomaticCalculation ? 'font-medium' : 'text-muted-foreground'}`}>
                              Automatisch
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 sm:hidden">
                          Manuell für direkte Jahreseingabe, Automatisch für Geburtsjahr-basierte Berechnung
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* 1. End of Life Year Configuration */}
                        <div className="space-y-2">
                          <Label>Lebensende (Jahr)</Label>
                          <Input
                            type="number"
                            value={globalEndOfLife}
                            onChange={(e) => {
                              const value = e.target.value ? Number(e.target.value) : 2080
                              setEndOfLife(value)
                            }}
                            min={startOfIndependence + 1}
                            max={2150}
                            disabled={useAutomaticCalculation}
                          />
                          <div className="text-sm text-muted-foreground">
                            Das Jahr, in dem die Entnahmephase enden soll (z.B. 2080)
                          </div>

                          {/* Helper for calculating end of life year from birth year - only show when
                               automatic mode is enabled */}
                          {useAutomaticCalculation && (
                            <div className="p-3 bg-blue-50 rounded-lg space-y-3">
                              <div className="text-sm font-medium text-blue-900">Lebensende automatisch berechnen</div>

                              {planningMode === 'individual' ? (
                              // Individual Planning Mode
                                <>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label htmlFor="birth-year-eol" className="text-xs">Geburtsjahr</Label>
                                      <Input
                                        id="birth-year-eol"
                                        type="number"
                                        value={birthYear || ''}
                                        onChange={(e) => {
                                          const year = e.target.value ? Number(e.target.value) : undefined
                                          setBirthYear(year)
                                          // Auto-suggest life expectancy based on current age and gender
                                          if (year) {
                                            const currentAge = calculateCurrentAge(year)
                                            const suggestedLifespan = getDefaultLifeExpectancy(currentAge, gender)
                                            if (!expectedLifespan) {
                                              setExpectedLifespan(suggestedLifespan)
                                            }
                                          }
                                        }}
                                        placeholder="1974"
                                        min={1930}
                                        max={new Date().getFullYear() - 18}
                                        className="text-xs h-8"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label htmlFor="expected-lifespan" className="text-xs">Lebenserwartung (Alter)</Label>
                                      <Input
                                        id="expected-lifespan"
                                        type="number"
                                        value={expectedLifespan || 85}
                                        onChange={e => setExpectedLifespan(Number(e.target.value))}
                                        min={50}
                                        max={120}
                                        className="text-xs h-8"
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (birthYear && expectedLifespan) {
                                        const calculatedYear = calculateEndOfLifeYear(birthYear, expectedLifespan)
                                        setEndOfLife(Math.round(calculatedYear))
                                      }
                                    }}
                                    disabled={!birthYear || !expectedLifespan}
                                    className="w-full text-xs"
                                  >
                                    <Calculator className="h-3 w-3 mr-1" />
                                    Berechnen (
                                    {birthYear && expectedLifespan ? calculateEndOfLifeYear(birthYear, expectedLifespan) : '—'}
                                    )
                                  </Button>
                                  {birthYear && (
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div>
                                        Aktuelles Alter:
                                        {calculateCurrentAge(birthYear)}
                                        {' '}
                                        Jahre
                                      </div>
                                      {gender && (
                                        <div>
                                          Geschlechts-spezifische Lebenserwartung:
                                          {gender === 'male' ? ' ♂ Männlich (ca. 78 Jahre)' : ' ♀ Weiblich (ca. 83 Jahre)'}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              ) : (
                              // Couple Planning Mode
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium">
                                        Person 1 (
                                        {gender === 'male' ? '♂ Männlich' : '♀ Weiblich'}
                                        )
                                      </div>
                                      <div className="space-y-1">
                                        <Label htmlFor="birth-year-person1" className="text-xs">Geburtsjahr</Label>
                                        <Input
                                          id="birth-year-person1"
                                          type="number"
                                          value={birthYear || ''}
                                          onChange={(e) => {
                                            const year = e.target.value ? Number(e.target.value) : undefined
                                            setBirthYear(year)
                                          }}
                                          placeholder="1974"
                                          min={1930}
                                          max={new Date().getFullYear() - 18}
                                          className="text-xs h-8"
                                        />
                                      </div>
                                      {birthYear && (
                                        <div className="text-xs text-muted-foreground">
                                          Alter:
                                          {' '}
                                          {calculateCurrentAge(birthYear)}
                                          {' '}
                                          Jahre
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium">
                                        Person 2 (
                                        {spouse?.gender === 'male' ? '♂ Männlich' : '♀ Weiblich'}
                                        )
                                      </div>
                                      <div className="space-y-1">
                                        <Label htmlFor="birth-year-person2" className="text-xs">Geburtsjahr</Label>
                                        <Input
                                          id="birth-year-person2"
                                          type="number"
                                          value={spouse?.birthYear || ''}
                                          onChange={(e) => {
                                            const year = e.target.value ? Number(e.target.value) : undefined
                                            setSpouse({
                                              ...spouse,
                                              gender: spouse?.gender || 'female',
                                              birthYear: year,
                                            })
                                          }}
                                          placeholder="1976"
                                          min={1930}
                                          max={new Date().getFullYear() - 18}
                                          className="text-xs h-8"
                                        />
                                      </div>
                                      {spouse?.birthYear && (
                                        <div className="text-xs text-muted-foreground">
                                          Alter:
                                          {' '}
                                          {calculateCurrentAge(spouse.birthYear)}
                                          {' '}
                                          Jahre
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (birthYear && spouse?.birthYear && gender && spouse?.gender) {
                                        const age1 = calculateCurrentAge(birthYear)
                                        const age2 = calculateCurrentAge(spouse.birthYear)
                                        const jointLifeExpectancy = calculateJointLifeExpectancy(
                                          age1, age2, gender, spouse.gender,
                                        )

                                        // Use the older person's birth year + joint life expectancy
                                        const olderBirthYear = Math.min(birthYear, spouse.birthYear)
                                        const calculatedYear = calculateEndOfLifeYear(
                                          olderBirthYear, jointLifeExpectancy + calculateCurrentAge(olderBirthYear),
                                        )
                                        setEndOfLife(Math.round(calculatedYear))
                                      }
                                    }}
                                    disabled={!birthYear || !spouse?.birthYear}
                                    className="w-full text-xs"
                                  >
                                    <Calculator className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">Gemeinsame Lebenserwartung berechnen</span>
                                    <span className="sm:hidden">Berechnen</span>
                                    {birthYear && spouse?.birthYear && gender && spouse?.gender
                                      ? ` (${Math.round(calculateJointLifeExpectancy(
                                        calculateCurrentAge(birthYear),
                                        calculateCurrentAge(spouse.birthYear),
                                        gender,
                                        spouse.gender,
                                      ))} Jahre)`
                                      : ''}
                                  </Button>
                                  {birthYear && spouse?.birthYear && gender && spouse?.gender && (
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div>
                                        Gemeinsame Lebenserwartung:
                                        {Math.round(calculateJointLifeExpectancy(
                                          calculateCurrentAge(birthYear),
                                          calculateCurrentAge(spouse.birthYear),
                                          gender,
                                          spouse.gender,
                                        ))}
                                        {' '}
                                        Jahre (längerer überlebender Partner)
                                      </div>
                                      <div>
                                        Dies entspricht der Wahrscheinlichkeit, dass mindestens eine Person noch am
                                        Leben ist.
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 2. Planning Mode - moved up */}
                        <div className="space-y-2">
                          <Label>Planungsmodus</Label>
                          <RadioTileGroup
                            value={planningMode}
                            onValueChange={(value: string) => setPlanningMode(value as 'individual' | 'couple')}
                          >
                            <RadioTile value="individual" label="Einzelperson">
                              Planung für eine Person mit individueller Lebenserwartung
                            </RadioTile>
                            <RadioTile value="couple" label="Ehepaar/Partner">
                              Planung für zwei Personen mit gemeinsamer Lebenserwartung (längerer überlebender Partner)
                            </RadioTile>
                          </RadioTileGroup>
                        </div>

                        {/* 3. Gender Configuration - extracted and moved up */}
                        {planningMode === 'individual'
                          ? (
                              <div className="space-y-2">
                                <Label>Geschlecht für Lebenserwartung</Label>
                                <RadioTileGroup
                                  value={gender || ''}
                                  onValueChange={(value: string) => setGender(value as 'male' | 'female' | undefined)}
                                >
                                  <RadioTile value="male" label="Männlich">
                                    Verwende Lebenserwartung für Männer
                                  </RadioTile>
                                  <RadioTile value="female" label="Weiblich">
                                    Verwende Lebenserwartung für Frauen
                                  </RadioTile>
                                </RadioTileGroup>
                                {gender && (
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-blue-800 font-medium">
                                      ℹ️ Automatische Sterbetafel-Auswahl
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {gender === 'male'
                                        ? 'Es wird automatisch die deutsche Sterbetafel für Männer (2020-2022) verwendet. Die männliche Lebenserwartung liegt im Durchschnitt ca. 5 Jahre unter der weiblichen.'
                                        : 'Es wird automatisch die deutsche Sterbetafel für Frauen (2020-2022) verwendet. Die weibliche Lebenserwartung liegt im Durchschnitt ca. 5 Jahre über der männlichen.'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          : (
                              <div className="space-y-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-sm font-medium text-blue-900">Konfiguration für Ehepaar/Partner</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Person 1 - Geschlecht</Label>
                                    <RadioTileGroup
                                      value={gender || 'male'}
                                      onValueChange={(value: string) => setGender(value as 'male' | 'female')}
                                      idPrefix="person1"
                                    >
                                      <RadioTile value="male" label="Männlich">
                                        Verwende Lebenserwartung für Männer
                                      </RadioTile>
                                      <RadioTile value="female" label="Weiblich">
                                        Verwende Lebenserwartung für Frauen
                                      </RadioTile>
                                    </RadioTileGroup>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Person 2 - Geschlecht</Label>
                                    <RadioTileGroup
                                      value={spouse?.gender || 'female'}
                                      onValueChange={(value: string) => setSpouse({
                                        ...spouse,
                                        gender: value as 'male' | 'female',
                                      })}
                                      idPrefix="person2"
                                    >
                                      <RadioTile value="male" label="Männlich">
                                        Männlich
                                      </RadioTile>
                                      <RadioTile value="female" label="Weiblich">
                                        Weiblich
                                      </RadioTile>
                                    </RadioTileGroup>
                                  </div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <div className="text-sm text-blue-800 font-medium">
                                    ℹ️ Automatische Sterbetafel-Auswahl für Paare
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Es werden automatisch geschlechtsspezifische deutsche Sterbetafeln (2020-2022) für
                                    beide Partner verwendet.
                                    Die gemeinsame Lebenserwartung wird nach aktuariellen Methoden als "Joint Life
                                    Expectancy" berechnet.
                                  </div>
                                </div>
                              </div>
                            )}

                        {/* 4. Smart Data Source Configuration - simplified */}
                        <div className="space-y-2">
                          <Label>Datengrundlage für Lebenserwartung</Label>
                          {(planningMode === 'individual' && gender) || (planningMode === 'couple' && gender && spouse?.gender) ? (
                          // Smart mode: Gender is specified, auto-select appropriate table and only show custom option
                            <>
                              <RadioTileGroup
                                value={lifeExpectancyTable === 'custom' ? 'custom' : 'auto'}
                                onValueChange={(value: string) => {
                                  if (value === 'custom') {
                                    setLifeExpectancyTable('custom')
                                  }
                                  else {
                                    // Auto-select based on context
                                    if (planningMode === 'couple') {
                                      // For couples, we use gender-specific tables automatically
                                      setLifeExpectancyTable('german_2020_22') // The system will use gender-specific data
                                    }
                                    else {
                                      // For individuals, use gender-specific table
                                      setLifeExpectancyTable(gender === 'male' ? 'german_male_2020_22' : 'german_female_2020_22')
                                    }
                                  }
                                }}
                              >
                                <RadioTile value="auto" label="Automatische Auswahl">
                                  {planningMode === 'couple'
                                    ? 'Geschlechtsspezifische Sterbetafeln für beide Partner'
                                    : `Deutsche Sterbetafel für ${gender === 'male' ? 'Männer' : 'Frauen'}`}
                                </RadioTile>
                                <RadioTile value="custom" label="Benutzerdefiniert">
                                  Eigene Lebenserwartung eingeben
                                </RadioTile>
                              </RadioTileGroup>
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-800 font-medium">
                                  ℹ️ Automatische Sterbetafel-Auswahl
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {planningMode === 'couple'
                                    ? `Basierend auf den gewählten Geschlechtern (${gender === 'male' ? 'Männlich' : 'Weiblich'} und ${spouse?.gender === 'male' ? 'Männlich' : 'Weiblich'}) werden automatisch die entsprechenden deutschen Sterbetafeln (2020-2022) verwendet.`
                                    : `Basierend auf dem gewählten Geschlecht (${gender === 'male' ? 'Männlich' : 'Weiblich'}) wird automatisch die entsprechende deutsche Sterbetafel (2020-2022) verwendet.`}
                                </div>
                              </div>
                            </>
                          ) : (
                          // Manual mode: No gender specified, show neutral and custom options
                            <RadioTileGroup
                              value={lifeExpectancyTable}
                              onValueChange={(value: string) => setLifeExpectancyTable(value as 'german_2020_22' | 'custom')}
                            >
                              <RadioTile value="german_2020_22" label="Deutsche Sterbetafel (Durchschnitt)">
                                Offizielle Sterbetafel 2020-2022 vom Statistischen Bundesamt (geschlechtsneutral)
                              </RadioTile>
                              <RadioTile value="custom" label="Benutzerdefiniert">
                                Eigene Lebenserwartung eingeben
                              </RadioTile>
                            </RadioTileGroup>
                          )}

                          {lifeExpectancyTable === 'custom' && (
                            <div className="space-y-2 mt-2">
                              <Label>Lebenserwartung (Jahre)</Label>
                              <Input
                                type="number"
                                value={customLifeExpectancy || ''}
                                onChange={(e) => {
                                  const value = e.target.value ? Number(e.target.value) : undefined
                                  setCustomLifeExpectancy(value)
                                }}
                                min={1}
                                max={50}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Toggle between single, segmented, and comparison withdrawal */}
              <div className="mb-4 space-y-2">
                <Label>Entnahme-Modus</Label>
                <RadioTileGroup
                  value={
                    useSegmentedComparisonMode
                      ? 'segmented-comparison'
                      : useComparisonMode
                        ? 'comparison'
                        : useSegmentedWithdrawal
                          ? 'segmented'
                          : 'single'
                  }
                  onValueChange={(value: string) => {
                    const useComparison = value === 'comparison'
                    const useSegmented = value === 'segmented'
                    const useSegmentedComparison = value === 'segmented-comparison'

                    updateConfig({
                      useComparisonMode: useComparison,
                      useSegmentedWithdrawal: useSegmented,
                      useSegmentedComparisonMode: useSegmentedComparison,
                    })

                    // Initialize segments when switching to segmented mode
                    if (useSegmented && withdrawalSegments.length === 0) {
                      // Create initial segment covering only the first 15 years, leaving room for additional segments
                      const withdrawalStartYear = startOfIndependence + 1
                      // 15 years or until end of life
                      const initialSegmentEndYear = Math.min(withdrawalStartYear + 14, globalEndOfLife)
                      const defaultSegment = createDefaultWithdrawalSegment(
                        'main',
                        'Frühphase',
                        withdrawalStartYear,
                        initialSegmentEndYear,
                      )
                      updateConfig({ withdrawalSegments: [defaultSegment] })
                    }
                  }}
                >
                  <RadioTile value="single" label="Einheitliche Strategie">
                    Verwende eine einheitliche Strategie für die gesamte Entnahme-Phase
                  </RadioTile>
                  <RadioTile value="segmented" label="Geteilte Phasen">
                    Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf
                  </RadioTile>
                  <RadioTile value="comparison" label="Strategien-Vergleich">
                    Vergleiche verschiedene Entnahmestrategien miteinander
                  </RadioTile>
                  <RadioTile value="segmented-comparison" label="Geteilte Phasen Vergleich">
                    Vergleiche verschiedene geteilte Entnahme-Phasen miteinander
                  </RadioTile>
                </RadioTileGroup>
                <div className="text-sm text-muted-foreground mt-1">
                  {useSegmentedComparisonMode
                    ? 'Vergleiche verschiedene geteilte Entnahme-Phasen miteinander.'
                    : useComparisonMode
                      ? 'Vergleiche verschiedene Entnahmestrategien miteinander.'
                      : useSegmentedWithdrawal
                        ? 'Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf.'
                        : 'Verwende eine einheitliche Strategie für die gesamte Entnahme-Phase.'}
                </div>
              </div>

              {useSegmentedWithdrawal ? (
              /* Segmented withdrawal configuration */
                <WithdrawalSegmentForm
                  segments={withdrawalSegments}
                  onSegmentsChange={segments =>
                    updateConfig({ withdrawalSegments: segments })}
                  withdrawalStartYear={startOfIndependence + 1}
                  withdrawalEndYear={globalEndOfLife}
                />
              ) : useComparisonMode ? (
              /* Comparison mode configuration */
                <div>
                  <h4>Basis-Strategie (mit vollständigen Details)</h4>
                  <div>
                    {/* Strategy selector - for base strategy only */}
                    <div className="mb-4 space-y-2">
                      <Label>Basis-Strategie</Label>
                      <RadioTileGroup
                        value={formValue.strategie}
                        onValueChange={value =>
                          updateFormValue({ ...formValue, strategie: value as WithdrawalStrategy })}
                      >
                        <RadioTile value="4prozent" label="4% Regel">
                          4% Entnahme
                        </RadioTile>
                        <RadioTile value="3prozent" label="3% Regel">
                          3% Entnahme
                        </RadioTile>
                        <RadioTile value="variabel_prozent" label="Variable Prozent">
                          Anpassbare Entnahme
                        </RadioTile>
                        <RadioTile value="monatlich_fest" label="Monatlich fest">
                          Fester monatlicher Betrag
                        </RadioTile>
                        <RadioTile value="dynamisch" label="Dynamische Strategie">
                          Renditebasierte Anpassung
                        </RadioTile>
                        <RadioTile value="bucket_strategie" label="Drei-Eimer-Strategie">
                          Cash-Polster bei negativen Renditen
                        </RadioTile>
                        <RadioTile value="rmd" label="RMD (Lebenserwartung)">
                          Entnahme basierend auf Alter und Lebenserwartung
                        </RadioTile>
                        <RadioTile value="kapitalerhalt" label="Kapitalerhalt / Ewige Rente">
                          Reale Rendite für Kapitalerhalt
                        </RadioTile>
                      </RadioTileGroup>
                    </div>

                    {/* Withdrawal frequency configuration */}
                    <div className="mb-4 space-y-2">
                      <Label>Entnahme-Häufigkeit</Label>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-sm">Jährlich</span>
                        <Switch
                          checked={formValue.withdrawalFrequency === 'monthly'}
                          onCheckedChange={(checked) => {
                            updateFormValue({
                              withdrawalFrequency: checked ? 'monthly' : 'yearly',
                            })
                          }}
                        />
                        <span className="text-sm">Monatlich</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formValue.withdrawalFrequency === 'yearly'
                          ? 'Entnahme erfolgt einmal jährlich am Anfang des Jahres'
                          : 'Entnahme erfolgt monatlich - Portfolio hat mehr Zeit zu wachsen'}
                      </div>
                    </div>

                    {/* Fixed return rate for base strategy */}
                    <div className="mb-4 space-y-2">
                      <Label>
                        Rendite Basis-Strategie (%)
                      </Label>
                      <div className="space-y-2">
                        <Slider
                          value={[formValue.rendite]}
                          onValueChange={(values: number[]) => updateFormValue({ ...formValue, rendite: values[0] })}
                          min={0}
                          max={10}
                          step={0.5}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>0%</span>
                          <span className="font-medium text-gray-900">
                            {formValue.rendite}
                            %
                          </span>
                          <span>10%</span>
                        </div>
                      </div>
                    </div>

                    {/* Strategy-specific configuration for base strategy */}
                    {formValue.strategie === 'variabel_prozent' && (
                      <div className="mb-4 space-y-2">
                        <Label>
                          Entnahme-Prozentsatz (%)
                        </Label>
                        <div className="space-y-2">
                          <Slider
                            value={[formValue.variabelProzent]}
                            onValueChange={(values: number[]) =>
                              updateFormValue({ ...formValue, variabelProzent: values[0] })}
                            min={1}
                            max={10}
                            step={0.5}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>1%</span>
                            <span className="font-medium text-gray-900">
                              {formValue.variabelProzent}
                              %
                            </span>
                            <span>10%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {formValue.strategie === 'monatlich_fest' && (
                      <div className="mb-4 space-y-2">
                        <Label>Monatlicher Betrag (€)</Label>
                        <Input
                          type="number"
                          value={formValue.monatlicheBetrag}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : undefined
                            if (value) updateFormValue({ ...formValue, monatlicheBetrag: value })
                          }}
                        />
                      </div>
                    )}

                    {formValue.strategie === 'dynamisch' && (
                      <DynamicWithdrawalConfiguration formValue={formValue} />
                    )}

                    {formValue.strategie === 'rmd' && (
                      <RMDWithdrawalConfiguration
                        formValue={formValue}
                        updateFormValue={updateFormValue}
                      />
                    )}

                    {formValue.strategie === 'kapitalerhalt' && (
                      <KapitalerhaltConfiguration
                        formValue={formValue}
                        updateFormValue={updateFormValue}
                      />
                    )}

                    {formValue.strategie === 'bucket_strategie' && (
                      <BucketStrategyConfiguration
                        formValue={formValue}
                        updateFormValue={updateFormValue}
                      />
                    )}
                  </div>

                  {/* Comparison strategies configuration */}
                  <div style={{ marginTop: '30px' }}>
                    <h4>Vergleichs-Strategien</h4>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '20px',
                      }}
                    >
                      Konfiguriere zusätzliche Strategien zum Vergleich. Diese zeigen
                      nur die wichtigsten Parameter und Endergebnisse.
                    </p>

                    {comparisonStrategies.map(
                      (strategy: ComparisonStrategy, index: number) => (
                        <div
                          key={strategy.id}
                          style={{
                            border: '1px solid #e5e5ea',
                            borderRadius: '6px',
                            padding: '15px',
                            marginBottom: '15px',
                            backgroundColor: '#f8f9fa',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '10px',
                            }}
                          >
                            <h5 style={{ margin: 0 }}>
                              Strategie
                              {' '}
                              {index + 1}
                              :
                              {' '}
                              {strategy.name}
                            </h5>
                            <button
                              type="button"
                              onClick={() => {
                                updateConfig({
                                  comparisonStrategies: comparisonStrategies.filter(
                                    (s: ComparisonStrategy) => s.id !== strategy.id,
                                  ),
                                })
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#999',
                                cursor: 'pointer',
                                fontSize: '18px',
                              }}
                            >
                              ×
                            </button>
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '10px',
                              alignItems: 'end',
                            }}
                          >
                            <div>
                              <label
                                style={{
                                  display: 'block',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  marginBottom: '5px',
                                }}
                              >
                                Strategie-Typ
                              </label>
                              <select
                                value={strategy.strategie}
                                onChange={(e) => {
                                  const newStrategie = e.target
                                    .value as WithdrawalStrategy
                                  updateComparisonStrategy(strategy.id, {
                                    strategie: newStrategie,
                                    name: getStrategyDisplayName(newStrategie),
                                  })
                                }}
                                style={{
                                  width: '100%',
                                  padding: '6px',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px',
                                }}
                              >
                                <option value="4prozent">4% Regel</option>
                                <option value="3prozent">3% Regel</option>
                                <option value="variabel_prozent">
                                  Variable Prozent
                                </option>
                                <option value="monatlich_fest">Monatlich fest</option>
                                <option value="dynamisch">
                                  Dynamische Strategie
                                </option>
                                <option value="bucket_strategie">
                                  Drei-Eimer-Strategie
                                </option>
                                <option value="rmd">
                                  RMD (Lebenserwartung)
                                </option>
                              </select>
                            </div>

                            <div>
                              <label
                                style={{
                                  display: 'block',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  marginBottom: '5px',
                                }}
                              >
                                Rendite (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={strategy.rendite}
                                onChange={(e) => {
                                  updateComparisonStrategy(strategy.id, {
                                    rendite: parseFloat(e.target.value) || 0,
                                  })
                                }}
                                style={{
                                  width: '100%',
                                  padding: '6px',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px',
                                }}
                              />
                            </div>

                            {/* Strategy-specific parameters */}
                            {strategy.strategie === 'variabel_prozent' && (
                              <div style={{ gridColumn: 'span 2' }}>
                                <label
                                  style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    marginBottom: '5px',
                                  }}
                                >
                                  Entnahme-Prozentsatz (%)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  step="0.5"
                                  value={strategy.variabelProzent || 5}
                                  onChange={(e) => {
                                    updateComparisonStrategy(strategy.id, {
                                      variabelProzent:
                                  parseFloat(e.target.value) || 5,
                                    })
                                  }}
                                  style={{
                                    width: '50%',
                                    padding: '6px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>
                            )}

                            {strategy.strategie === 'monatlich_fest' && (
                              <div style={{ gridColumn: 'span 2' }}>
                                <label
                                  style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    marginBottom: '5px',
                                  }}
                                >
                                  Monatlicher Betrag (€)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="100"
                                  value={strategy.monatlicheBetrag || 2000}
                                  onChange={(e) => {
                                    updateComparisonStrategy(strategy.id, {
                                      monatlicheBetrag:
                                  parseFloat(e.target.value) || 2000,
                                    })
                                  }}
                                  style={{
                                    width: '50%',
                                    padding: '6px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                  }}
                                />
                              </div>
                            )}

                            {strategy.strategie === 'dynamisch' && (
                              <>
                                <div>
                                  <label
                                    style={{
                                      display: 'block',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      marginBottom: '5px',
                                    }}
                                  >
                                    Basis-Rate (%)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="0.5"
                                    value={strategy.dynamischBasisrate || 4}
                                    onChange={(e) => {
                                      updateComparisonStrategy(strategy.id, {
                                        dynamischBasisrate:
                                    parseFloat(e.target.value) || 4,
                                      })
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '6px',
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                    }}
                                  />
                                </div>
                                <div>
                                  <label
                                    style={{
                                      display: 'block',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      marginBottom: '5px',
                                    }}
                                  >
                                    Obere Schwelle (%)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                    value={strategy.dynamischObereSchwell || 8}
                                    onChange={(e) => {
                                      updateComparisonStrategy(strategy.id, {
                                        dynamischObereSchwell:
                                    parseFloat(e.target.value) || 8,
                                      })
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '6px',
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                    }}
                                  />
                                </div>
                              </>
                            )}

                            {strategy.strategie === 'bucket_strategie' && (
                              <>
                                <div>
                                  <label
                                    style={{
                                      display: 'block',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      marginBottom: '5px',
                                    }}
                                  >
                                    Cash-Polster (€)
                                  </label>
                                  <input
                                    type="number"
                                    min="1000"
                                    step="1000"
                                    value={strategy.bucketInitialCash || 20000}
                                    onChange={(e) => {
                                      updateComparisonStrategy(strategy.id, {
                                        bucketInitialCash:
                                    parseFloat(e.target.value) || 20000,
                                      })
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '6px',
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                    }}
                                  />
                                </div>
                                <div>
                                  <label
                                    style={{
                                      display: 'block',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      marginBottom: '5px',
                                    }}
                                  >
                                    Basis-Rate (%)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    value={strategy.bucketBaseRate || 4}
                                    onChange={(e) => {
                                      updateComparisonStrategy(strategy.id, {
                                        bucketBaseRate:
                                    parseFloat(e.target.value) || 4,
                                      })
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '6px',
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                    }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const newId = `strategy${Date.now()}`
                        const newStrategy: ComparisonStrategy = {
                          id: newId,
                          name: '3% Regel',
                          strategie: '3prozent',
                          rendite: 5,
                        }
                        updateConfig({
                          comparisonStrategies: [
                            ...comparisonStrategies,
                            newStrategy,
                          ],
                        })
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#1675e0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      + Weitere Strategie hinzufügen
                    </button>
                  </div>
                </div>
              ) : useSegmentedComparisonMode ? (
              /* Segmented comparison mode configuration */
                <SegmentedComparisonConfiguration
                  segmentedComparisonStrategies={segmentedComparisonStrategies}
                  withdrawalStartYear={startOfIndependence + 1}
                  withdrawalEndYear={globalEndOfLife}
                  onAddStrategy={addSegmentedComparisonStrategy}
                  onUpdateStrategy={updateSegmentedComparisonStrategy}
                  onRemoveStrategy={removeSegmentedComparisonStrategy}
                />
              ) : (
              /* Single strategy configuration (existing UI) */
                <div>
                  {/* Withdrawal Return Configuration */}
                  <div className="mb-4 space-y-2">
                    <Label>Rendite-Konfiguration (Entnahme-Phase)</Label>
                    <RadioTileGroup
                      value={withdrawalReturnMode}
                      onValueChange={(value: string) => {
                        updateConfig({
                          withdrawalReturnMode: value as WithdrawalReturnMode,
                        })
                      }}
                    >
                      <RadioTile value="fixed" label="Feste Rendite">
                        Konstante jährliche Rendite für die gesamte Entnahme-Phase
                      </RadioTile>
                      <RadioTile value="random" label="Zufällige Rendite">
                        Monte Carlo Simulation mit Durchschnitt und Volatilität
                      </RadioTile>
                      <RadioTile value="variable" label="Variable Rendite">
                        Jahr-für-Jahr konfigurierbare Renditen
                      </RadioTile>
                    </RadioTileGroup>
                    <div className="text-sm text-muted-foreground mt-1">
                      Konfiguration der erwarteten Rendite während der Entnahme-Phase
                      (unabhängig von der Sparphase-Rendite).
                    </div>
                  </div>

                  {withdrawalReturnMode === 'fixed' && (
                    <div className="mb-4 space-y-2">
                      <Label>
                        Erwartete Rendite Entnahme-Phase (%)
                      </Label>
                      <div className="space-y-2">
                        <Slider
                          value={[formValue.rendite]}
                          onValueChange={(values: number[]) => updateFormValue({ ...formValue, rendite: values[0] })}
                          min={0}
                          max={10}
                          step={0.5}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>0%</span>
                          <span className="font-medium text-gray-900">
                            {formValue.rendite}
                            %
                          </span>
                          <span>10%</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Feste Rendite für die gesamte Entnahme-Phase (oft
                        konservativer als die Sparphase-Rendite).
                      </div>
                    </div>
                  )}

                  {withdrawalReturnMode === 'random' && (
                    <>
                      <div className="mb-4 space-y-2">
                        <Label>Durchschnittliche Rendite (%)</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[withdrawalAverageReturn]}
                            min={0}
                            max={12}
                            step={0.5}
                            onValueChange={value =>
                              updateConfig({ withdrawalAverageReturn: value[0] })}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>0%</span>
                            <span className="font-medium text-gray-900">
                              {withdrawalAverageReturn}
                              %
                            </span>
                            <span>12%</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Erwartete durchschnittliche Rendite für die Entnahme-Phase
                          (meist konservativer als Ansparphase)
                        </div>
                      </div>

                      <div className="mb-4 space-y-2">
                        <Label>Standardabweichung (%)</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[withdrawalStandardDeviation]}
                            min={5}
                            max={25}
                            step={1}
                            onValueChange={value =>
                              updateConfig({ withdrawalStandardDeviation: value[0] })}
                            className="mt-2"
                          />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>5%</span>
                            <span className="font-medium text-gray-900">
                              {withdrawalStandardDeviation}
                              %
                            </span>
                            <span>25%</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Volatilität der Renditen (meist niedriger als Ansparphase
                          wegen konservativerer Allokation)
                        </div>
                      </div>

                      <div className="mb-4 space-y-2">
                        <Label>Zufalls-Seed (optional)</Label>
                        <Input
                          type="number"
                          value={withdrawalRandomSeed || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : undefined
                            updateConfig({
                              withdrawalRandomSeed: value,
                            })
                          }}
                          placeholder="Für reproduzierbare Ergebnisse"
                        />
                        <div className="text-sm text-muted-foreground mt-1">
                          Optionaler Seed für reproduzierbare Zufallsrenditen. Leer
                          lassen für echte Zufälligkeit.
                        </div>
                      </div>
                    </>
                  )}

                  {withdrawalReturnMode === 'variable' && (
                    <div className="mb-4 space-y-2">
                      <Label>Variable Renditen pro Jahr (Entnahme-Phase)</Label>
                      <div
                        style={{
                          maxHeight: '300px',
                          overflowY: 'auto',
                          border: '1px solid #e5e5ea',
                          borderRadius: '6px',
                          padding: '10px',
                        }}
                      >
                        {Array.from(
                          { length: globalEndOfLife - startOfIndependence },
                          (_, i) => {
                            const year = startOfIndependence + 1 + i
                            return (
                              <div
                                key={year}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginBottom: '10px',
                                  gap: '10px',
                                }}
                              >
                                <div style={{ minWidth: '60px', fontWeight: 'bold' }}>
                                  {year}
                                  :
                                </div>
                                <div style={{ flex: 1 }}>
                                  <Slider
                                    value={[withdrawalVariableReturns[year] || 5]}
                                    onValueChange={(values: number[]) => {
                                      const newReturns = {
                                        ...withdrawalVariableReturns,
                                        [year]: values[0],
                                      }
                                      updateConfig({
                                        withdrawalVariableReturns: newReturns,
                                      })
                                    }}
                                    min={-10}
                                    max={15}
                                    step={0.5}
                                    className="mt-2"
                                  />
                                </div>
                                <div style={{ minWidth: '50px', textAlign: 'right' }}>
                                  {(withdrawalVariableReturns[year] || 5).toFixed(1)}
                                  %
                                </div>
                              </div>
                            )
                          },
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Tipp: Verwende niedrigere Werte für konservative
                        Portfolio-Allokation in der Rente und negative Werte für
                        Krisen-Jahre.
                      </div>
                    </div>
                  )}
                  <div className="mb-4 space-y-2">
                    <Label>Strategie</Label>
                    <RadioTileGroup
                      value={formValue.strategie}
                      onValueChange={(value) => {
                        dispatchEnd([startOfIndependence, globalEndOfLife])
                        updateFormValue({
                          strategie: value as WithdrawalStrategy,
                        })
                      }}
                    >
                      <RadioTile value="4prozent" label="4% Regel">
                        4% Entnahme
                      </RadioTile>
                      <RadioTile value="3prozent" label="3% Regel">
                        3% Entnahme
                      </RadioTile>
                      <RadioTile value="variabel_prozent" label="Variable Prozent">
                        Anpassbare Entnahme
                      </RadioTile>
                      <RadioTile value="monatlich_fest" label="Monatlich fest">
                        Fester monatlicher Betrag
                      </RadioTile>
                      <RadioTile value="dynamisch" label="Dynamische Strategie">
                        Renditebasierte Anpassung
                      </RadioTile>
                      <RadioTile value="bucket_strategie" label="Drei-Eimer-Strategie">
                        Cash-Polster bei negativen Renditen
                      </RadioTile>
                      <RadioTile value="rmd" label="RMD (Lebenserwartung)">
                        Entnahme basierend auf Alter und Lebenserwartung
                      </RadioTile>
                    </RadioTileGroup>
                  </div>

                  {/* Withdrawal frequency configuration */}
                  <div className="mb-4 space-y-2">
                    <Label>Entnahme-Häufigkeit</Label>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-sm">Jährlich</span>
                      <Switch
                        checked={formValue.withdrawalFrequency === 'monthly'}
                        onCheckedChange={(checked) => {
                          updateFormValue({
                            withdrawalFrequency: checked ? 'monthly' : 'yearly',
                          })
                        }}
                      />
                      <span className="text-sm">Monatlich</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formValue.withdrawalFrequency === 'yearly'
                        ? 'Entnahme erfolgt einmal jährlich am Anfang des Jahres'
                        : 'Entnahme erfolgt monatlich - Portfolio hat mehr Zeit zu wachsen'}
                    </div>
                  </div>

                  {/* General inflation controls for all strategies */}
                  <div className="mb-4 space-y-2">
                    <Label>Inflation berücksichtigen</Label>
                    <Switch
                      checked={formValue.inflationAktiv}
                      onCheckedChange={(checked: boolean) => updateFormValue({ ...formValue, inflationAktiv: checked })}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Passt die Entnahmebeträge jährlich an die Inflation an (für alle
                      Entnahme-Strategien)
                    </div>
                  </div>

                  {formValue.inflationAktiv && (
                    <div className="mb-4 space-y-2">
                      <Label>Inflationsrate (%)</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[formValue.inflationsrate]}
                          onValueChange={(values: number[]) => {
                            dispatchEnd([startOfIndependence, globalEndOfLife])
                            updateFormValue({
                              inflationsrate: values[0],
                            })
                          }}
                          min={0}
                          max={5}
                          step={0.1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>0%</span>
                          <span className="font-medium text-gray-900">
                            {formValue.inflationsrate}
                            %
                          </span>
                          <span>5%</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Jährliche Inflationsrate zur Anpassung der Entnahmebeträge
                      </div>
                    </div>
                  )}

                  {/* Variable percentage strategy specific controls */}
                  {formValue.strategie === 'variabel_prozent' && (
                    <div className="mb-4 space-y-2">
                      <Label>Entnahme-Prozentsatz (%)</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[formValue.variabelProzent]}
                          onValueChange={(values: number[]) => {
                            updateFormValue({
                              variabelProzent: values[0],
                            })
                          }}
                          min={2}
                          max={7}
                          step={0.5}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>2%</span>
                          <span className="font-medium text-gray-900">
                            {formValue.variabelProzent}
                            %
                          </span>
                          <span>7%</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Wählen Sie einen Entnahme-Prozentsatz zwischen 2% und 7% in
                        0,5%-Schritten
                      </div>
                    </div>
                  )}

                  {/* Monthly strategy specific controls */}
                  {formValue.strategie === 'monatlich_fest' && (
                    <>
                      <div className="mb-4 space-y-2">
                        <Label>Monatlicher Betrag (€)</Label>
                        <Input
                          type="number"
                          value={formValue.monatlicheBetrag}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : undefined
                            if (value) updateFormValue({ ...formValue, monatlicheBetrag: value })
                          }}
                          min={100}
                          max={50000}
                          step={100}
                        />
                      </div>
                      <div className="mb-4 space-y-2">
                        <Label>
                          Dynamische Anpassung (Guardrails)
                        </Label>
                        <Switch
                          checked={formValue.guardrailsAktiv}
                          onCheckedChange={(checked: boolean) =>
                            updateFormValue({ ...formValue, guardrailsAktiv: checked })}
                        />
                        <div className="text-sm text-muted-foreground mt-1">
                          Passt die Entnahme basierend auf der Portfolio-Performance
                          an
                        </div>
                      </div>
                      {formValue.guardrailsAktiv && (
                        <div className="mb-4 space-y-2">
                          <Label>
                            Anpassungsschwelle (%)
                          </Label>
                          <div className="space-y-2">
                            <Slider
                              value={[formValue.guardrailsSchwelle]}
                              onValueChange={(values: number[]) => {
                                updateFormValue({
                                  guardrailsSchwelle: values[0],
                                })
                              }}
                              min={5}
                              max={20}
                              step={1}
                              className="mt-2"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>5%</span>
                              <span className="font-medium text-gray-900">
                                {formValue.guardrailsSchwelle}
                                %
                              </span>
                              <span>20%</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Bei Überschreitung dieser Schwelle wird die Entnahme
                            angepasst
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Dynamic strategy specific controls */}
                  {formValue.strategie === 'dynamisch' && (
                    <DynamicWithdrawalConfiguration formValue={formValue} />
                  )}

                  {/* RMD strategy specific controls */}
                  {formValue.strategie === 'rmd' && (
                    <RMDWithdrawalConfiguration
                      formValue={formValue}
                      updateFormValue={updateFormValue}
                    />
                  )}

                  {/* Kapitalerhalt strategy specific controls */}
                  {formValue.strategie === 'kapitalerhalt' && (
                    <KapitalerhaltConfiguration
                      formValue={formValue}
                      updateFormValue={updateFormValue}
                    />
                  )}

                  {/* Bucket strategy specific controls */}
                  {formValue.strategie === 'bucket_strategie' && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Drei-Eimer-Strategie Konfiguration</Label>

                      <div className="space-y-2">
                        <Label>Anfängliches Cash-Polster (€)</Label>
                        <Input
                          type="number"
                          value={formValue.bucketConfig?.initialCashCushion || 20000}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : 20000
                            updateFormValue({
                              ...formValue,
                              bucketConfig: {
                                initialCashCushion: value,
                                refillThreshold: formValue.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: formValue.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: formValue.bucketConfig?.baseWithdrawalRate || 0.04,
                              },
                            })
                          }}
                        />
                        <p className="text-sm text-gray-600">
                          Anfänglicher Betrag im Cash-Polster für Entnahmen bei negativen Renditen
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Basis-Entnahmerate (%)</Label>
                        <div className="px-3">
                          <Slider
                            value={[formValue.bucketConfig?.baseWithdrawalRate
                              ? formValue.bucketConfig.baseWithdrawalRate * 100 : 4]}
                            onValueChange={(value) => {
                              updateFormValue({
                                ...formValue,
                                bucketConfig: {
                                  initialCashCushion: formValue.bucketConfig?.initialCashCushion || 20000,
                                  refillThreshold: formValue.bucketConfig?.refillThreshold || 5000,
                                  refillPercentage: formValue.bucketConfig?.refillPercentage || 0.5,
                                  baseWithdrawalRate: value[0] / 100,
                                },
                              })
                            }}
                            max={10}
                            min={1}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>1%</span>
                            <span className="font-medium text-gray-900">
                              {formValue.bucketConfig?.baseWithdrawalRate ? (formValue.bucketConfig.baseWithdrawalRate * 100).toFixed(1) : '4.0'}
                              %
                            </span>
                            <span>10%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Auffüll-Schwellenwert (€)</Label>
                        <Input
                          type="number"
                          value={formValue.bucketConfig?.refillThreshold || 5000}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : 5000
                            updateFormValue({
                              ...formValue,
                              bucketConfig: {
                                initialCashCushion: formValue.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: value,
                                refillPercentage: formValue.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: formValue.bucketConfig?.baseWithdrawalRate || 0.04,
                              },
                            })
                          }}
                        />
                        <p className="text-sm text-gray-600">
                          Überschreiten die jährlichen Gewinne diesen Betrag, wird Cash-Polster aufgefüllt
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Auffüll-Anteil (%)</Label>
                        <div className="px-3">
                          <Slider
                            value={[formValue.bucketConfig?.refillPercentage
                              ? formValue.bucketConfig.refillPercentage * 100 : 50]}
                            onValueChange={(value) => {
                              updateFormValue({
                                ...formValue,
                                bucketConfig: {
                                  initialCashCushion: formValue.bucketConfig?.initialCashCushion || 20000,
                                  refillThreshold: formValue.bucketConfig?.refillThreshold || 5000,
                                  refillPercentage: value[0] / 100,
                                  baseWithdrawalRate: formValue.bucketConfig?.baseWithdrawalRate || 0.04,
                                },
                              })
                            }}
                            max={100}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>10%</span>
                            <span className="font-medium text-gray-900">
                              {formValue.bucketConfig?.refillPercentage ? (formValue.bucketConfig.refillPercentage * 100).toFixed(0) : '50'}
                              %
                            </span>
                            <span>100%</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Anteil der Überschussgewinne, der ins Cash-Polster verschoben wird
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Statutory Pension Configuration - Available in all withdrawal modes */}
              <div className="mb-6">
                <StatutoryPensionConfiguration
                  values={{
                    enabled: formValue.statutoryPensionConfig?.enabled || false,
                    startYear: formValue.statutoryPensionConfig?.startYear || startOfIndependence,
                    monthlyAmount: formValue.statutoryPensionConfig?.monthlyAmount || 1500,
                    annualIncreaseRate: formValue.statutoryPensionConfig?.annualIncreaseRate || 1.0,
                    taxablePercentage: formValue.statutoryPensionConfig?.taxablePercentage || 80,
                    retirementAge: formValue.statutoryPensionConfig?.retirementAge || 67,
                    birthYear: formValue.statutoryPensionConfig?.birthYear,
                    hasTaxReturnData: !!formValue.statutoryPensionConfig?.taxReturnData,
                    taxYear: formValue.statutoryPensionConfig?.taxReturnData?.taxYear || 2023,
                    annualPensionReceived: formValue.statutoryPensionConfig?.taxReturnData?.annualPensionReceived || 0,
                    taxablePortion: formValue.statutoryPensionConfig?.taxReturnData?.taxablePortion || 0,
                  }}
                  onChange={{
                    onEnabledChange: enabled => updateFormValue({
                      statutoryPensionConfig: {
                        ...(formValue.statutoryPensionConfig || {
                          enabled: false,
                          startYear: startOfIndependence,
                          monthlyAmount: 1500,
                          annualIncreaseRate: 1.0,
                          taxablePercentage: 80,
                          retirementAge: 67,
                        }),
                        enabled,
                      },
                    }),
                    onStartYearChange: startYear => updateFormValue({
                      statutoryPensionConfig: {
                        ...(formValue.statutoryPensionConfig || {
                          enabled: false,
                          startYear: startOfIndependence,
                          monthlyAmount: 1500,
                          annualIncreaseRate: 1.0,
                          taxablePercentage: 80,
                          retirementAge: 67,
                        }),
                        startYear,
                      },
                    }),
                    onMonthlyAmountChange: monthlyAmount => updateFormValue({
                      statutoryPensionConfig: {
                        ...(formValue.statutoryPensionConfig || {
                          enabled: false,
                          startYear: startOfIndependence,
                          monthlyAmount: 1500,
                          annualIncreaseRate: 1.0,
                          taxablePercentage: 80,
                          retirementAge: 67,
                        }),
                        monthlyAmount,
                      },
                    }),
                    onAnnualIncreaseRateChange: annualIncreaseRate => updateFormValue({
                      statutoryPensionConfig: {
                        ...(formValue.statutoryPensionConfig || {
                          enabled: false,
                          startYear: startOfIndependence,
                          monthlyAmount: 1500,
                          annualIncreaseRate: 1.0,
                          taxablePercentage: 80,
                          retirementAge: 67,
                        }),
                        annualIncreaseRate,
                      },
                    }),
                    onTaxablePercentageChange: taxablePercentage => updateFormValue({
                      statutoryPensionConfig: {
                        ...(formValue.statutoryPensionConfig || {
                          enabled: false,
                          startYear: startOfIndependence,
                          monthlyAmount: 1500,
                          annualIncreaseRate: 1.0,
                          taxablePercentage: 80,
                          retirementAge: 67,
                        }),
                        taxablePercentage,
                      },
                    }),
                    onRetirementAgeChange: retirementAge => updateFormValue({
                      statutoryPensionConfig: {
                        ...(formValue.statutoryPensionConfig || {
                          enabled: false,
                          startYear: startOfIndependence,
                          monthlyAmount: 1500,
                          annualIncreaseRate: 1.0,
                          taxablePercentage: 80,
                          retirementAge: 67,
                        }),
                        retirementAge,
                      },
                    }),
                    onBirthYearChange: birthYear => updateFormValue({
                      statutoryPensionConfig: {
                        ...(formValue.statutoryPensionConfig || {
                          enabled: false,
                          startYear: startOfIndependence,
                          monthlyAmount: 1500,
                          annualIncreaseRate: 1.0,
                          taxablePercentage: 80,
                          retirementAge: 67,
                        }),
                        birthYear,
                      },
                    }),
                    onTaxReturnDataChange: data => updateFormValue({
                      statutoryPensionConfig: {
                        ...(formValue.statutoryPensionConfig || {
                          enabled: false,
                          startYear: startOfIndependence,
                          monthlyAmount: 1500,
                          annualIncreaseRate: 1.0,
                          taxablePercentage: 80,
                          retirementAge: 67,
                        }),
                        taxReturnData: data.hasTaxReturnData
                          ? {
                              taxYear: data.taxYear,
                              annualPensionReceived: data.annualPensionReceived,
                              taxablePortion: data.taxablePortion,
                            }
                          : undefined,
                      },
                    }),
                  }}
                />
              </div>

              {/* Health Insurance Configuration - Available in all withdrawal modes */}
              <div className="mb-6">
                <HealthInsuranceConfiguration
                  values={{
                    enabled: formValue.healthInsuranceConfig?.enabled || false,
                    retirementStartYear: formValue.healthInsuranceConfig?.retirementStartYear || startOfIndependence,
                    childless: formValue.childless || false,
                    preRetirementType: (formValue.healthInsuranceConfig?.preRetirement?.type as HealthInsuranceType) || 'statutory',
                    retirementType: (formValue.healthInsuranceConfig?.retirement?.type as HealthInsuranceType) || 'statutory',
                    preRetirement: {
                      statutory: formValue.healthInsuranceConfig?.preRetirement?.type === 'statutory'
                        ? formValue.healthInsuranceConfig.preRetirement as StatutoryHealthInsuranceConfig
                        : undefined,
                      private: formValue.healthInsuranceConfig?.preRetirement?.type === 'private'
                        ? formValue.healthInsuranceConfig.preRetirement as PrivateHealthInsuranceConfig
                        : undefined,
                    },
                    retirement: {
                      statutory: formValue.healthInsuranceConfig?.retirement?.type === 'statutory'
                        ? formValue.healthInsuranceConfig.retirement as StatutoryHealthInsuranceConfig
                        : undefined,
                      private: formValue.healthInsuranceConfig?.retirement?.type === 'private'
                        ? formValue.healthInsuranceConfig.retirement as PrivateHealthInsuranceConfig
                        : undefined,
                    },
                  }}
                  onChange={{
                    onEnabledChange: enabled => updateFormValue({
                      healthInsuranceConfig: {
                        ...(formValue.healthInsuranceConfig || {
                          enabled: false,
                          retirementStartYear: startOfIndependence,
                          preRetirement: {
                            health: { usePercentage: true, percentage: 14.6 },
                            care: { usePercentage: true, percentage: 3.05, childlessSupplement: 0.6 },
                          },
                          retirement: {
                            health: { usePercentage: true, percentage: 7.3 },
                            care: { usePercentage: true, percentage: 3.05, childlessSupplement: 0.6 },
                          },
                        }),
                        enabled,
                      },
                      childless: formValue.childless || false,
                    }),
                    onRetirementStartYearChange: retirementStartYear => updateFormValue({
                      healthInsuranceConfig: {
                        ...(formValue.healthInsuranceConfig || {
                          enabled: false,
                          retirementStartYear: startOfIndependence,
                          preRetirement: {
                            health: { usePercentage: true, percentage: 14.6 },
                            care: { usePercentage: true, percentage: 3.05, childlessSupplement: 0.6 },
                          },
                          retirement: {
                            health: { usePercentage: true, percentage: 7.3 },
                            care: { usePercentage: true, percentage: 3.05, childlessSupplement: 0.6 },
                          },
                        }),
                        retirementStartYear,
                      },
                    }),
                    onChildlessChange: childless => updateFormValue({
                      healthInsuranceConfig: {
                        enabled: formValue.healthInsuranceConfig?.enabled || false,
                        retirementStartYear: formValue.healthInsuranceConfig?.retirementStartYear || startOfIndependence,
                        childless,
                        preRetirement: formValue.healthInsuranceConfig?.preRetirement || defaultStatutoryHealthInsuranceConfig,
                        retirement: formValue.healthInsuranceConfig?.retirement || defaultStatutoryHealthInsuranceConfigRetirement,
                      },
                      childless,
                    }),
                    onPreRetirementTypeChange: (type: HealthInsuranceType) => updateFormValue({
                      healthInsuranceConfig: {
                        enabled: formValue.healthInsuranceConfig?.enabled || false,
                        retirementStartYear: formValue.healthInsuranceConfig?.retirementStartYear || startOfIndependence,
                        childless: formValue.childless || false,
                        preRetirement: type === 'statutory' ? defaultStatutoryHealthInsuranceConfig : defaultPrivateHealthInsuranceConfig,
                        retirement: formValue.healthInsuranceConfig?.retirement || defaultStatutoryHealthInsuranceConfigRetirement,
                      },
                    }),
                    onRetirementTypeChange: (type: HealthInsuranceType) => updateFormValue({
                      healthInsuranceConfig: {
                        enabled: formValue.healthInsuranceConfig?.enabled || false,
                        retirementStartYear: formValue.healthInsuranceConfig?.retirementStartYear || startOfIndependence,
                        childless: formValue.childless || false,
                        preRetirement: formValue.healthInsuranceConfig?.preRetirement || defaultStatutoryHealthInsuranceConfig,
                        retirement: type === 'statutory' ? defaultStatutoryHealthInsuranceConfigRetirement : { ...defaultPrivateHealthInsuranceConfig, monthlyHealthPremium: 450, monthlyCareRremium: 90 },
                      },
                    }),
                    onPreRetirementStatutoryChange: (config: Partial<StatutoryHealthInsuranceConfig>) => updateFormValue({
                      healthInsuranceConfig: {
                        enabled: formValue.healthInsuranceConfig?.enabled || false,
                        retirementStartYear: formValue.healthInsuranceConfig?.retirementStartYear || startOfIndependence,
                        childless: formValue.childless || false,
                        preRetirement: {
                          ...(
                            (formValue.healthInsuranceConfig?.preRetirement as StatutoryHealthInsuranceConfig) ||
                            defaultStatutoryHealthInsuranceConfig
                          ),
                          ...config,
                        },
                        retirement: formValue.healthInsuranceConfig?.retirement || defaultStatutoryHealthInsuranceConfigRetirement,
                      },
                    }),
                    onPreRetirementPrivateChange: (config: Partial<PrivateHealthInsuranceConfig>) => updateFormValue({
                      healthInsuranceConfig: {
                        enabled: formValue.healthInsuranceConfig?.enabled || false,
                        retirementStartYear: formValue.healthInsuranceConfig?.retirementStartYear || startOfIndependence,
                        childless: formValue.childless || false,
                        preRetirement: {
                          ...((formValue.healthInsuranceConfig?.preRetirement as PrivateHealthInsuranceConfig) || defaultPrivateHealthInsuranceConfig),
                          ...config,
                        },
                        retirement: formValue.healthInsuranceConfig?.retirement || defaultStatutoryHealthInsuranceConfigRetirement,
                      },
                    }),
                    onRetirementStatutoryChange: (config: Partial<StatutoryHealthInsuranceConfig>) => updateFormValue({
                      healthInsuranceConfig: {
                        enabled: formValue.healthInsuranceConfig?.enabled || false,
                        retirementStartYear: formValue.healthInsuranceConfig?.retirementStartYear || startOfIndependence,
                        childless: formValue.childless || false,
                        preRetirement: formValue.healthInsuranceConfig?.preRetirement || defaultStatutoryHealthInsuranceConfig,
                        retirement: {
                          ...((formValue.healthInsuranceConfig?.retirement as StatutoryHealthInsuranceConfig) || defaultStatutoryHealthInsuranceConfigRetirement),
                          ...config,
                        },
                      },
                    }),
                    onRetirementPrivateChange: (config: Partial<PrivateHealthInsuranceConfig>) => updateFormValue({
                      healthInsuranceConfig: {
                        enabled: formValue.healthInsuranceConfig?.enabled || false,
                        retirementStartYear: formValue.healthInsuranceConfig?.retirementStartYear || startOfIndependence,
                        childless: formValue.childless || false,
                        preRetirement: formValue.healthInsuranceConfig?.preRetirement || defaultStatutoryHealthInsuranceConfig,
                        retirement: {
                          ...(
                            (formValue.healthInsuranceConfig?.retirement as PrivateHealthInsuranceConfig) ||
                            { ...defaultPrivateHealthInsuranceConfig, monthlyHealthPremium: 450, monthlyCareRremium: 90 }
                          ),
                          ...config,
                        },
                      },
                    }),
                  }}
                />
              </div>

            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      <Card className="mb-4">
        <Collapsible defaultOpen={false}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                <CardTitle className="text-left">Simulation</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <EntnahmeSimulationDisplay
                withdrawalData={withdrawalData}
                formValue={formValue}
                useComparisonMode={useComparisonMode}
                comparisonResults={comparisonResults}
                useSegmentedWithdrawal={useSegmentedWithdrawal}
                withdrawalSegments={withdrawalSegments}
                useSegmentedComparisonMode={useSegmentedComparisonMode}
                segmentedComparisonResults={segmentedComparisonResults}
                onCalculationInfoClick={handleCalculationInfoClick}
                grundfreibetragAktiv={grundfreibetragAktiv}
                grundfreibetragBetrag={grundfreibetragBetrag}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Calculation Explanation Modal */}
      {calculationDetails && (
        <CalculationExplanationModal
          open={showCalculationModal}
          onClose={() => setShowCalculationModal(false)}
          title={calculationDetails.title}
          introduction={calculationDetails.introduction}
          steps={calculationDetails.steps}
          finalResult={calculationDetails.finalResult}
        />
      )}

      {/* Vorabpauschale Explanation Modal */}
      {selectedVorabDetails && (
        <VorabpauschaleExplanationModal
          open={showVorabpauschaleModal}
          onClose={() => setShowVorabpauschaleModal(false)}
          selectedVorabDetails={selectedVorabDetails}
        />
      )}
    </>
  )
}
