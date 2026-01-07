import { useMemo } from 'react'
import SavingsPlan from './SavingsPlan'
import { EmergencyFundSection } from './emergency-fund/EmergencyFundSection'
import { ScenarioManagement } from './ScenarioManagement'
import { useCurrentConfiguration } from '../hooks/useCurrentConfiguration'
import { useLoadSavedScenario } from '../hooks/useLoadSavedScenario'

/**
 * Sparen View - Core savings functionality
 * Includes emergency fund planning and savings plans with return configuration
 */
export function SparenView() {
  const getCurrentConfiguration = useCurrentConfiguration()
  const { handleLoadScenario } = useLoadSavedScenario()
  // Memoize current configuration to avoid unnecessary recalculations on every render
  const currentConfig = useMemo(() => getCurrentConfiguration(), [getCurrentConfiguration])

  return (
    <div className="space-y-4">
      {/* Scenario Management - Save and Load Configurations */}
      <ScenarioManagement currentConfiguration={currentConfig} onLoadScenario={handleLoadScenario} />

      {/* Emergency Fund & Liquidity Planning */}
      <EmergencyFundSection />

      {/* Savings Plan with Returns and Risk Assessment */}
      <SavingsPlan />
    </div>
  )
}
