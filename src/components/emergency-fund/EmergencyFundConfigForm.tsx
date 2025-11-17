import {
  getEmploymentTypeLabel,
  getReserveStrategyLabel,
  getReserveStrategyDescription,
  type EmploymentType,
  type ReserveStrategy,
} from '../../../helpers/emergency-fund'
import { Label } from '../ui/label'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import { formatCurrency } from '../../utils/currency'

interface EmergencyFundConfigFormProps {
  monthlyExpenses: number
  targetMonths: number
  employmentType: EmploymentType
  reserveStrategy: ReserveStrategy
  excludeFromInvestment: boolean
  recommendedMonths: number
  onMonthlyExpensesChange: (value: number[]) => void
  onTargetMonthsChange: (value: number[]) => void
  onEmploymentTypeChange: (value: string) => void
  onReserveStrategyChange: (value: string) => void
  onExcludeFromInvestmentChange: (checked: boolean) => void
}

function MonthlyExpensesSlider({
  monthlyExpenses,
  onMonthlyExpensesChange,
}: {
  monthlyExpenses: number
  onMonthlyExpensesChange: (value: number[]) => void
}) {
  return (
    <div className="space-y-2">
      <Label>
        Monatliche Ausgaben: <strong>{formatCurrency(monthlyExpenses)}</strong>
      </Label>
      <Slider
        min={500}
        max={10000}
        step={100}
        value={[monthlyExpenses]}
        onValueChange={onMonthlyExpensesChange}
        className="w-full"
      />
      <p className="text-xs text-gray-600">
        Durchschnittliche monatliche Lebenshaltungskosten (Miete, Essen, Versicherungen, etc.)
      </p>
    </div>
  )
}

function EmploymentTypeRadios({
  employmentType,
  onEmploymentTypeChange,
}: {
  employmentType: EmploymentType
  onEmploymentTypeChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>Beschäftigungsstatus</Label>
      <RadioTileGroup
        value={employmentType}
        onValueChange={onEmploymentTypeChange}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <RadioTile value="employee" label={getEmploymentTypeLabel('employee')}>
          <p className="text-xs text-gray-600">3-6 Monate empfohlen</p>
        </RadioTile>
        <RadioTile value="self-employed" label={getEmploymentTypeLabel('self-employed')}>
          <p className="text-xs text-gray-600">6-12 Monate empfohlen</p>
        </RadioTile>
        <RadioTile value="retired" label={getEmploymentTypeLabel('retired')}>
          <p className="text-xs text-gray-600">1-3 Monate empfohlen</p>
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}

function ReserveStrategyRadios({
  reserveStrategy,
  onReserveStrategyChange,
}: {
  reserveStrategy: ReserveStrategy
  onReserveStrategyChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>Reserve-Strategie</Label>
      <RadioTileGroup
        value={reserveStrategy}
        onValueChange={onReserveStrategyChange}
        className="grid grid-cols-1 gap-3"
      >
        <RadioTile value="conservative" label={getReserveStrategyLabel('conservative')}>
          <p className="text-xs text-gray-600">{getReserveStrategyDescription('conservative')}</p>
        </RadioTile>
        <RadioTile value="balanced" label={getReserveStrategyLabel('balanced')}>
          <p className="text-xs text-gray-600">{getReserveStrategyDescription('balanced')}</p>
        </RadioTile>
        <RadioTile value="aggressive" label={getReserveStrategyLabel('aggressive')}>
          <p className="text-xs text-gray-600">{getReserveStrategyDescription('aggressive')}</p>
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}

function TargetMonthsSlider({
  targetMonths,
  recommendedMonths,
  onTargetMonthsChange,
}: {
  targetMonths: number
  recommendedMonths: number
  onTargetMonthsChange: (value: number[]) => void
}) {
  return (
    <div className="space-y-2">
      <Label>
        Ziel-Monate: <strong>{targetMonths} Monate</strong>
        {targetMonths !== recommendedMonths && (
          <span className="text-xs text-blue-600 ml-2">(Empfohlen: {recommendedMonths} Monate)</span>
        )}
      </Label>
      <Slider
        min={1}
        max={24}
        step={1}
        value={[targetMonths]}
        onValueChange={onTargetMonthsChange}
        className="w-full"
      />
      <p className="text-xs text-gray-600">
        Anzahl der Monate, die Ihre Notfallreserve abdecken soll. Basierend auf Ihrem Beschäftigungsstatus und Ihrer
        Strategie empfehlen wir {recommendedMonths} Monate.
      </p>
    </div>
  )
}

export function EmergencyFundConfigForm({
  monthlyExpenses,
  targetMonths,
  employmentType,
  reserveStrategy,
  excludeFromInvestment,
  recommendedMonths,
  onMonthlyExpensesChange,
  onTargetMonthsChange,
  onEmploymentTypeChange,
  onReserveStrategyChange,
  onExcludeFromInvestmentChange,
}: EmergencyFundConfigFormProps) {
  return (
    <>
      <MonthlyExpensesSlider monthlyExpenses={monthlyExpenses} onMonthlyExpensesChange={onMonthlyExpensesChange} />
      <EmploymentTypeRadios employmentType={employmentType} onEmploymentTypeChange={onEmploymentTypeChange} />
      <ReserveStrategyRadios reserveStrategy={reserveStrategy} onReserveStrategyChange={onReserveStrategyChange} />
      <TargetMonthsSlider
        targetMonths={targetMonths}
        recommendedMonths={recommendedMonths}
        onTargetMonthsChange={onTargetMonthsChange}
      />
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Switch
            id="exclude-from-investment"
            checked={excludeFromInvestment}
            onCheckedChange={onExcludeFromInvestmentChange}
          />
          <div className="flex-1">
            <Label htmlFor="exclude-from-investment" className="font-semibold">
              Notfallfonds von Investitionen ausschließen
            </Label>
            <p className="text-xs text-gray-700 mt-1">
              Wenn aktiviert, wird der Notfallfonds von den für Investitionen verfügbaren Mitteln abgezogen. Der
              Notfallfonds sollte separat gehalten werden (z.B. Tagesgeldkonto) und nicht in risikobehaftete Anlagen
              investiert werden.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
