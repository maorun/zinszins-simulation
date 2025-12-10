import React from 'react'
import { SimulationAnnualType } from '../../utils/simulate'
import type { Sparplan } from '../../utils/sparplan-utils'
import type { SingleFormValue, SparplanFormValue } from '../SparplanEingabe.helpers'
import { SparplanCard } from './SparplanCard'

interface SparplanListProps {
  sparplans: Sparplan[]
  simulationAnnual: SimulationAnnualType
  isEditMode: boolean
  editingSparplan: Sparplan | null
  sparplanFormValues: SparplanFormValue
  singleFormValue: SingleFormValue
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    callback: (date: Date | null) => void,
  ) => void
  onEdit: (sparplan: Sparplan) => void
  onDelete: (id: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onSparplanFormChange: (values: SparplanFormValue) => void
  onSingleFormChange: (values: SingleFormValue) => void
}

/**
 * Displays list of sparplans and single payments
 * Complexity: <8, Lines: <50
 */
export function SparplanList(props: SparplanListProps) {
  const { sparplans, ...cardProps } = props

  if (sparplans.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600 italic">
        Noch keine Sparpläne oder Einmalzahlungen erstellt. Fügen Sie oben einen Sparplan oder eine Einmalzahlung hinzu.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {sparplans.map(sparplan => (
        <SparplanCard key={sparplan.id} sparplan={sparplan} {...cardProps} />
      ))}
    </div>
  )
}
