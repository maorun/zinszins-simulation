import { lazy } from 'react'
import { ConfigurationSection } from './ConfigurationSection'

// Lazy load planning and lifestyle configuration components
const GlobalPlanningConfiguration = lazy(() =>
  import('../GlobalPlanningConfiguration').then(m => ({ default: m.GlobalPlanningConfiguration })),
)
const FinancialGoalsConfiguration = lazy(() => import('../FinancialGoalsConfiguration'))
const EmergencyFundConfiguration = lazy(() => import('../EmergencyFundConfiguration'))
const AlimonyConfiguration = lazy(() => import('../AlimonyConfiguration'))
const GiftTaxPlanningConfiguration = lazy(() => import('../GiftTaxPlanningConfiguration'))
const GenerationalWealthTransferConfiguration = lazy(() => import('../GenerationalWealthTransferConfiguration'))

interface PlanningConfigurationsProps {
  startOfIndependence: number
}

/**
 * Planning and Lifestyle Configuration Sections
 * Groups together financial planning, goals, emergency fund, and tax planning components
 */
export function PlanningConfigurations({ startOfIndependence }: PlanningConfigurationsProps) {
  return (
    <>
      {/* Global Planning Configuration */}
      <ConfigurationSection
        Component={GlobalPlanningConfiguration}
        componentProps={{ startOfIndependence }}
      />

      {/* Financial Goals Configuration */}
      <ConfigurationSection Component={FinancialGoalsConfiguration} />

      {/* Emergency Fund / Liquidity Reserve Configuration */}
      <ConfigurationSection Component={EmergencyFundConfiguration} />

      {/* Alimony / Child Support Configuration */}
      <ConfigurationSection Component={AlimonyConfiguration} />

      {/* Gift Tax Planning Configuration */}
      <ConfigurationSection Component={GiftTaxPlanningConfiguration} />

      {/* Generational Wealth Transfer Planning Configuration */}
      <ConfigurationSection Component={GenerationalWealthTransferConfiguration} />
    </>
  )
}
