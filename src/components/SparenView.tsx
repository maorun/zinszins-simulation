import SimulationParameters from './SimulationParameters'
import SavingsPlan from './SavingsPlan'

/**
 * Sparen View - Core savings functionality
 * Includes simulation parameters and savings plans
 */
export function SparenView() {
  return (
    <div className="space-y-4">
      {/* Simulation Parameters */}
      <SimulationParameters />

      {/* Savings Plan with Returns and Risk Assessment */}
      <SavingsPlan />
    </div>
  )
}
