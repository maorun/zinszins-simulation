import { lazy } from 'react'
import { CollapsibleCategory } from './CollapsibleCategory'
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
    <CollapsibleCategory
      title="Finanzplanung & Lebenssituationen"
      icon="💼"
      defaultOpen={false}
      nestingLevel={0}
    >
      {/* 👥 Globale Planung */}
      <ConfigurationSection
        Component={GlobalPlanningConfiguration}
        componentProps={{ startOfIndependence }}
      />

      {/* Finanzziele */}
      <ConfigurationSection Component={FinancialGoalsConfiguration} />

      {/* Liquiditätsreserve / Notfallfonds */}
      <ConfigurationSection Component={EmergencyFundConfiguration} />

      {/* Unterhaltszahlungen */}
      <ConfigurationSection Component={AlimonyConfiguration} />

      {/* Schenkungssteuer-Planung */}
      <ConfigurationSection Component={GiftTaxPlanningConfiguration} />

      {/* Generationenübergreifende Vermögensplanung */}
      <ConfigurationSection Component={GenerationalWealthTransferConfiguration} />
    </CollapsibleCategory>
  )
}
