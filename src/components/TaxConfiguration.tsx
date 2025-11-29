import { useSimulation } from '../contexts/useSimulation'
import { NestingProvider } from '../lib/nesting-context'
import BasiszinsConfiguration from './BasiszinsConfiguration'
import { useEffect, useState } from 'react'
import { getGrundfreibetragForPlanningMode, isStandardGrundfreibetragValue } from '../../helpers/steuer'
import { TooltipProvider } from './ui/tooltip'
import { GrundfreibetragConfiguration } from './tax-config/GrundfreibetragConfiguration'
import { TaxConfigurationCard } from './tax-config/TaxConfigurationCard'
import { TaxLossHarvestingCard } from './TaxLossHarvestingCard'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { ProgressionsvorbehaltConfiguration } from './ProgressionsvorbehaltConfiguration'
import { DEFAULT_PROGRESSIONSVORBEHALT_CONFIG, type ProgressionsvorbehaltConfig } from '../../helpers/progressionsvorbehalt'

interface TaxConfigurationProps {
  planningMode?: 'individual' | 'couple'
}

/**
 * Auto-update Grundfreibetrag when planning mode changes
 */
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
  const yearToday = new Date().getFullYear()
  const recommendedGrundfreibetrag = getGrundfreibetragForPlanningMode(planningMode)
  const planningModeLabel = planningMode === 'couple' ? 'Paare' : 'Einzelpersonen'
  const [progressionsvorbehaltConfig, setProgressionsvorbehaltConfig] = useState<ProgressionsvorbehaltConfig>(
    DEFAULT_PROGRESSIONSVORBEHALT_CONFIG,
  )

  useAutoUpdateGrundfreibetrag(planningMode, recommendedGrundfreibetrag, simulation)

  return (
    <TooltipProvider>
      <NestingProvider level={1}>
        <div className="space-y-4">
          <TaxConfigurationCard simulation={simulation} yearToday={yearToday} />

          <GrundfreibetragConfiguration
            grundfreibetragAktiv={simulation.grundfreibetragAktiv}
            grundfreibetragBetrag={simulation.grundfreibetragBetrag}
            recommendedGrundfreibetrag={recommendedGrundfreibetrag}
            planningModeLabel={planningModeLabel}
            guenstigerPruefungAktiv={simulation.guenstigerPruefungAktiv}
            einkommensteuersatz={currentConfig.formValue.einkommensteuersatz}
            onGrundfreibetragAktivChange={checked => {
              simulation.setGrundfreibetragAktiv(checked)
              if (checked) simulation.setGrundfreibetragBetrag(recommendedGrundfreibetrag)
              simulation.performSimulation()
            }}
            onGrundfreibetragBetragChange={value => {
              simulation.setGrundfreibetragBetrag(value)
              simulation.performSimulation()
            }}
            onEinkommensteuersatzChange={value => {
              updateFormValue({ einkommensteuersatz: value })
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

          <NestingProvider>
            <BasiszinsConfiguration />
          </NestingProvider>
        </div>
      </NestingProvider>
    </TooltipProvider>
  )
}

export default TaxConfiguration
