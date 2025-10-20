import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useSimulation } from '../contexts/useSimulation'
import { useNavigationItem } from '../hooks/useNavigationItem'
import { calculateEndOfLifeYear, calculateCurrentAge } from '../../helpers/life-expectancy'
import { calculateJointLifeExpectancy } from '../../helpers/rmd-tables'
import { CoupleStatutoryPensionConfiguration } from './StatutoryPensionConfiguration'
import { CareCostConfiguration } from './CareCostConfiguration'
import { useCallback, useEffect } from 'react'
import { PlanningModeSelector } from './PlanningModeSelector'
import { GenderConfiguration } from './GenderConfiguration'
import { BirthYearConfiguration } from './BirthYearConfiguration'
import { LifeExpectancyCalculation } from './LifeExpectancyCalculation'

interface GlobalPlanningConfigurationProps {
  startOfIndependence: number
}

export function GlobalPlanningConfiguration({ startOfIndependence }: GlobalPlanningConfigurationProps) {
  const {
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
    // Couple statutory pension configuration (new)
    coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig,
    // Care cost configuration
    careCostConfiguration,
    setCareCostConfiguration,
  } = useSimulation()

  // Helper to calculate end of life for individual planning
  const calculateIndividualEndOfLife = useCallback(() => {
    if (birthYear && expectedLifespan) {
      const calculatedYear = calculateEndOfLifeYear(birthYear, expectedLifespan)
      setEndOfLife(Math.round(calculatedYear))
    }
  }, [birthYear, expectedLifespan, setEndOfLife])

  // Helper to calculate end of life for couple planning
  const calculateCoupleEndOfLife = useCallback(() => {
    if (!birthYear || !spouse?.birthYear || !gender || !spouse?.gender) {
      return
    }

    const age1 = calculateCurrentAge(birthYear)
    const age2 = calculateCurrentAge(spouse.birthYear)
    const jointLifeExpectancy = calculateJointLifeExpectancy(
      age1, age2, gender, spouse.gender,
    )

    // Use the older person's birth year + joint life expectancy
    const olderBirthYear = Math.min(birthYear, spouse.birthYear)
    const calculatedYear = calculateEndOfLifeYear(
      olderBirthYear,
      jointLifeExpectancy + calculateCurrentAge(olderBirthYear),
    )
    setEndOfLife(Math.round(calculatedYear))
  }, [birthYear, spouse, gender, setEndOfLife])

  // Automatic calculation effect - triggers when automatic mode is enabled and relevant data changes
  useEffect(() => {
    if (!useAutomaticCalculation) {
      return
    }

    if (planningMode === 'individual') {
      calculateIndividualEndOfLife()
    }
    else if (planningMode === 'couple') {
      calculateCoupleEndOfLife()
    }
  }, [
    useAutomaticCalculation,
    planningMode,
    calculateIndividualEndOfLife,
    calculateCoupleEndOfLife,
  ])

  const navigationRef = useNavigationItem({
    id: 'global-planning',
    title: 'Globale Planung (Einzelperson/Ehepaar)',
    icon: '👥',
    level: 0,
  })

  return (
    <Card className="mb-6" ref={navigationRef}>
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-lg font-semibold text-blue-800">👥 Globale Planung (Einzelperson/Ehepaar)</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-6">
              {/* Planning Mode Selection */}
              <PlanningModeSelector
                planningMode={planningMode}
                onChange={setPlanningMode}
              />

              {/* Gender Configuration */}
              <GenderConfiguration
                planningMode={planningMode}
                gender={gender}
                setGender={setGender}
                spouse={spouse}
                setSpouse={setSpouse}
              />

              {/* Birth Year Configuration */}
              <BirthYearConfiguration
                config={{
                  planningMode,
                  gender,
                  birthYear,
                  expectedLifespan,
                  spouse,
                }}
                onChange={{
                  birthYear: setBirthYear,
                  expectedLifespan: setExpectedLifespan,
                  spouse: setSpouse,
                }}
              />

              {/* Life Expectancy Calculation Card */}
              <LifeExpectancyCalculation
                config={{
                  startOfIndependence,
                  globalEndOfLife,
                  useAutomaticCalculation,
                  planningMode,
                  birthYear,
                  expectedLifespan,
                  gender,
                  spouse,
                  lifeExpectancyTable,
                  customLifeExpectancy,
                }}
                onChange={{
                  endOfLife: setEndOfLife,
                  useAutomaticCalculation: setUseAutomaticCalculation,
                  expectedLifespan: setExpectedLifespan,
                  lifeExpectancyTable: setLifeExpectancyTable,
                  customLifeExpectancy: setCustomLifeExpectancy,
                }}
              />

              {/* Statutory Pension Configuration Card */}
              <div className="mb-6">
                <CoupleStatutoryPensionConfiguration
                  config={coupleStatutoryPensionConfig}
                  onChange={setCoupleStatutoryPensionConfig}
                  currentYear={new Date().getFullYear()}
                  birthYear={birthYear}
                  spouseBirthYear={spouse?.birthYear}
                  planningMode={planningMode}
                />
              </div>

              {/* Care Cost Configuration Card */}
              <div className="mb-6">
                <CareCostConfiguration
                  values={careCostConfiguration}
                  onChange={setCareCostConfiguration}
                  currentYear={new Date().getFullYear()}
                  birthYear={birthYear}
                  spouseBirthYear={spouse?.birthYear}
                  planningMode={planningMode}
                  nestingLevel={1}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
