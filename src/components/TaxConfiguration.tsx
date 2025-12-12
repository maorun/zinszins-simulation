import { useSimulation } from '../contexts/useSimulation'
import { NestingProvider } from '../lib/nesting-context'
import BasiszinsConfiguration from './BasiszinsConfiguration'
import { useEffect, useState } from 'react'
import { getGrundfreibetragForPlanningMode, isStandardGrundfreibetragValue } from '../../helpers/steuer'
import { TooltipProvider } from './ui/tooltip'
import { GrundfreibetragConfiguration } from './tax-config/GrundfreibetragConfiguration'
import { TaxConfigurationCard } from './tax-config/TaxConfigurationCard'
import { TaxLossHarvestingCard } from './TaxLossHarvestingCard'
import { TailRiskHedgingCard } from './TailRiskHedgingCard'
import { SolidaritaetszuschlagCard } from './SolidaritaetszuschlagCard'
import { SeveranceCalculatorCard } from './SeveranceCalculatorCard'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { ProgressionsvorbehaltConfiguration } from './ProgressionsvorbehaltConfiguration'
import { DEFAULT_PROGRESSIONSVORBEHALT_CONFIG, type ProgressionsvorbehaltConfig } from '../../helpers/progressionsvorbehalt'
import { TaxProgressionVisualization } from './TaxProgressionVisualization'
import { InsuranceCostOverview } from './InsuranceCostOverview'

interface TaxConfigurationProps {
  planningMode?: 'individual' | 'couple'
}

function useAutoUpdateGrundfreibetrag(
  planningMode: 'individual' | 'couple',
  recommendedGrundfreibetrag: number,
  simulation: ReturnType<typeof useSimulation>,
) {
  useEffect(() => {
    const { grundfreibetragAktiv, grundfreibetragBetrag, setGrundfreibetragBetrag, performSimulation } = simulation
    if (
      grundfreibetragAktiv &&
      isStandardGrundfreibetragValue(grundfreibetragBetrag) &&
      grundfreibetragBetrag !== recommendedGrundfreibetrag
    ) {
      setGrundfreibetragBetrag(recommendedGrundfreibetrag)
      performSimulation()
    }
  }, [planningMode, recommendedGrundfreibetrag, simulation])
}

const TaxConfiguration = ({ planningMode = 'individual' }: TaxConfigurationProps) => {
  const simulation = useSimulation()
  const { currentConfig, updateFormValue } = useWithdrawalConfig()
  const recommendedGrundfreibetrag = getGrundfreibetragForPlanningMode(planningMode)
  const [progressionsvorbehaltConfig, setProgressionsvorbehaltConfig] =
    useState<ProgressionsvorbehaltConfig>(DEFAULT_PROGRESSIONSVORBEHALT_CONFIG)

  useAutoUpdateGrundfreibetrag(planningMode, recommendedGrundfreibetrag, simulation)

  const handleGrundfreibetragAktivChange = (c: boolean) => {
    simulation.setGrundfreibetragAktiv(c)
    if (c) simulation.setGrundfreibetragBetrag(recommendedGrundfreibetrag)
    simulation.performSimulation()
  }

  const handleGrundfreibetragBetragChange = (v: number) => {
    simulation.setGrundfreibetragBetrag(v)
    simulation.performSimulation()
  }

  const handleEinkommensteuersatzChange = (v: number) => {
    updateFormValue({ einkommensteuersatz: v })
    simulation.performSimulation()
  }

  return (
    <TooltipProvider>
      <NestingProvider level={1}>
        <TaxConfigurationCards
          simulation={simulation}
          currentConfig={currentConfig}
          planningMode={planningMode}
          recommendedGrundfreibetrag={recommendedGrundfreibetrag}
          progressionsvorbehaltConfig={progressionsvorbehaltConfig}
          setProgressionsvorbehaltConfig={setProgressionsvorbehaltConfig}
          handleGrundfreibetragAktivChange={handleGrundfreibetragAktivChange}
          handleGrundfreibetragBetragChange={handleGrundfreibetragBetragChange}
          handleEinkommensteuersatzChange={handleEinkommensteuersatzChange}
        />
      </NestingProvider>
    </TooltipProvider>
  )
}

interface TaxConfigurationCardsProps {
  simulation: ReturnType<typeof useSimulation>
  currentConfig: ReturnType<typeof useWithdrawalConfig>['currentConfig']
  planningMode: 'individual' | 'couple'
  recommendedGrundfreibetrag: number
  progressionsvorbehaltConfig: ProgressionsvorbehaltConfig
  setProgressionsvorbehaltConfig: (config: ProgressionsvorbehaltConfig) => void
  handleGrundfreibetragAktivChange: (c: boolean) => void
  handleGrundfreibetragBetragChange: (v: number) => void
  handleEinkommensteuersatzChange: (v: number) => void
}

function TaxConfigurationCards({
  simulation,
  currentConfig,
  planningMode,
  recommendedGrundfreibetrag,
  progressionsvorbehaltConfig,
  setProgressionsvorbehaltConfig,
  handleGrundfreibetragAktivChange,
  handleGrundfreibetragBetragChange,
  handleEinkommensteuersatzChange,
}: TaxConfigurationCardsProps) {
  return (
    <div className="space-y-4">
      <TaxConfigurationCard simulation={simulation} yearToday={new Date().getFullYear()} />
      <GrundfreibetragConfiguration
        grundfreibetragAktiv={simulation.grundfreibetragAktiv}
        grundfreibetragBetrag={simulation.grundfreibetragBetrag}
        recommendedGrundfreibetrag={recommendedGrundfreibetrag}
        planningModeLabel={planningMode === 'couple' ? 'Paare' : 'Einzelpersonen'}
        guenstigerPruefungAktiv={simulation.guenstigerPruefungAktiv}
        einkommensteuersatz={currentConfig.formValue.einkommensteuersatz}
        onGrundfreibetragAktivChange={handleGrundfreibetragAktivChange}
        onGrundfreibetragBetragChange={handleGrundfreibetragBetragChange}
        onEinkommensteuersatzChange={handleEinkommensteuersatzChange}
      />
      <TaxProgressionVisualization grundfreibetrag={recommendedGrundfreibetrag} />
      <ProgressionsvorbehaltConfiguration
        config={progressionsvorbehaltConfig}
        onChange={setProgressionsvorbehaltConfig}
        planningMode={planningMode}
        kirchensteuerAktiv={simulation.kirchensteuerAktiv}
        kirchensteuersatz={simulation.kirchensteuersatz}
      />
      <InsuranceCostOverview />
      <TaxLossHarvestingCard />
      <TailRiskHedgingCard />
      <SeveranceCalculatorCard />
      <SolidaritaetszuschlagCard />
      <NestingProvider>
        <BasiszinsConfiguration />
      </NestingProvider>
    </div>
  )
}

export default TaxConfiguration
