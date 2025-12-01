import SavingsPlan from './SavingsPlan'

/**
 * Sparen View - Core savings functionality
 * Includes only savings plans and return configuration
 */
export function SparenView() {
  return (
    <div className="space-y-4">
      {/* Savings Plan with Returns and Risk Assessment */}
      <SavingsPlan />
    </div>
  )
}
