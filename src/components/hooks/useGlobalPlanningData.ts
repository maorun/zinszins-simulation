import { useSimulation } from '../../contexts/useSimulation'

/**
 * Custom hook that extracts and organizes all the simulation context data
 * needed by the GlobalPlanningConfiguration component.
 */
export function useGlobalPlanningData() {
  const simulation = useSimulation()

  // Life expectancy related state
  const lifeExpectancy = {
    globalEndOfLife: simulation.endOfLife,
    lifeExpectancyTable: simulation.lifeExpectancyTable,
    customLifeExpectancy: simulation.customLifeExpectancy,
    setEndOfLife: simulation.setEndOfLife,
    setLifeExpectancyTable: simulation.setLifeExpectancyTable,
    setCustomLifeExpectancy: simulation.setCustomLifeExpectancy,
    expectedLifespan: simulation.expectedLifespan,
    setExpectedLifespan: simulation.setExpectedLifespan,
    useAutomaticCalculation: simulation.useAutomaticCalculation,
    setUseAutomaticCalculation: simulation.setUseAutomaticCalculation,
  }

  // Personal and planning mode state
  const planning = {
    birthYear: simulation.birthYear,
    setBirthYear: simulation.setBirthYear,
    planningMode: simulation.planningMode,
    setPlanningMode: simulation.setPlanningMode,
    gender: simulation.gender,
    setGender: simulation.setGender,
    spouse: simulation.spouse,
    setSpouse: simulation.setSpouse,
  }

  // Configuration state
  const configs = {
    coupleStatutoryPensionConfig: simulation.coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig: simulation.setCoupleStatutoryPensionConfig,
    careCostConfiguration: simulation.careCostConfiguration,
    setCareCostConfiguration: simulation.setCareCostConfiguration,
    termLifeInsuranceConfig: simulation.termLifeInsuranceConfig,
    setTermLifeInsuranceConfig: simulation.setTermLifeInsuranceConfig,
    careInsuranceConfig: simulation.careInsuranceConfig,
    setCareInsuranceConfig: simulation.setCareInsuranceConfig,
    emRenteConfig: simulation.emRenteConfig,
    setEMRenteConfig: simulation.setEMRenteConfig,
  }

  return { ...lifeExpectancy, ...planning, ...configs }
}

