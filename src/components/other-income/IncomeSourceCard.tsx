import { Card, CardContent } from '../ui/card'
import type { OtherIncomeSource } from '../../../helpers/other-income'
import { IncomeSourceBadges } from './IncomeSourceBadges'
import { IncomeSourceDetails } from './IncomeSourceDetails'
import { IncomeSourceActions } from './IncomeSourceActions'

interface IncomeSourceCardProps {
  source: OtherIncomeSource
  onSourceChange: (sourceId: string, updates: Partial<OtherIncomeSource>) => void
  onEditSource: (source: OtherIncomeSource) => void
  onDeleteSource: (sourceId: string) => void
  editingSource: OtherIncomeSource | null
}

export function IncomeSourceCard({
  source,
  onSourceChange,
  onEditSource,
  onDeleteSource,
  editingSource,
}: IncomeSourceCardProps) {
  return (
    <Card key={source.id} className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            {/* Title and badges - stacked on mobile, inline on desktop */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h4 className="font-medium text-base">{source.name}</h4>
              <IncomeSourceBadges
                source={source}
                onEnabledChange={enabled => onSourceChange(source.id, { enabled })}
              />
            </div>
            <IncomeSourceDetails source={source} />
          </div>
          {/* Action buttons - better positioned for mobile */}
          <IncomeSourceActions
            onEdit={() => onEditSource(source)}
            onDelete={() => onDeleteSource(source.id)}
            editingDisabled={editingSource !== null}
          />
        </div>
      </CardContent>
    </Card>
  )
}
