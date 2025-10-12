import { SimulationAnnual, type SimulationAnnualType } from '../utils/simulate'
import type { Sparplan } from '../utils/sparplan-utils'

// Type definitions for form values
export interface SingleFormValue {
  date: Date
  einzahlung: string
  ter: string
  transactionCostPercent: string
  transactionCostAbsolute: string
}

export interface SparplanFormValue {
  start: Date
  end: Date | null
  einzahlung: string
  ter: string
  transactionCostPercent: string
  transactionCostAbsolute: string
}

// Parameters for creating a new sparplan
interface CreateSparplanParams {
  formValues: SparplanFormValue
  simulationAnnual: SimulationAnnualType
  existingSparplans: Sparplan[]
}

// Parameters for creating a single payment
interface CreateSinglePaymentParams {
  formValues: SingleFormValue
  existingSparplans: Sparplan[]
}

// Parameters for updating a sparplan
interface UpdateSparplanParams {
  editingSparplan: Sparplan
  sparplanFormValues: SparplanFormValue
  singleFormValues: SingleFormValue
  simulationAnnual: SimulationAnnualType
  existingSparplans: Sparplan[]
}

/**
 * Creates a new sparplan from form values
 * Complexity: <8, Lines: <50
 */
export function createNewSparplan(params: CreateSparplanParams): Sparplan[] {
  const { formValues, simulationAnnual, existingSparplans } = params

  const yearlyAmount = simulationAnnual === SimulationAnnual.monthly
    ? Number(formValues.einzahlung) * 12
    : Number(formValues.einzahlung)

  const newSparplan: Sparplan = {
    id: new Date().getTime(),
    start: formValues.start,
    end: formValues.end,
    einzahlung: yearlyAmount,
    ter: formValues.ter ? Number(formValues.ter) : undefined,
    transactionCostPercent: formValues.transactionCostPercent
      ? Number(formValues.transactionCostPercent) : undefined,
    transactionCostAbsolute: formValues.transactionCostAbsolute
      ? Number(formValues.transactionCostAbsolute) : undefined,
  }

  return [...existingSparplans, newSparplan]
}

/**
 * Creates a new single payment from form values
 * Complexity: <8, Lines: <50
 */
export function createNewSinglePayment(params: CreateSinglePaymentParams): Sparplan[] {
  const { formValues, existingSparplans } = params

  const newPayment: Sparplan = {
    id: new Date().getTime(),
    start: formValues.date,
    end: formValues.date,
    einzahlung: Number(formValues.einzahlung),
    ter: formValues.ter ? Number(formValues.ter) : undefined,
    transactionCostPercent: formValues.transactionCostPercent
      ? Number(formValues.transactionCostPercent) : undefined,
    transactionCostAbsolute: formValues.transactionCostAbsolute
      ? Number(formValues.transactionCostAbsolute) : undefined,
  }

  return [...existingSparplans, newPayment]
}

/**
 * Checks if a sparplan is a one-time payment (Einmalzahlung)
 * Complexity: <8, Lines: <50
 */
export function isEinmalzahlung(sparplan: Sparplan): boolean {
  return sparplan.end !== null && sparplan.end !== undefined
    && new Date(sparplan.start).getTime() === new Date(sparplan.end).getTime()
}

/**
 * Updates an existing sparplan with new values
 * Complexity: <8, Lines: <50
 */
export function updateExistingSparplan(params: UpdateSparplanParams): Sparplan[] {
  const {
    editingSparplan,
    sparplanFormValues,
    singleFormValues,
    simulationAnnual,
    existingSparplans,
  } = params

  const isOneTimePayment = isEinmalzahlung(editingSparplan)

  let updatedSparplan: Sparplan

  if (isOneTimePayment) {
    updatedSparplan = {
      ...editingSparplan,
      start: singleFormValues.date,
      end: singleFormValues.date,
      einzahlung: Number(singleFormValues.einzahlung),
      ter: singleFormValues.ter ? Number(singleFormValues.ter) : undefined,
      transactionCostPercent: singleFormValues.transactionCostPercent
        ? Number(singleFormValues.transactionCostPercent) : undefined,
      transactionCostAbsolute: singleFormValues.transactionCostAbsolute
        ? Number(singleFormValues.transactionCostAbsolute) : undefined,
    }
  }
  else {
    const yearlyAmount = simulationAnnual === SimulationAnnual.monthly
      ? Number(sparplanFormValues.einzahlung) * 12
      : Number(sparplanFormValues.einzahlung)

    updatedSparplan = {
      ...editingSparplan,
      start: sparplanFormValues.start,
      end: sparplanFormValues.end,
      einzahlung: yearlyAmount,
      ter: sparplanFormValues.ter ? Number(sparplanFormValues.ter) : undefined,
      transactionCostPercent: sparplanFormValues.transactionCostPercent
        ? Number(sparplanFormValues.transactionCostPercent) : undefined,
      transactionCostAbsolute: sparplanFormValues.transactionCostAbsolute
        ? Number(sparplanFormValues.transactionCostAbsolute) : undefined,
    }
  }

  return existingSparplans.map(sp =>
    sp.id === editingSparplan.id ? updatedSparplan : sp,
  )
}

/**
 * Gets initial empty form values for single payment form
 * Complexity: <8, Lines: <50
 */
export function getInitialSingleFormValue(): SingleFormValue {
  return {
    date: new Date(),
    einzahlung: '',
    ter: '',
    transactionCostPercent: '',
    transactionCostAbsolute: '',
  }
}

/**
 * Gets initial empty form values for sparplan form
 * Complexity: <8, Lines: <50
 */
export function getInitialSparplanFormValue(): SparplanFormValue {
  return {
    start: new Date(),
    end: null,
    einzahlung: '',
    ter: '',
    transactionCostPercent: '',
    transactionCostAbsolute: '',
  }
}

/**
 * Populates single payment form with values from a sparplan
 * Complexity: <8, Lines: <50
 */
export function populateSingleFormFromSparplan(sparplan: Sparplan): SingleFormValue {
  return {
    date: new Date(sparplan.start),
    einzahlung: sparplan.einzahlung.toString(),
    ter: sparplan.ter?.toString() || '',
    transactionCostPercent: sparplan.transactionCostPercent?.toString() || '',
    transactionCostAbsolute: sparplan.transactionCostAbsolute?.toString() || '',
  }
}

/**
 * Populates sparplan form with values from a sparplan
 * Complexity: <8, Lines: <50
 */
export function populateSparplanFormFromSparplan(
  sparplan: Sparplan,
  simulationAnnual: SimulationAnnualType,
): SparplanFormValue {
  const isOneTime = isEinmalzahlung(sparplan)
  const displayAmount = simulationAnnual === SimulationAnnual.monthly && !isOneTime
    ? (sparplan.einzahlung / 12).toString()
    : sparplan.einzahlung.toString()

  return {
    start: new Date(sparplan.start),
    end: sparplan.end ? new Date(sparplan.end) : null,
    einzahlung: displayAmount,
    ter: sparplan.ter?.toString() || '',
    transactionCostPercent: sparplan.transactionCostPercent?.toString() || '',
    transactionCostAbsolute: sparplan.transactionCostAbsolute?.toString() || '',
  }
}
