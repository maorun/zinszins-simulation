import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react'
import { EmergencyFundConfigForm } from './EmergencyFundConfigForm'
import { EmergencyFundStatusDisplay } from './EmergencyFundStatusDisplay'
import { MultiTierLiquidityDisplay } from './MultiTierLiquidityDisplay'
import { useEmergencyFund } from './useEmergencyFund'
import { generateFormId } from '../../utils/unique-id'

function InformationBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm text-gray-700">
          <p className="font-semibold mb-1">Was ist ein Notgroschen?</p>
          <p>
            Ein Notgroschen ist eine finanzielle Reserve für unerwartete Ausgaben (z.B. Autoreparatur, defekte
            Waschmaschine, medizinische Notfälle). Er sollte separat von Investitionen gehalten werden, typischerweise
            auf einem Tagesgeldkonto, um jederzeit verfügbar zu sein.
          </p>
        </div>
      </div>
    </div>
  )
}

function UnderfundedWarning() {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm text-gray-700">
          <p className="font-semibold mb-1">Empfehlung</p>
          <p>
            Bauen Sie zunächst Ihren Notgroschen auf, bevor Sie in risikobehaftete Anlagen investieren. Dies schützt
            Sie vor unerwarteten Ausgaben und verhindert, dass Sie Ihre Investitionen in ungünstigen Marktphasen
            verkaufen müssen.
          </p>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ enabled, onToggle }: { enabled: boolean; onToggle: (checked: boolean) => void }) {
  const enabledSwitchId = useMemo(() => generateFormId('emergency-fund', 'enabled'), [])

  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">💰 Notgroschen & Liquiditätsplanung</CardTitle>
            <Switch id={enabledSwitchId} checked={enabled} onCheckedChange={onToggle} />
            <Label htmlFor={enabledSwitchId} className="sr-only">
              Notgroschen-Planung aktivieren
            </Label>
          </div>
          <CardDescription className="mt-2">
            Planen Sie Ihren Notfallfonds und Liquiditätsreserven nach deutschen Finanzplanungs-Standards
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}

interface ConfigurationSectionProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  config: ReturnType<typeof useEmergencyFund>['config']
  recommendedMonths: number
  handleMonthlyExpensesChange: (value: number[]) => void
  handleTargetMonthsChange: (value: number[]) => void
  handleEmploymentTypeChange: (value: string) => void
  handleReserveStrategyChange: (value: string) => void
  handleExcludeFromInvestmentChange: (checked: boolean) => void
}

function ConfigurationSection({
  isOpen,
  setIsOpen,
  config,
  recommendedMonths,
  handleMonthlyExpensesChange,
  handleTargetMonthsChange,
  handleEmploymentTypeChange,
  handleReserveStrategyChange,
  handleExcludeFromInvestmentChange,
}: ConfigurationSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
        <span className="font-semibold text-gray-900">Konfiguration anpassen</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-4">
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
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * Emergency Fund Section Component
 * Main section for emergency fund/liquidity reserve planning in the Sparen view
 */
export function EmergencyFundSection() {
  const [isOpen, setIsOpen] = useState(false)
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
    <Card className="shadow-md">
      <SectionHeader enabled={config.enabled} onToggle={handleToggleEnabled} />

      {config.enabled && (
        <CardContent className="space-y-4">
          <InformationBanner />
          <EmergencyFundStatusDisplay currentCapital={currentCapital} fundStatus={fundStatus} />
          {!fundStatus.isFunded && <UnderfundedWarning />}
          <ConfigurationSection
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            config={config}
            recommendedMonths={recommendedMonths}
            handleMonthlyExpensesChange={handleMonthlyExpensesChange}
            handleTargetMonthsChange={handleTargetMonthsChange}
            handleEmploymentTypeChange={handleEmploymentTypeChange}
            handleReserveStrategyChange={handleReserveStrategyChange}
            handleExcludeFromInvestmentChange={handleExcludeFromInvestmentChange}
          />
          {fundStatus.isFunded && (
            <MultiTierLiquidityDisplay targetAmount={fundStatus.targetAmount} reserveStrategy={config.reserveStrategy} />
          )}
        </CardContent>
      )}
    </Card>
  )
}
