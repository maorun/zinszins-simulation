import { type SimulationAnnualType } from '../utils/simulate'
import { initialSparplan, type Sparplan } from '../utils/sparplan-utils'
import { SparplanEingabeView } from './SparplanEingabeView'
import { useSparplanManagement } from './useSparplanManagement'
import {
  formatDateForInput,
  handleDateChange,
  handleNumberChange,
  isEditingSparplan,
  isEditingSinglePayment,
} from './SparplanEingabe.utils'

/**
 * Savings Plan Input Component
 * 
 * Main component for managing savings plans (Sparpläne) and one-time payments (Einmalzahlungen).
 * Provides UI for creating, editing, and deleting regular savings plans and single payments.
 * 
 * @param props - Component props
 * @param props.dispatch - Callback to update savings plans in parent state
 * @param props.simulationAnnual - Calculation frequency ('yearly' or 'monthly')
 * @param props.currentSparplans - Current array of savings plans
 * @returns Savings plan input interface
 */
export function SparplanEingabe({
  dispatch,
  simulationAnnual,
  currentSparplans = [initialSparplan],
}: {
  dispatch: (val: Sparplan[]) => void
  simulationAnnual: SimulationAnnualType
  currentSparplans?: Sparplan[]
}) {
  const management = useSparplanManagement(dispatch, simulationAnnual, currentSparplans)

  return (
    <SparplanEingabeView
      isSparplanFormOpen={management.isSparplanFormOpen}
      setIsSparplanFormOpen={management.setIsSparplanFormOpen}
      sparplanFormValues={management.sparplanFormValues}
      setSparplanFormValues={management.setSparplanFormValues}
      isSingleFormOpen={management.isSingleFormOpen}
      setIsSingleFormOpen={management.setIsSingleFormOpen}
      singleFormValue={management.singleFormValue}
      setSingleFormValue={management.setSingleFormValue}
      isEditMode={management.isEditMode}
      editingSparplan={management.editingSparplan}
      sparplans={management.sparplans}
      simulationAnnual={simulationAnnual}
      handleSparplanSubmit={management.handleSparplanSubmit}
      handleSinglePaymentSubmit={management.handleSinglePaymentSubmit}
      handleDeleteSparplan={management.handleDeleteSparplan}
      handleEditSparplan={management.handleEditSparplan}
      handleSaveEdit={management.handleSaveEdit}
      handleCancelEdit={management.handleCancelEdit}
      formatDateForInput={formatDateForInput}
      handleDateChange={handleDateChange}
      handleNumberChange={handleNumberChange}
      isEditingSparplan={isEditingSparplan}
      isEditingSinglePayment={isEditingSinglePayment}
    />
  )
}
