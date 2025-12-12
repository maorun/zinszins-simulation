import { Wallet } from 'lucide-react'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { CardDescription } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { EmergencyFundStatusDisplay } from './emergency-fund/EmergencyFundStatusDisplay'
import { EmergencyFundConfigForm } from './emergency-fund/EmergencyFundConfigForm'
import { useEmergencyFund } from './emergency-fund/useEmergencyFund'

function EmergencyFundHeader() {
  return (
    <CollapsibleCardHeader titleClassName="text-lg sm:text-xl font-bold flex items-center gap-2">
      <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
      Liquiditätsreserve / Notfallfonds
    </CollapsibleCardHeader>
  )
}

/**
 * Emergency Fund Configuration Component
 * Allows users to plan and track their emergency fund (Notfallreserve)
 */
export default function EmergencyFundConfiguration() {
  const {
    config,
    fundStatus,
    currentCapital,
    recommendedMonths,
    handleToggleEnabled,
    handleMonthlyExpensesChange,
    handleTargetMonthsChange,
    handleEmploymentTypeChange,
    handleReserveStrategyChange,
    handleExcludeFromInvestmentChange,
  } = useEmergencyFund()

  return (
    <CollapsibleCard>
      <EmergencyFundHeader />
      <CollapsibleCardContent>
        <div className="space-y-6">
          <CardDescription>
            Planen Sie Ihre finanzielle Notfallreserve nach deutschen Standards
          </CardDescription>

          <div className="flex items-center space-x-2">
            <Switch id="emergency-fund-enabled" checked={config.enabled} onCheckedChange={handleToggleEnabled} />
            <Label htmlFor="emergency-fund-enabled">Notfallfonds-Planung aktivieren</Label>
          </div>

          {config.enabled && (
            <>
              <EmergencyFundStatusDisplay currentCapital={currentCapital} fundStatus={fundStatus} />
              <EmergencyFundConfigForm
                monthlyExpenses={config.monthlyExpenses}
                targetMonths={config.targetMonths}
                employmentType={config.employmentType}
                reserveStrategy={config.reserveStrategy}
                excludeFromInvestment={config.excludeFromInvestment}
                recommendedMonths={recommendedMonths}
                onMonthlyExpensesChange={handleMonthlyExpensesChange}
                onTargetMonthsChange={handleTargetMonthsChange}
                onEmploymentTypeChange={handleEmploymentTypeChange}
                onReserveStrategyChange={handleReserveStrategyChange}
                onExcludeFromInvestmentChange={handleExcludeFromInvestmentChange}
              />
            </>
          )}
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
