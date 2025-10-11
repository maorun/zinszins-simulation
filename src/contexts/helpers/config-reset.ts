import { convertSparplanToElements } from '../../utils/sparplan-utils'
import { createDefaultCareCostConfiguration, type CareCostConfiguration } from '../../../helpers/care-cost-simulation'
import type { StatutoryPensionConfig, CoupleStatutoryPensionConfig } from '../../../helpers/statutory-pension'
import type { FinancialGoal } from '../../../helpers/financial-goals'
import type { WithdrawalConfiguration } from '../../utils/config-storage'
import type { DefaultConfigType } from './default-config'
import type { ConfigurationSetters } from './config-types'

/**
 * Reset all configuration to defaults
 */
export function resetConfiguration(
  defaultConfig: DefaultConfigType,
  setters: Omit<ConfigurationSetters, 'setWithdrawalConfig' | 'setStatutoryPensionConfig' | 'setCoupleStatutoryPensionConfig' | 'setCareCostConfiguration' | 'setFinancialGoals'>,
  additionalSetters: {
    setWithdrawalConfig: (value: WithdrawalConfiguration | null) => void
    setStatutoryPensionConfig: (value: StatutoryPensionConfig | null) => void
    setCoupleStatutoryPensionConfig: (value: CoupleStatutoryPensionConfig | null) => void
    setCareCostConfiguration: (value: CareCostConfiguration) => void
    setFinancialGoals: (value: FinancialGoal[]) => void
  },
) {
  // Reset basic financial config
  setters.setRendite(defaultConfig.rendite)
  setters.setSteuerlast(defaultConfig.steuerlast)
  setters.setTeilfreistellungsquote(defaultConfig.teilfreistellungsquote)
  setters.setFreibetragPerYear(defaultConfig.freibetragPerYear)
  setters.setBasiszinsConfiguration(defaultConfig.basiszinsConfiguration)

  // Reset tax config
  setters.setSteuerReduzierenEndkapitalSparphase(defaultConfig.steuerReduzierenEndkapitalSparphase)
  setters.setSteuerReduzierenEndkapitalEntspharphase(defaultConfig.steuerReduzierenEndkapitalEntspharphase)
  setters.setGrundfreibetragAktiv(defaultConfig.grundfreibetragAktiv)
  setters.setGrundfreibetragBetrag(defaultConfig.grundfreibetragBetrag)
  setters.setPersonalTaxRate(defaultConfig.personalTaxRate)
  setters.setGuenstigerPruefungAktiv(defaultConfig.guenstigerPruefungAktiv)

  // Reset return config
  setters.setReturnMode(defaultConfig.returnMode)
  setters.setAverageReturn(defaultConfig.averageReturn)
  setters.setStandardDeviation(defaultConfig.standardDeviation)
  setters.setRandomSeed(defaultConfig.randomSeed)
  setters.setVariableReturns(defaultConfig.variableReturns)
  setters.setHistoricalIndex(defaultConfig.historicalIndex)

  // Reset inflation config
  setters.setInflationAktivSparphase(defaultConfig.inflationAktivSparphase)
  setters.setInflationsrateSparphase(defaultConfig.inflationsrateSparphase)
  setters.setInflationAnwendungSparphase(defaultConfig.inflationAnwendungSparphase)

  // Reset savings plan config
  setters.setStartEnd(defaultConfig.startEnd)
  setters.setSparplan(defaultConfig.sparplan)
  setters.setSimulationAnnual(defaultConfig.simulationAnnual)
  setters.setSparplanElemente(
    convertSparplanToElements(defaultConfig.sparplan, defaultConfig.startEnd, defaultConfig.simulationAnnual),
  )

  // Reset life expectancy config
  setters.setEndOfLife(defaultConfig.endOfLife)
  setters.setLifeExpectancyTable(defaultConfig.lifeExpectancyTable)
  setters.setCustomLifeExpectancy(defaultConfig.customLifeExpectancy)

  // Reset planning mode config
  setters.setPlanningMode(defaultConfig.planningMode)
  setters.setGender(defaultConfig.gender)
  setters.setSpouse(defaultConfig.spouse)
  setters.setBirthYear(defaultConfig.birthYear)
  setters.setExpectedLifespan(defaultConfig.expectedLifespan)
  setters.setUseAutomaticCalculation(defaultConfig.useAutomaticCalculation)

  // Reset withdrawal and pension config
  additionalSetters.setWithdrawalConfig(null)
  additionalSetters.setStatutoryPensionConfig(null)
  additionalSetters.setCoupleStatutoryPensionConfig(null)
  additionalSetters.setCareCostConfiguration(createDefaultCareCostConfiguration())
  additionalSetters.setFinancialGoals([])
}
