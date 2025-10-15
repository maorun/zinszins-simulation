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
 * Parse optional number value
 */
function parseOptionalNumber(value: string | number | undefined): number | undefined {
  return value ? Number(value) : undefined
}

/**
 * Create one-time payment sparplan update
 */
function createOneTimePaymentUpdate(
  editingSparplan: Sparplan,
  singleFormValues: SingleFormValue,
): Sparplan {
  return {
    ...editingSparplan,
    start: singleFormValues.date,
    end: singleFormValues.date,
    einzahlung: Number(singleFormValues.einzahlung),
    ter: parseOptionalNumber(singleFormValues.ter),
    transactionCostPercent: parseOptionalNumber(singleFormValues.transactionCostPercent),
    transactionCostAbsolute: parseOptionalNumber(singleFormValues.transactionCostAbsolute),
  }
}

/**
 * Create regular sparplan update
 */
function createRegularSparplanUpdate(
  editingSparplan: Sparplan,
  sparplanFormValues: SparplanFormValue,
  simulationAnnual: SimulationAnnual,
): Sparplan {
  const yearlyAmount = simulationAnnual === SimulationAnnual.monthly
    ? Number(sparplanFormValues.einzahlung) * 12
    : Number(sparplanFormValues.einzahlung)

  return {
    ...editingSparplan,
    start: sparplanFormValues.start,
    end: sparplanFormValues.end,
    einzahlung: yearlyAmount,
    ter: parseOptionalNumber(sparplanFormValues.ter),
    transactionCostPercent: parseOptionalNumber(sparplanFormValues.transactionCostPercent),
    transactionCostAbsolute: parseOptionalNumber(sparplanFormValues.transactionCostAbsolute),
  }
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

  const updatedSparplan = isOneTimePayment
    ? createOneTimePaymentUpdate(editingSparplan, singleFormValues)
    : createRegularSparplanUpdate(editingSparplan, sparplanFormValues, simulationAnnual)

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
 * Calculate display amount for sparplan based on simulation type
 */
function calculateDisplayAmount(
  sparplan: Sparplan,
  simulationAnnual: SimulationAnnualType,
  isOneTime: boolean,
): string {
  if (simulationAnnual === SimulationAnnual.monthly && !isOneTime) {
    return (sparplan.einzahlung / 12).toString()
  }
  return sparplan.einzahlung.toString()
}

/**
 * Convert optional number to string with fallback
 */
function optionalNumberToString(value: number | undefined): string {
  return value?.toString() || ''
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
  const displayAmount = calculateDisplayAmount(sparplan, simulationAnnual, isOneTime)

  return {
    start: new Date(sparplan.start),
    end: sparplan.end ? new Date(sparplan.end) : null,
    einzahlung: displayAmount,
    ter: optionalNumberToString(sparplan.ter),
    transactionCostPercent: optionalNumberToString(sparplan.transactionCostPercent),
    transactionCostAbsolute: optionalNumberToString(sparplan.transactionCostAbsolute),
  }
}
