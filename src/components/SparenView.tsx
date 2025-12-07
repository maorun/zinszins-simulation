import SavingsPlan from './SavingsPlan'
import { EmergencyFundSection } from './emergency-fund/EmergencyFundSection'

/**
 * Sparen View - Core savings functionality
 * Includes emergency fund planning and savings plans with return configuration
 */
export function SparenView() {
  return (
    <div className="space-y-4">
      {/* Emergency Fund & Liquidity Planning */}
      <EmergencyFundSection />

      {/* Savings Plan with Returns and Risk Assessment */}
      <SavingsPlan />
    </div>
  )
}
