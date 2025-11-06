import type { OtherIncomeSource } from '../../../helpers/other-income'
import { OtherIncomeAddButton } from './OtherIncomeAddButton'
import { OtherIncomeSourceFormEditor } from './OtherIncomeSourceFormEditor'
import { OtherIncomeSourceList } from './OtherIncomeSourceList'
import { OtherIncomeEmptyState } from './OtherIncomeEmptyState'

interface OtherIncomeContentProps {
  sources: OtherIncomeSource[]
  editingSource: OtherIncomeSource | null
  isAddingNew: boolean
  onAddSource: () => void
  onSourceChange: (sourceId: string, updates: Partial<OtherIncomeSource>) => void
  onEditSource: (source: OtherIncomeSource) => void
  onDeleteSource: (sourceId: string) => void
  onUpdateEditingSource: (source: OtherIncomeSource) => void
  onSaveSource: () => void
  onCancelEdit: () => void
}

export function OtherIncomeContent({
  sources,
  editingSource,
  isAddingNew,
  onAddSource,
  onSourceChange,
  onEditSource,
  onDeleteSource,
  onUpdateEditingSource,
  onSaveSource,
  onCancelEdit,
}: OtherIncomeContentProps) {
  return (
    <>
      <OtherIncomeAddButton onAdd={onAddSource} disabled={editingSource !== null} />

      {editingSource && (
        <OtherIncomeSourceFormEditor
          editingSource={editingSource}
          isAddingNew={isAddingNew}
          onUpdate={onUpdateEditingSource}
          onSave={onSaveSource}
          onCancel={onCancelEdit}
        />
      )}

      <OtherIncomeSourceList
        sources={sources}
        onSourceChange={onSourceChange}
        onEditSource={onEditSource}
        onDeleteSource={onDeleteSource}
        editingSource={editingSource}
      />

      <OtherIncomeEmptyState show={sources.length === 0 && !editingSource} />
    </>
  )
}
