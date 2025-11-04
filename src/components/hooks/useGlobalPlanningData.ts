import { useSimulation } from '../../contexts/useSimulation'

/**
 * Custom hook that extracts and organizes all the simulation context data
 * needed by the GlobalPlanningConfiguration component.
 */
export function useGlobalPlanningData() {
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
    // Couple statutory pension configuration
    coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig,
    // Care cost configuration
    careCostConfiguration,
    setCareCostConfiguration,
  } = useSimulation()

  return {
    globalEndOfLife,
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
    planningMode,
    setPlanningMode,
    gender,
    setGender,
    spouse,
    setSpouse,
    coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig,
    careCostConfiguration,
    setCareCostConfiguration,
  }
}
