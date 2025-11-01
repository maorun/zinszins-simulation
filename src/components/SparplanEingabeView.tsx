import React from 'react'
import type { Sparplan } from '../utils/sparplan-utils'
import type { SimulationAnnualType } from '../utils/simulate'
import type { SingleFormValue, SparplanFormValue } from './SparplanEingabe.helpers'
import { SparplanForms } from './SparplanForms'
import { SavedSparplansList } from './SavedSparplansList'

interface SparplanEingabeViewProps {
  // Form states
  isSparplanFormOpen: boolean
  setIsSparplanFormOpen: (open: boolean) => void
  sparplanFormValues: SparplanFormValue
  setSparplanFormValues: (values: SparplanFormValue) => void
  isSingleFormOpen: boolean
  setIsSingleFormOpen: (open: boolean) => void
  singleFormValue: SingleFormValue
  setSingleFormValue: (value: SingleFormValue) => void

  // Edit state
  isEditMode: boolean
  editingSparplan: Sparplan | null

  // Data
  sparplans: Sparplan[]
  simulationAnnual: SimulationAnnualType

  // Handlers
  handleSparplanSubmit: () => void
  handleSinglePaymentSubmit: () => void
  handleDeleteSparplan: (id: number) => void
  handleEditSparplan: (sparplan: Sparplan) => void
  handleSaveEdit: () => void
  handleCancelEdit: () => void

  // Utilities
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    onChange: (date: Date | null) => void,
  ) => void
  handleNumberChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) => void
  isEditingSparplan: (editingSparplan: Sparplan | null) => boolean
  isEditingSinglePayment: (editingSparplan: Sparplan | null) => boolean
}

// eslint-disable-next-line max-lines-per-function -- View component with multiple form props
export function SparplanEingabeView({
  isSparplanFormOpen,
  setIsSparplanFormOpen,
  sparplanFormValues,
  setSparplanFormValues,
  isSingleFormOpen,
  setIsSingleFormOpen,
  singleFormValue,
  setSingleFormValue,
  isEditMode,
  editingSparplan,
  sparplans,
  simulationAnnual,
  handleSparplanSubmit,
  handleSinglePaymentSubmit,
  handleDeleteSparplan,
  handleEditSparplan,
  handleSaveEdit,
  handleCancelEdit,
  formatDateForInput,
  handleDateChange,
  handleNumberChange,
  isEditingSparplan,
  isEditingSinglePayment,
}: SparplanEingabeViewProps) {
  return (
    <div className="space-y-4">
      <SparplanForms
        isSparplanFormOpen={isSparplanFormOpen}
        setIsSparplanFormOpen={setIsSparplanFormOpen}
        sparplanFormValues={sparplanFormValues}
        setSparplanFormValues={setSparplanFormValues}
        handleSparplanSubmit={handleSparplanSubmit}
        isSparplanEditMode={isEditMode && isEditingSparplan(editingSparplan)}
        showSparplanCancelButton={isEditMode && isEditingSparplan(editingSparplan)}
        isSingleFormOpen={isSingleFormOpen}
        setIsSingleFormOpen={setIsSingleFormOpen}
        singleFormValue={singleFormValue}
        setSingleFormValue={setSingleFormValue}
        handleSinglePaymentSubmit={handleSinglePaymentSubmit}
        isSingleEditMode={isEditMode && isEditingSinglePayment(editingSparplan)}
        showSingleCancelButton={isEditMode && isEditingSinglePayment(editingSparplan)}
        simulationAnnual={simulationAnnual}
        formatDateForInput={formatDateForInput}
        handleDateChange={handleDateChange}
        handleNumberChange={handleNumberChange}
        handleCancelEdit={handleCancelEdit}
      />

      <SavedSparplansList
        sparplans={sparplans}
        simulationAnnual={simulationAnnual}
        isEditMode={isEditMode}
        editingSparplan={editingSparplan}
        sparplanFormValues={sparplanFormValues}
        singleFormValue={singleFormValue}
        formatDateForInput={formatDateForInput}
        handleDateChange={handleDateChange}
        onEdit={handleEditSparplan}
        onDelete={handleDeleteSparplan}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onSparplanFormChange={setSparplanFormValues}
        onSingleFormChange={setSingleFormValue}
      />
    </div>
  )
}
