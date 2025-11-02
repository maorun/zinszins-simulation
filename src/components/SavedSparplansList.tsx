import type { ChangeEvent } from 'react'
import type { Sparplan } from '../utils/sparplan-utils'
import type { SimulationAnnualType } from '../utils/simulate'
import type { SingleFormValue, SparplanFormValue } from './SparplanEingabe.helpers'
import { SavedSparplansListHeader } from './SavedSparplansListHeader'
import { SavedSparplansListDescription } from './SavedSparplansListDescription'
import { SavedSparplansListContent } from './SavedSparplansListContent'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'

interface SavedSparplansListProps {
  sparplans: Sparplan[]
  simulationAnnual: SimulationAnnualType
  isEditMode: boolean
  editingSparplan: Sparplan | null
  sparplanFormValues: SparplanFormValue
  singleFormValue: SingleFormValue
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (
    e: ChangeEvent<HTMLInputElement>,
    format: string,
    onChange: (date: Date | null) => void,
  ) => void
  onEdit: (sparplan: Sparplan) => void
  onDelete: (id: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onSparplanFormChange: (values: SparplanFormValue) => void
  onSingleFormChange: (value: SingleFormValue) => void
}

export function SavedSparplansList({
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
}: SavedSparplansListProps) {
  return (
    <Card className="mb-6">
      <Collapsible defaultOpen={true}>
        <SavedSparplansListHeader />
        <CollapsibleContent>
          <CardContent className="pt-0">
            <SavedSparplansListDescription />
            <SavedSparplansListContent
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
