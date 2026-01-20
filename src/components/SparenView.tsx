import { useMemo } from 'react'
import SavingsPlan from './SavingsPlan'
import { EmergencyFundSection } from './emergency-fund/EmergencyFundSection'
import { ScenarioManagement } from './ScenarioManagement'
import { MilestoneTrackerCard } from './MilestoneTrackerCard'
import { CustomGoalTrackerCard } from './CustomGoalTrackerCard'
import { useCurrentConfiguration } from '../hooks/useCurrentConfiguration'
import { useLoadSavedScenario } from '../hooks/useLoadSavedScenario'
import { useSimulation } from '../contexts/useSimulation'

/**
 * Sparen View - Core savings functionality
 * Includes emergency fund planning and savings plans with return configuration
 */
export function SparenView() {
  const getCurrentConfiguration = useCurrentConfiguration()
  const { handleLoadScenario } = useLoadSavedScenario()
  const { simulationData } = useSimulation()
  
  // Memoize current configuration to avoid unnecessary recalculations on every render
  const currentConfig = useMemo(() => getCurrentConfiguration(), [getCurrentConfiguration])

  return (
    <div className="space-y-4">
      {/* Scenario Management - Save and Load Configurations */}
      <ScenarioManagement currentConfiguration={currentConfig} onLoadScenario={handleLoadScenario} />

      {/* Financial Milestone Tracker */}
      <MilestoneTrackerCard simulationData={simulationData} />

      {/* Custom Goal Tracker - User-defined savings goals */}
      <CustomGoalTrackerCard simulationData={simulationData} />

      {/* Emergency Fund & Liquidity Planning */}
      <EmergencyFundSection />

      {/* Savings Plan with Returns and Risk Assessment */}
      <SavingsPlan />
    </div>
  )
}
