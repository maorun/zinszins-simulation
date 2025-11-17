import { convertSparplanToElements } from '../../utils/sparplan-utils'
import { convertLegacyToCoupleConfig, type CoupleStatutoryPensionConfig } from '../../../helpers/statutory-pension'
import { defaultEmergencyFundConfig } from '../../../helpers/emergency-fund'
import type { ExtendedSavedConfiguration, DefaultConfiguration, ConfigurationSetters } from './config-types'

/**
 * Load basic financial configuration (rendite, steuerlast, etc.)
 */
export function loadBasicConfig(
  savedConfig: ExtendedSavedConfiguration,
  defaultConfig: DefaultConfiguration,
  setters: Pick<
    ConfigurationSetters,
    'setRendite' | 'setSteuerlast' | 'setTeilfreistellungsquote' | 'setFreibetragPerYear' | 'setBasiszinsConfiguration'
  >,
): void {
  setters.setRendite(savedConfig.rendite)
  setters.setSteuerlast(savedConfig.steuerlast)
  setters.setTeilfreistellungsquote(savedConfig.teilfreistellungsquote)
  setters.setFreibetragPerYear(savedConfig.freibetragPerYear)
  setters.setBasiszinsConfiguration(savedConfig.basiszinsConfiguration || defaultConfig.basiszinsConfiguration)
}

/**
 * Load tax-related configuration
 */
export function loadTaxConfig(
  savedConfig: ExtendedSavedConfiguration,
  defaultConfig: DefaultConfiguration,
  setters: Pick<
    ConfigurationSetters,
    | 'setSteuerReduzierenEndkapitalSparphase'
    | 'setSteuerReduzierenEndkapitalEntspharphase'
    | 'setGrundfreibetragAktiv'
    | 'setGrundfreibetragBetrag'
    | 'setPersonalTaxRate'
    | 'setGuenstigerPruefungAktiv'
  >,
): void {
  setters.setSteuerReduzierenEndkapitalSparphase(savedConfig.steuerReduzierenEndkapitalSparphase ?? true)
  setters.setSteuerReduzierenEndkapitalEntspharphase(savedConfig.steuerReduzierenEndkapitalEntspharphase ?? true)
  setters.setGrundfreibetragAktiv(savedConfig.grundfreibetragAktiv ?? false)
  setters.setGrundfreibetragBetrag(savedConfig.grundfreibetragBetrag ?? 11604)
  setters.setPersonalTaxRate(savedConfig.personalTaxRate ?? defaultConfig.personalTaxRate)
  setters.setGuenstigerPruefungAktiv(savedConfig.guenstigerPruefungAktiv ?? defaultConfig.guenstigerPruefungAktiv)
}

/**
 * Load return/investment configuration
 */
export function loadReturnConfig(
  savedConfig: ExtendedSavedConfiguration,
  defaultConfig: DefaultConfiguration,
  setters: Pick<
    ConfigurationSetters,
    | 'setReturnMode'
    | 'setAverageReturn'
    | 'setStandardDeviation'
    | 'setRandomSeed'
    | 'setVariableReturns'
    | 'setHistoricalIndex'
  >,
): void {
  setters.setReturnMode(savedConfig.returnMode)
  setters.setAverageReturn(savedConfig.averageReturn)
  setters.setStandardDeviation(savedConfig.standardDeviation)
  setters.setRandomSeed(savedConfig.randomSeed)
  setters.setVariableReturns(savedConfig.variableReturns)
  setters.setHistoricalIndex(savedConfig.historicalIndex || defaultConfig.historicalIndex)
}

/**
 * Load inflation configuration for savings phase
 */
export function loadInflationConfig(
  savedConfig: ExtendedSavedConfiguration,
  defaultConfig: DefaultConfiguration,
  setters: Pick<
    ConfigurationSetters,
    'setInflationAktivSparphase' | 'setInflationsrateSparphase' | 'setInflationAnwendungSparphase'
  >,
): void {
  const inflationSettings = {
    inflationAktivSparphase: savedConfig.inflationAktivSparphase ?? defaultConfig.inflationAktivSparphase,
    inflationsrateSparphase: savedConfig.inflationsrateSparphase ?? defaultConfig.inflationsrateSparphase,
    inflationAnwendungSparphase: savedConfig.inflationAnwendungSparphase ?? defaultConfig.inflationAnwendungSparphase,
  }

  setters.setInflationAktivSparphase(inflationSettings.inflationAktivSparphase)
  setters.setInflationsrateSparphase(inflationSettings.inflationsrateSparphase)
  setters.setInflationAnwendungSparphase(inflationSettings.inflationAnwendungSparphase)
}

/**
 * Load savings plan configuration
 */
export function loadSparplanConfig(
  savedConfig: ExtendedSavedConfiguration,
  setters: Pick<ConfigurationSetters, 'setStartEnd' | 'setSparplan' | 'setSimulationAnnual' | 'setSparplanElemente'>,
): void {
  setters.setStartEnd(savedConfig.startEnd)
  setters.setSparplan(savedConfig.sparplan)
  setters.setSimulationAnnual(savedConfig.simulationAnnual)
  setters.setSparplanElemente(
    convertSparplanToElements(savedConfig.sparplan, savedConfig.startEnd, savedConfig.simulationAnnual),
  )
}

/**
 * Load life expectancy configuration
 */
export function loadLifeExpectancyConfig(
  savedConfig: ExtendedSavedConfiguration,
  defaultConfig: DefaultConfiguration,
  setters: Pick<ConfigurationSetters, 'setEndOfLife' | 'setLifeExpectancyTable' | 'setCustomLifeExpectancy'>,
): void {
  setters.setEndOfLife(savedConfig.endOfLife ?? savedConfig.startEnd[1])
  setters.setLifeExpectancyTable(savedConfig.lifeExpectancyTable ?? defaultConfig.lifeExpectancyTable)
  setters.setCustomLifeExpectancy(savedConfig.customLifeExpectancy)
}

/**
 * Load planning mode (individual/couple) configuration
 */
export function loadPlanningModeConfig(
  savedConfig: ExtendedSavedConfiguration,
  defaultConfig: DefaultConfiguration,
  setters: Pick<
    ConfigurationSetters,
    | 'setPlanningMode'
    | 'setGender'
    | 'setSpouse'
    | 'setBirthYear'
    | 'setExpectedLifespan'
    | 'setUseAutomaticCalculation'
  >,
): void {
  setters.setPlanningMode(savedConfig.planningMode ?? defaultConfig.planningMode)
  setters.setGender(savedConfig.gender)
  setters.setSpouse(savedConfig.spouse)
  setters.setBirthYear(savedConfig.birthYear)
  setters.setExpectedLifespan(savedConfig.expectedLifespan ?? defaultConfig.expectedLifespan)
  setters.setUseAutomaticCalculation(savedConfig.useAutomaticCalculation ?? true)
}

/**
 * Get couple statutory pension configuration with fallback
 */
function getCoupleStatutoryPensionConfig(savedConfig: ExtendedSavedConfiguration): CoupleStatutoryPensionConfig | null {
  if (savedConfig.coupleStatutoryPensionConfig) {
    return savedConfig.coupleStatutoryPensionConfig
  }

  if (savedConfig.statutoryPensionConfig) {
    return convertLegacyToCoupleConfig(savedConfig.statutoryPensionConfig, savedConfig.planningMode || 'couple')
  }

  return null
}

/**
 * Load care cost configuration with planning mode
 */
function loadCareCostConfig(
  savedConfig: ExtendedSavedConfiguration,
  setCareCostConfiguration: ConfigurationSetters['setCareCostConfiguration'],
): void {
  if (savedConfig.careCostConfiguration) {
    setCareCostConfiguration({
      ...savedConfig.careCostConfiguration,
      planningMode: savedConfig.planningMode || 'individual',
    })
  }
}

/**
 * Load emergency fund configuration
 */
function loadEmergencyFundConfig(
  savedConfig: ExtendedSavedConfiguration,
  setEmergencyFundConfig: ConfigurationSetters['setEmergencyFundConfig'],
): void {
  setEmergencyFundConfig(savedConfig.emergencyFundConfig || defaultEmergencyFundConfig)
}

/**
 * Load withdrawal and pension configuration
 */
export function loadWithdrawalConfig(
  savedConfig: ExtendedSavedConfiguration,
  setters: Pick<
    ConfigurationSetters,
    | 'setWithdrawalConfig'
    | 'setStatutoryPensionConfig'
    | 'setCoupleStatutoryPensionConfig'
    | 'setCareCostConfiguration'
    | 'setFinancialGoals'
    | 'setEmergencyFundConfig'
  >,
): void {
  setters.setWithdrawalConfig(savedConfig.withdrawal || null)
  setters.setStatutoryPensionConfig(savedConfig.statutoryPensionConfig || null)

  const coupleConfig = getCoupleStatutoryPensionConfig(savedConfig)
  setters.setCoupleStatutoryPensionConfig(coupleConfig)

  loadCareCostConfig(savedConfig, setters.setCareCostConfiguration)

  setters.setFinancialGoals(savedConfig.financialGoals || [])

  loadEmergencyFundConfig(savedConfig, setters.setEmergencyFundConfig)
}
