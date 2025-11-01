import React from 'react'
import type { SimulationAnnualType } from '../utils/simulate'
import type { SingleFormValue, SparplanFormValue } from './SparplanEingabe.helpers'
import { SparplanFormCard } from './SparplanFormCard'
import { SinglePaymentFormCard } from './SinglePaymentFormCard'

interface SparplanFormsProps {
  // Sparplan form props
  isSparplanFormOpen: boolean
  setIsSparplanFormOpen: (open: boolean) => void
  sparplanFormValues: SparplanFormValue
  setSparplanFormValues: (values: SparplanFormValue) => void
  handleSparplanSubmit: () => void
  isSparplanEditMode: boolean
  showSparplanCancelButton: boolean

  // Single payment form props
  isSingleFormOpen: boolean
  setIsSingleFormOpen: (open: boolean) => void
  singleFormValue: SingleFormValue
  setSingleFormValue: (value: SingleFormValue) => void
  handleSinglePaymentSubmit: () => void
  isSingleEditMode: boolean
  showSingleCancelButton: boolean

  // Shared props
  simulationAnnual: SimulationAnnualType
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
  handleCancelEdit: () => void
}

// eslint-disable-next-line max-lines-per-function -- Form wrapper component with multiple form props
export function SparplanForms({
  isSparplanFormOpen,
  setIsSparplanFormOpen,
  sparplanFormValues,
  setSparplanFormValues,
  handleSparplanSubmit,
  isSparplanEditMode,
  showSparplanCancelButton,
  isSingleFormOpen,
  setIsSingleFormOpen,
  singleFormValue,
  setSingleFormValue,
  handleSinglePaymentSubmit,
  isSingleEditMode,
  showSingleCancelButton,
  simulationAnnual,
  formatDateForInput,
  handleDateChange,
  handleNumberChange,
  handleCancelEdit,
}: SparplanFormsProps) {
  return (
    <>
      <SparplanFormCard
        isOpen={isSparplanFormOpen}
        onOpenChange={setIsSparplanFormOpen}
        formValues={sparplanFormValues}
        simulationAnnual={simulationAnnual}
        onFormChange={setSparplanFormValues}
        formatDateForInput={formatDateForInput}
        handleDateChange={handleDateChange}
        handleNumberChange={handleNumberChange}
        onSubmit={handleSparplanSubmit}
        isEditMode={isSparplanEditMode}
        showCancelButton={showSparplanCancelButton}
        onCancel={handleCancelEdit}
      />

      <SinglePaymentFormCard
        isOpen={isSingleFormOpen}
        onOpenChange={setIsSingleFormOpen}
        formValues={singleFormValue}
        onFormChange={setSingleFormValue}
        formatDateForInput={formatDateForInput}
        handleDateChange={handleDateChange}
        handleNumberChange={handleNumberChange}
        onSubmit={handleSinglePaymentSubmit}
        isEditMode={isSingleEditMode}
        showCancelButton={showSingleCancelButton}
        onCancel={handleCancelEdit}
      />
    </>
  )
}
