import type { OtherIncomeSource } from '../../../helpers/other-income'
import { IncomeSourceCard } from './IncomeSourceCard'

interface OtherIncomeSourceListProps {
  sources: OtherIncomeSource[]
  onSourceChange: (sourceId: string, updates: Partial<OtherIncomeSource>) => void
  onEditSource: (source: OtherIncomeSource) => void
  onDeleteSource: (sourceId: string) => void
  editingSource: OtherIncomeSource | null
}

export function OtherIncomeSourceList({
  sources,
  onSourceChange,
  onEditSource,
  onDeleteSource,
  editingSource,
}: OtherIncomeSourceListProps) {
  if (sources.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Konfigurierte Einkommensquellen</h3>
      {sources.map((source) => (
        <IncomeSourceCard
          key={source.id}
          source={source}
          onSourceChange={onSourceChange}
          onEditSource={onEditSource}
          onDeleteSource={onDeleteSource}
          editingSource={editingSource}
        />
      ))}
    </div>
  )
}
