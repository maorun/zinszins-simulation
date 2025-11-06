/**
 * Handler mapping and context creation for useWithdrawalModals
 */

import {
  findApplicableSegment,
  handleInflationExplanation,
  handleInterestExplanation,
  handleTaxExplanation,
  handleIncomeTaxExplanation,
  handleTaxableIncomeExplanation,
  handleOtherIncomeExplanation,
  handleStatutoryPensionExplanation,
  handleEndkapitalExplanation,
  handleHealthCareInsuranceExplanation,
} from './useWithdrawalModals.helpers'
import type {
  CalculationExplanation,
  VorabpauschaleDetails,
  RowData,
  HandlerContext,
  WithdrawalSegment,
} from './useWithdrawalModals.types'

/**
 * Create handler context from hook parameters
 */
export function createHandlerContext(
  formValue: HandlerContext['formValue'],
  withdrawalData: HandlerContext['withdrawalData'],
  startOfIndependence: number,
  steuerlast: number,
  teilfreistellungsquote: number,
  grundfreibetragAktiv: boolean,
  grundfreibetragBetrag: number,
): HandlerContext {
  return {
    formValue,
    withdrawalData,
    startOfIndependence,
    steuerlast,
    teilfreistellungsquote,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
  }
}

/**
 * Get the appropriate explanation handler for the given type
 */
export function getExplanationHandler(
  explanationType: string,
  rowData: RowData,
  context: HandlerContext,
  applicableSegment: WithdrawalSegment | null,
): (() => CalculationExplanation | null) | null {
  const handlers: Record<string, () => CalculationExplanation | null> = {
    inflation: () => handleInflationExplanation({ rowData, context, applicableSegment }),
    interest: () => handleInterestExplanation({ rowData, context, applicableSegment }),
    tax: () => handleTaxExplanation({ rowData, context }),
    incomeTax: () => handleIncomeTaxExplanation({ rowData, context, applicableSegment }),
    taxableIncome: () => handleTaxableIncomeExplanation({ rowData, context }),
    otherIncome: () => handleOtherIncomeExplanation({ rowData }),
    statutoryPension: () => handleStatutoryPensionExplanation({ rowData }),
    endkapital: () => handleEndkapitalExplanation({ rowData }),
    healthCareInsurance: () => handleHealthCareInsuranceExplanation({ rowData }),
  }

  return handlers[explanationType] || null
}

/**
 * Create empty result for processCalculationInfoClick
 */
function createEmptyResult() {
  return {
    showCalculation: false,
    calculationDetails: null,
    showVorabpauschale: false,
    vorabDetails: null,
  }
}

/**
 * Create Vorabpauschale result
 */
function createVorabpauschaleResult(vorabDetails: VorabpauschaleDetails) {
  return {
    showCalculation: false,
    calculationDetails: null,
    showVorabpauschale: true,
    vorabDetails,
  }
}

/**
 * Create calculation result
 */
function createCalculationResult(calculationDetails: CalculationExplanation) {
  return {
    showCalculation: true,
    calculationDetails,
    showVorabpauschale: false,
    vorabDetails: null,
  }
}

/**
 * Process calculation info click and return modal updates
 */
export function processCalculationInfoClick(
  explanationType: string,
  rowData: unknown,
  useSegmentedWithdrawal: boolean,
  withdrawalSegments: WithdrawalSegment[],
  context: HandlerContext,
): {
  showCalculation: boolean
  calculationDetails: CalculationExplanation | null
  showVorabpauschale: boolean
  vorabDetails: VorabpauschaleDetails | null
} {
  // Type guard to ensure rowData has the expected shape
  if (!rowData || typeof rowData !== 'object' || !('year' in rowData)) {
    return createEmptyResult()
  }
  const data = rowData as RowData

  // Special case: Vorabpauschale opens a different modal
  if (explanationType === 'vorabpauschale' && data.vorabpauschaleDetails) {
    return createVorabpauschaleResult(data.vorabpauschaleDetails)
  }

  // Find applicable segment for this year
  const applicableSegment = findApplicableSegment(useSegmentedWithdrawal, withdrawalSegments, data.year)

  // Get handler for the explanation type
  const handler = getExplanationHandler(explanationType, data, context, applicableSegment)
  if (!handler) {
    return createEmptyResult()
  }

  // Generate explanation
  const explanation = handler()
  if (explanation) {
    return createCalculationResult(explanation)
  }

  return createEmptyResult()
}
