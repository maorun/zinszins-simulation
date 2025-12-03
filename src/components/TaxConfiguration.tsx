import { useSimulation } from '../contexts/useSimulation'
import { NestingProvider } from '../lib/nesting-context'
import BasiszinsConfiguration from './BasiszinsConfiguration'
import { useEffect, useState } from 'react'
import { getGrundfreibetragForPlanningMode, isStandardGrundfreibetragValue } from '../../helpers/steuer'
import { TooltipProvider } from './ui/tooltip'
import { GrundfreibetragConfiguration } from './tax-config/GrundfreibetragConfiguration'
import { TaxConfigurationCard } from './tax-config/TaxConfigurationCard'
import { TaxLossHarvestingCard } from './TaxLossHarvestingCard'
import { SolidaritaetszuschlagCard } from './SolidaritaetszuschlagCard'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { ProgressionsvorbehaltConfiguration } from './ProgressionsvorbehaltConfiguration'
import { DEFAULT_PROGRESSIONSVORBEHALT_CONFIG, type ProgressionsvorbehaltConfig } from '../../helpers/progressionsvorbehalt'

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

  return (
    <TooltipProvider>
      <NestingProvider level={1}>
        <div className="space-y-4">
          <TaxConfigurationCard simulation={simulation} yearToday={new Date().getFullYear()} />
          <GrundfreibetragConfiguration
            grundfreibetragAktiv={simulation.grundfreibetragAktiv}
            grundfreibetragBetrag={simulation.grundfreibetragBetrag}
            recommendedGrundfreibetrag={recommendedGrundfreibetrag}
            planningModeLabel={planningMode === 'couple' ? 'Paare' : 'Einzelpersonen'}
            guenstigerPruefungAktiv={simulation.guenstigerPruefungAktiv}
            einkommensteuersatz={currentConfig.formValue.einkommensteuersatz}
            onGrundfreibetragAktivChange={c => {
              simulation.setGrundfreibetragAktiv(c)
              if (c) simulation.setGrundfreibetragBetrag(recommendedGrundfreibetrag)
              simulation.performSimulation()
            }}
            onGrundfreibetragBetragChange={v => {
              simulation.setGrundfreibetragBetrag(v)
              simulation.performSimulation()
            }}
            onEinkommensteuersatzChange={v => {
              updateFormValue({ einkommensteuersatz: v })
              simulation.performSimulation()
            }}
          />
          <ProgressionsvorbehaltConfiguration
            config={progressionsvorbehaltConfig}
            onChange={setProgressionsvorbehaltConfig}
            planningMode={planningMode}
            kirchensteuerAktiv={simulation.kirchensteuerAktiv}
            kirchensteuersatz={simulation.kirchensteuersatz}
          />
          <TaxLossHarvestingCard />
          <SolidaritaetszuschlagCard />
          <NestingProvider>
            <BasiszinsConfiguration />
          </NestingProvider>
        </div>
      </NestingProvider>
    </TooltipProvider>
  )
}

export default TaxConfiguration
