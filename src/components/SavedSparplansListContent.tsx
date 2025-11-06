import type { ChangeEvent } from 'react'
import type { Sparplan } from '../utils/sparplan-utils'
import type { SimulationAnnualType } from '../utils/simulate'
import type { SingleFormValue, SparplanFormValue } from './SparplanEingabe.helpers'
import { SparplanList } from './sparplan-forms/SparplanList'

interface SavedSparplansListContentProps {
  sparplans: Sparplan[]
  simulationAnnual: SimulationAnnualType
  isEditMode: boolean
  editingSparplan: Sparplan | null
  sparplanFormValues: SparplanFormValue
  singleFormValue: SingleFormValue
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (e: ChangeEvent<HTMLInputElement>, format: string, onChange: (date: Date | null) => void) => void
  onEdit: (sparplan: Sparplan) => void
  onDelete: (id: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onSparplanFormChange: (values: SparplanFormValue) => void
  onSingleFormChange: (value: SingleFormValue) => void
}

/**
 * Content wrapper for SavedSparplansList
 * Wraps SparplanList with proper padding
 */
export function SavedSparplansListContent({
  sparplans,
  simulationAnnual,
  isEditMode,
  editingSparplan,
  sparplanFormValues,
  singleFormValue,
  formatDateForInput,
  handleDateChange,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onSparplanFormChange,
  onSingleFormChange,
}: SavedSparplansListContentProps) {
  return (
    <>
      <div className="p-4">
        <SparplanList
          sparplans={sparplans}
          simulationAnnual={simulationAnnual}
          isEditMode={isEditMode}
          editingSparplan={editingSparplan}
          sparplanFormValues={sparplanFormValues}
          singleFormValue={singleFormValue}
          formatDateForInput={formatDateForInput}
          handleDateChange={handleDateChange}
          onEdit={onEdit}
          onDelete={onDelete}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onSparplanFormChange={onSparplanFormChange}
          onSingleFormChange={onSingleFormChange}
        />
      </div>

      {/* Hidden Desktop Table Layout */}
      <div className="hidden">{/* Table functionality has been replaced with card layout above */}</div>
    </>
  )
}
