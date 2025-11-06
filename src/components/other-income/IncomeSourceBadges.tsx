import { Switch } from '../ui/switch'
import {
  type OtherIncomeSource,
  getIncomeTypeDisplayName,
  getAmountTypeDisplayName,
} from '../../../helpers/other-income'

interface IncomeSourceBadgesProps {
  source: OtherIncomeSource
  onEnabledChange: (enabled: boolean) => void
}

export function IncomeSourceBadges({ source, onEnabledChange }: IncomeSourceBadgesProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs px-2 py-1 bg-gray-100 rounded whitespace-nowrap">
        {getIncomeTypeDisplayName(source.type)}
      </span>
      <span
        className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
          source.amountType === 'gross' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}
      >
        {getAmountTypeDisplayName(source.amountType)}
      </span>
      <div className="flex items-center">
        <Switch checked={source.enabled} onCheckedChange={onEnabledChange} />
      </div>
    </div>
  )
}
