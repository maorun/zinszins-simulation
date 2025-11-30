import WithdrawalPlan from './WithdrawalPlan'

/**
 * Entnahme View - All withdrawal-related functionality
 * Includes intelligent withdrawal strategies and simulations
 */
export function EntnahmeView() {
  return (
    <div className="space-y-4">
      {/* Withdrawal Plan with Strategies and Risk Assessment */}
      <WithdrawalPlan />
    </div>
  )
}
