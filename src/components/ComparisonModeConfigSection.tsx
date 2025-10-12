import type { WithdrawalFormValue, ComparisonStrategy } from '../utils/config-storage'
import { ComparisonStrategyConfiguration } from './ComparisonStrategyConfiguration'

interface ComparisonModeConfigSectionProps {
  formValue: WithdrawalFormValue
  comparisonStrategies: ComparisonStrategy[]
  onUpdateFormValue: (value: Partial<WithdrawalFormValue>) => void
  onUpdateComparisonStrategy: (id: string, strategy: Partial<ComparisonStrategy>) => void
  onAddStrategy: () => void
  onRemoveStrategy: (id: string) => void
}

export function ComparisonModeConfigSection({
  formValue,
  comparisonStrategies,
  onUpdateFormValue,
  onUpdateComparisonStrategy,
  onAddStrategy,
  onRemoveStrategy,
}: ComparisonModeConfigSectionProps) {
  return (
    <ComparisonStrategyConfiguration
      formValue={formValue}
      comparisonStrategies={comparisonStrategies}
      onUpdateFormValue={onUpdateFormValue}
      onUpdateComparisonStrategy={onUpdateComparisonStrategy}
      onRemoveComparisonStrategy={onRemoveStrategy}
      onAddComparisonStrategy={onAddStrategy}
    />
  )
}
