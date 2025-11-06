import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { SimulationAnnualType } from '../utils/simulate'
import type { Sparplan } from '../utils/sparplan-utils'
import {
  createNewSparplan,
  createNewSinglePayment,
  updateExistingSparplan,
  getInitialSingleFormValue,
  getInitialSparplanFormValue,
  populateSingleFormFromSparplan,
  populateSparplanFormFromSparplan,
  isEinmalzahlung,
  type SingleFormValue,
  type SparplanFormValue,
} from './SparplanEingabe.helpers'

/**
 * Hook for managing sparplan state
 */
export function useSparplanState(currentSparplans: Sparplan[]) {
  const [sparplans, setSparplans] = useState<Sparplan[]>(currentSparplans)
  const [singleFormValue, setSingleFormValue] = useState<SingleFormValue>(getInitialSingleFormValue())
  const [sparplanFormValues, setSparplanFormValues] = useState<SparplanFormValue>(getInitialSparplanFormValue())

  // Synchronize local state with prop changes
  useEffect(() => {
    setSparplans(currentSparplans)
  }, [currentSparplans])

  return {
    sparplans,
    setSparplans,
    singleFormValue,
    setSingleFormValue,
    sparplanFormValues,
    setSparplanFormValues,
  }
}

/**
 * Hook for managing edit state
 */
export function useEditState() {
  const [editingSparplan, setEditingSparplan] = useState<Sparplan | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSparplanFormOpen, setIsSparplanFormOpen] = useState(false)
  const [isSingleFormOpen, setIsSingleFormOpen] = useState(false)

  return {
    editingSparplan,
    setEditingSparplan,
    isEditMode,
    setIsEditMode,
    isSparplanFormOpen,
    setIsSparplanFormOpen,
    isSingleFormOpen,
    setIsSingleFormOpen,
  }
}

interface SparplanHandlersParams {
  sparplans: Sparplan[]
  setSparplans: (sparplans: Sparplan[]) => void
  dispatch: (val: Sparplan[]) => void
  sparplanFormValues: SparplanFormValue
  setSparplanFormValues: (values: SparplanFormValue) => void
  singleFormValue: SingleFormValue
  setSingleFormValue: (value: SingleFormValue) => void
  editingSparplan: Sparplan | null
  setEditingSparplan: (sparplan: Sparplan | null) => void
  isEditMode: boolean
  setIsEditMode: (mode: boolean) => void
  simulationAnnual: SimulationAnnualType
}

/**
 * Creates a handler for saving edits to an existing sparplan
 */
function createSaveEditHandler(params: SparplanHandlersParams) {
  const {
    editingSparplan,
    sparplanFormValues,
    singleFormValue,
    simulationAnnual,
    sparplans,
    setSparplans,
    dispatch,
    setEditingSparplan,
    setIsEditMode,
    setSparplanFormValues,
    setSingleFormValue,
  } = params

  return () => {
    if (!editingSparplan) return

    const changedSparplans = updateExistingSparplan({
      editingSparplan,
      sparplanFormValues,
      singleFormValues: singleFormValue,
      simulationAnnual,
      existingSparplans: sparplans,
    })

    setSparplans(changedSparplans)
    dispatch(changedSparplans)

    // Reset edit state and forms
    setEditingSparplan(null)
    setIsEditMode(false)
    setSparplanFormValues(getInitialSparplanFormValue())
    setSingleFormValue(getInitialSingleFormValue())

    const itemType = isEinmalzahlung(editingSparplan) ? 'Einmalzahlung' : 'Sparplan'
    toast.success(`${itemType} erfolgreich aktualisiert!`)
  }
}

/**
 * Creates a handler for submitting a new sparplan
 */
function createSparplanSubmitHandler(params: SparplanHandlersParams, handleSaveEdit: () => void) {
  const { sparplanFormValues, isEditMode, simulationAnnual, sparplans, setSparplans, dispatch, setSparplanFormValues } =
    params

  return () => {
    if (!sparplanFormValues.start || !sparplanFormValues.einzahlung) return

    if (isEditMode) {
      handleSaveEdit()
      return
    }

    // In create mode, add new sparplan
    const changedSparplans = createNewSparplan({
      formValues: sparplanFormValues,
      simulationAnnual,
      existingSparplans: sparplans,
    })

    setSparplans(changedSparplans)
    dispatch(changedSparplans)
    setSparplanFormValues(getInitialSparplanFormValue())

    toast.success('Sparplan erfolgreich hinzugefügt!')
  }
}

/**
 * Creates a handler for submitting a single payment
 */
function createSinglePaymentSubmitHandler(params: SparplanHandlersParams, handleSaveEdit: () => void) {
  const { singleFormValue, isEditMode, sparplans, setSparplans, dispatch, setSingleFormValue } = params

  return () => {
    if (!singleFormValue.einzahlung) return

    if (isEditMode) {
      handleSaveEdit()
      return
    }

    // In create mode, add new single payment
    const changedSparplans = createNewSinglePayment({
      formValues: singleFormValue,
      existingSparplans: sparplans,
    })

    setSparplans(changedSparplans)
    dispatch(changedSparplans)
    setSingleFormValue(getInitialSingleFormValue())

    toast.success('Einmalzahlung erfolgreich hinzugefügt!')
  }
}

/**
 * Creates a handler for deleting a sparplan
 */
function createDeleteSparplanHandler(params: SparplanHandlersParams) {
  const { sparplans, setSparplans, dispatch } = params

  return (id: number) => {
    const changedSparplans = sparplans.filter(el => el.id !== id)
    setSparplans(changedSparplans)
    dispatch(changedSparplans)

    toast.info('Sparplan entfernt')
  }
}

/**
 * Creates a handler for editing a sparplan
 */
function createEditSparplanHandler(params: SparplanHandlersParams) {
  const { setEditingSparplan, setIsEditMode, setSingleFormValue, setSparplanFormValues, simulationAnnual } = params

  return (sparplan: Sparplan) => {
    setEditingSparplan(sparplan)
    setIsEditMode(true)

    // Check if this is a one-time payment and populate appropriate form
    if (isEinmalzahlung(sparplan)) {
      setSingleFormValue(populateSingleFormFromSparplan(sparplan))
    } else {
      setSparplanFormValues(populateSparplanFormFromSparplan(sparplan, simulationAnnual))
    }
  }
}

/**
 * Creates a handler for canceling edit mode
 */
function createCancelEditHandler(params: SparplanHandlersParams) {
  const { setEditingSparplan, setIsEditMode, setSparplanFormValues, setSingleFormValue } = params

  return () => {
    setEditingSparplan(null)
    setIsEditMode(false)
    setSparplanFormValues(getInitialSparplanFormValue())
    setSingleFormValue(getInitialSingleFormValue())
  }
}

/**
 * Hook for managing sparplan event handlers
 */
export function useSparplanHandlers(params: SparplanHandlersParams) {
  const handleSaveEdit = createSaveEditHandler(params)
  const handleSparplanSubmit = createSparplanSubmitHandler(params, handleSaveEdit)
  const handleSinglePaymentSubmit = createSinglePaymentSubmitHandler(params, handleSaveEdit)
  const handleDeleteSparplan = createDeleteSparplanHandler(params)
  const handleEditSparplan = createEditSparplanHandler(params)
  const handleCancelEdit = createCancelEditHandler(params)

  return {
    handleSparplanSubmit,
    handleSinglePaymentSubmit,
    handleDeleteSparplan,
    handleEditSparplan,
    handleSaveEdit,
    handleCancelEdit,
  }
}
