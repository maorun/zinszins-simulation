import React from 'react'
import type { Sparplan } from '../utils/sparplan-utils'
import type { SimulationAnnualType } from '../utils/simulate'
import type { SingleFormValue, SparplanFormValue } from './SparplanEingabe.helpers'

/**
 * Helper to compute sparplan form props for SparplanForms component
 */
export function getSparplanFormProps(
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  formValues: SparplanFormValue,
  setFormValues: (values: SparplanFormValue) => void,
  handleSubmit: () => void,
  isEditMode: boolean,
  editingSparplan: Sparplan | null,
  isEditingSparplan: (sparplan: Sparplan | null) => boolean,
) {
  const isSparplanEdit = isEditMode && isEditingSparplan(editingSparplan)
  return {
    isOpen,
    setIsOpen,
    formValues,
    setFormValues,
    handleSubmit,
    isEditMode: isSparplanEdit,
    showCancelButton: isSparplanEdit,
  }
}

/**
 * Helper to compute single payment form props for SparplanForms component
 */
export function getSinglePaymentFormProps(
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  formValues: SingleFormValue,
  setFormValues: (value: SingleFormValue) => void,
  handleSubmit: () => void,
  isEditMode: boolean,
  editingSparplan: Sparplan | null,
  isEditingSinglePayment: (sparplan: Sparplan | null) => boolean,
) {
  const isSinglePaymentEdit = isEditMode && isEditingSinglePayment(editingSparplan)
  return {
    isOpen,
    setIsOpen,
    formValues,
    setFormValues,
    handleSubmit,
    isEditMode: isSinglePaymentEdit,
    showCancelButton: isSinglePaymentEdit,
  }
}

/**
 * Helper to compute shared utilities props for SparplanForms component
 */
export function getSharedUtilitiesProps(
  simulationAnnual: SimulationAnnualType,
  formatDateForInput: (date: Date | string | null, format: string) => string,
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    onChange: (date: Date | null) => void,
  ) => void,
  handleNumberChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) => void,
  handleCancelEdit: () => void,
) {
  return {
    simulationAnnual,
    formatDateForInput,
    handleDateChange,
    handleNumberChange,
    handleCancelEdit,
  }
}

/**
 * Helper to compute saved sparplans list props for SavedSparplansList component
 */
export function getSavedSparplansListProps(
  sparplans: Sparplan[],
  simulationAnnual: SimulationAnnualType,
  isEditMode: boolean,
  editingSparplan: Sparplan | null,
  sparplanFormValues: SparplanFormValue,
  singleFormValue: SingleFormValue,
  formatDateForInput: (date: Date | string | null, format: string) => string,
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    onChange: (date: Date | null) => void,
  ) => void,
  handleEditSparplan: (sparplan: Sparplan) => void,
  handleDeleteSparplan: (id: number) => void,
  handleSaveEdit: () => void,
  handleCancelEdit: () => void,
  setSparplanFormValues: (values: SparplanFormValue) => void,
  setSingleFormValue: (value: SingleFormValue) => void,
) {
  return {
    sparplans,
    simulationAnnual,
    isEditMode,
    editingSparplan,
    sparplanFormValues,
    singleFormValue,
    formatDateForInput,
    handleDateChange,
    onEdit: handleEditSparplan,
    onDelete: handleDeleteSparplan,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: handleCancelEdit,
    onSparplanFormChange: setSparplanFormValues,
    onSingleFormChange: setSingleFormValue,
  }
}

// Interface for view props
export interface SparplanEingabeViewProps {
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

/**
 * Compute all props needed for the view components
 */
export function computeViewProps(props: SparplanEingabeViewProps) {
  return {
    sparplanForm: getSparplanFormProps(
      props.isSparplanFormOpen,
      props.setIsSparplanFormOpen,
      props.sparplanFormValues,
      props.setSparplanFormValues,
      props.handleSparplanSubmit,
      props.isEditMode,
      props.editingSparplan,
      props.isEditingSparplan,
    ),
    singlePaymentForm: getSinglePaymentFormProps(
      props.isSingleFormOpen,
      props.setIsSingleFormOpen,
      props.singleFormValue,
      props.setSingleFormValue,
      props.handleSinglePaymentSubmit,
      props.isEditMode,
      props.editingSparplan,
      props.isEditingSinglePayment,
    ),
    sharedUtilities: getSharedUtilitiesProps(
      props.simulationAnnual,
      props.formatDateForInput,
      props.handleDateChange,
      props.handleNumberChange,
      props.handleCancelEdit,
    ),
    savedSparplansList: getSavedSparplansListProps(
      props.sparplans,
      props.simulationAnnual,
      props.isEditMode,
      props.editingSparplan,
      props.sparplanFormValues,
      props.singleFormValue,
      props.formatDateForInput,
      props.handleDateChange,
      props.handleEditSparplan,
      props.handleDeleteSparplan,
      props.handleSaveEdit,
      props.handleCancelEdit,
      props.setSparplanFormValues,
      props.setSingleFormValue,
    ),
  }
}
