import type { ChangeEvent } from 'react'
import type { SimulationAnnualType } from '../utils/simulate'
import type { SingleFormValue, SparplanFormValue } from './SparplanEingabe.helpers'
import { SparplanFormCard } from './SparplanFormCard'
import { SinglePaymentFormCard } from './SinglePaymentFormCard'

interface SparplanFormProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  formValues: SparplanFormValue
  setFormValues: (values: SparplanFormValue) => void
  handleSubmit: () => void
  isEditMode: boolean
  showCancelButton: boolean
}

interface SinglePaymentFormProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  formValues: SingleFormValue
  setFormValues: (value: SingleFormValue) => void
  handleSubmit: () => void
  isEditMode: boolean
  showCancelButton: boolean
}

interface SharedFormUtilities {
  simulationAnnual: SimulationAnnualType
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (e: ChangeEvent<HTMLInputElement>, format: string, onChange: (date: Date | null) => void) => void
  handleNumberChange: (e: ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => void
  handleCancelEdit: () => void
}

interface SparplanFormsProps {
  sparplanForm: SparplanFormProps
  singlePaymentForm: SinglePaymentFormProps
  sharedUtilities: SharedFormUtilities
}

export function SparplanForms({ sparplanForm, singlePaymentForm, sharedUtilities }: SparplanFormsProps) {
  return (
    <>
      <SparplanFormCard
        isOpen={sparplanForm.isOpen}
        onOpenChange={sparplanForm.setIsOpen}
        formValues={sparplanForm.formValues}
        simulationAnnual={sharedUtilities.simulationAnnual}
        onFormChange={sparplanForm.setFormValues}
        formatDateForInput={sharedUtilities.formatDateForInput}
        handleDateChange={sharedUtilities.handleDateChange}
        handleNumberChange={sharedUtilities.handleNumberChange}
        onSubmit={sparplanForm.handleSubmit}
        isEditMode={sparplanForm.isEditMode}
        showCancelButton={sparplanForm.showCancelButton}
        onCancel={sharedUtilities.handleCancelEdit}
      />

      <SinglePaymentFormCard
        isOpen={singlePaymentForm.isOpen}
        onOpenChange={singlePaymentForm.setIsOpen}
        formValues={singlePaymentForm.formValues}
        onFormChange={singlePaymentForm.setFormValues}
        formatDateForInput={sharedUtilities.formatDateForInput}
        handleDateChange={sharedUtilities.handleDateChange}
        handleNumberChange={sharedUtilities.handleNumberChange}
        onSubmit={singlePaymentForm.handleSubmit}
        isEditMode={singlePaymentForm.isEditMode}
        showCancelButton={singlePaymentForm.showCancelButton}
        onCancel={sharedUtilities.handleCancelEdit}
      />
    </>
  )
}
