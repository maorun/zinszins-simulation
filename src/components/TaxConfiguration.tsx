import { useSimulation } from '../contexts/useSimulation'
import { NestingProvider } from '../lib/nesting-context'
import BasiszinsConfiguration from './BasiszinsConfiguration'
import { useEffect, useState } from 'react'
import { getGrundfreibetragForPlanningMode, isStandardGrundfreibetragValue } from '../../helpers/steuer'
import { TooltipProvider } from './ui/tooltip'
import { GrundfreibetragConfiguration } from './tax-config/GrundfreibetragConfiguration'
import { TaxConfigurationCard } from './tax-config/TaxConfigurationCard'
import { TaxLossHarvestingCard } from './TaxLossHarvestingCard'
import { QuarterlyTaxPrepaymentCard } from './QuarterlyTaxPrepaymentCard'
import { PfaendungsfreibetragCard } from './PfaendungsfreibetragCard'
import { TailRiskHedgingCard } from './TailRiskHedgingCard'
import { SolidaritaetszuschlagCard } from './SolidaritaetszuschlagCard'
import { SeveranceCalculatorCard } from './SeveranceCalculatorCard'
import { ReverseCalculatorCard } from './ReverseCalculatorCard'
import { SequenceRiskAnalysisCard } from './SequenceRiskAnalysisCard'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { ProgressionsvorbehaltConfiguration } from './ProgressionsvorbehaltConfiguration'
import { DEFAULT_PROGRESSIONSVORBEHALT_CONFIG, type ProgressionsvorbehaltConfig } from '../../helpers/progressionsvorbehalt'
import { TaxProgressionVisualization } from './TaxProgressionVisualization'
import { InsuranceCostOverview } from './InsuranceCostOverview'
import { PensionComparisonTool } from './PensionComparisonTool'
import { QuellensteuerconfigCard } from './QuellensteuerconfigCard'
import { FreistellungsauftragOptimizer } from './FreistellungsauftragOptimizer'
import { PortfolioTeilfreistellungCard } from './tax-config/PortfolioTeilfreistellungCard'

import { TaxDeferralCalculatorCard } from './TaxDeferralCalculatorCard'
import { MultiYearLossTrackingDashboard } from './MultiYearLossTrackingDashboard'
import { ImmobilienSteueroptimierungCard } from './ImmobilienSteueroptimierungCard'
import { SellingStrategyCard } from './SellingStrategyCard'
import { MultiYearFreibetragOptimizationCard } from './MultiYearFreibetragOptimizationCard'

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

function FreistellungsauftragSection({
  planningMode,
  simulation,
}: {
  planningMode: 'individual' | 'couple'
  simulation: ReturnType<typeof useSimulation>
}) {
  const totalFreibetrag = planningMode === 'couple' ? 2000 : 1000

  const handleAccountsChange = (accounts: Array<import('../../helpers/freistellungsauftrag-optimization').BankAccount>) => {
    if (simulation.setFreistellungsauftragAccounts) {
      simulation.setFreistellungsauftragAccounts(accounts)
    }
  }

  return (
    <FreistellungsauftragOptimizer
      totalFreibetrag={totalFreibetrag}
      accounts={simulation.freistellungsauftragAccounts || []}
      onAccountsChange={handleAccountsChange}
      steuerlast={simulation.steuerlast}
      teilfreistellungsquote={simulation.teilfreistellungsquote}
    />
  )
}

function TaxOptimizationCards({ simulation }: { simulation: ReturnType<typeof useSimulation> }) {
  return (
    <>
      <PortfolioTeilfreistellungCard />
      <TaxDeferralCalculatorCard />
      <MultiYearFreibetragOptimizationCard />
      <ImmobilienSteueroptimierungCard />
      <SellingStrategyCard />
      <QuellensteuerconfigCard />
      <ReverseCalculatorCard />
      <SequenceRiskAnalysisCard />
      <TaxLossHarvestingCard />
      {/* Multi-Year Loss Tracking Dashboard */}
      <MultiYearLossTrackingDashboard
        taxRate={simulation.steuerlast}
        startYear={2025}
        endYear={2045}
        initialStockLosses={0}
        initialOtherLosses={0}
      />
      <QuarterlyTaxPrepaymentCard />
      <PfaendungsfreibetragCard />
      <TailRiskHedgingCard />
      <SeveranceCalculatorCard />
      <SolidaritaetszuschlagCard />
      <NestingProvider>
        <BasiszinsConfiguration />
      </NestingProvider>
    </>
  )
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
      <FreistellungsauftragSection planningMode={planningMode} simulation={simulation} />
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
      <PensionComparisonTool />
      <TaxOptimizationCards simulation={simulation} />
    </div>
  )
}

export default TaxConfiguration
