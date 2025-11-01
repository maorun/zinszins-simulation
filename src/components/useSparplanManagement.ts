import { useSparplanState, useEditState, useSparplanHandlers } from './SparplanEingabe.hooks'
import type { SimulationAnnualType } from '../utils/simulate'
import type { Sparplan } from '../utils/sparplan-utils'

/**
 * Combined hook that aggregates all Sparplan-related state and handlers
 * This hook simplifies the main component by providing everything in one place
 */
export function useSparplanManagement(
  dispatch: (val: Sparplan[]) => void,
  simulationAnnual: SimulationAnnualType,
  currentSparplans: Sparplan[],
) {
  // State management
  const state = useSparplanState(currentSparplans)
  const editState = useEditState()

  // Event handlers
  const handlers = useSparplanHandlers({
    sparplans: state.sparplans,
    setSparplans: state.setSparplans,
    dispatch,
    sparplanFormValues: state.sparplanFormValues,
    setSparplanFormValues: state.setSparplanFormValues,
    singleFormValue: state.singleFormValue,
    setSingleFormValue: state.setSingleFormValue,
    editingSparplan: editState.editingSparplan,
    setEditingSparplan: editState.setEditingSparplan,
    isEditMode: editState.isEditMode,
    setIsEditMode: editState.setIsEditMode,
    simulationAnnual,
  })

  return {
    ...state,
    ...editState,
    ...handlers,
  }
}
