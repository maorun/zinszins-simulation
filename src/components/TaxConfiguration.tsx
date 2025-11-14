import { useSimulation } from '../contexts/useSimulation'
import { NestingProvider } from '../lib/nesting-context'
import BasiszinsConfiguration from './BasiszinsConfiguration'
import { useEffect } from 'react'
import { getGrundfreibetragForPlanningMode, isStandardGrundfreibetragValue } from '../../helpers/steuer'
import { TooltipProvider } from './ui/tooltip'
import { GrundfreibetragConfiguration } from './tax-config/GrundfreibetragConfiguration'
import { TaxConfigurationCard } from './tax-config/TaxConfigurationCard'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'

interface TaxConfigurationProps {
  planningMode?: 'individual' | 'couple'
}

// eslint-disable-next-line max-lines-per-function
const TaxConfiguration = ({ planningMode = 'individual' }: TaxConfigurationProps) => {
  const simulation = useSimulation()
  const { currentConfig, updateFormValue } = useWithdrawalConfig()
  const yearToday = new Date().getFullYear()
  const recommendedGrundfreibetrag = getGrundfreibetragForPlanningMode(planningMode)
  const planningModeLabel = planningMode === 'couple' ? 'Paare' : 'Einzelpersonen'

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

          <NestingProvider>
            <BasiszinsConfiguration />
          </NestingProvider>
        </div>
      </NestingProvider>
    </TooltipProvider>
  )
}

export default TaxConfiguration
