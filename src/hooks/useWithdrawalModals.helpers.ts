/**
 * Helper functions for useWithdrawalModals hook
 * These functions handle different types of calculation explanations
 */

import {
  createInflationExplanation,
  createWithdrawalInterestExplanation,
  createTaxExplanation,
  createIncomeTaxExplanation,
  createTaxableIncomeExplanation,
  createOtherIncomeExplanation,
  createStatutoryPensionExplanation,
  createEndkapitalExplanation,
  createHealthCareInsuranceExplanation,
} from '../components/calculationHelpers'
import type {
  CalculationExplanation,
  WithdrawalSegment,
  RowData,
  HandlerContext,
} from './useWithdrawalModals.types'

/**
 * Find the applicable segment for a given year
 */
export function findApplicableSegment(
  useSegmentedWithdrawal: boolean,
  withdrawalSegments: WithdrawalSegment[],
  year: number,
): WithdrawalSegment | null {
  if (!useSegmentedWithdrawal) {
    return null
  }

  return withdrawalSegments.find(segment =>
    year >= segment.startYear && year <= segment.endYear,
  ) || null
}

/**
 * Handle inflation explanation
 */
export function handleInflationExplanation(params: {
  rowData: RowData
  context: HandlerContext
  applicableSegment: WithdrawalSegment | null
}): CalculationExplanation | null {
  const { rowData, context, applicableSegment } = params

  if (rowData.inflationAnpassung === undefined) {
    return null
  }

  const yearsPassed = rowData.year - context.startOfIndependence - 1
  const baseAmount = (context.withdrawalData?.startingCapital || 0) * 0.04
  const inflationRate = applicableSegment?.inflationConfig?.inflationRate
    || (context.formValue.inflationsrate ? context.formValue.inflationsrate / 100 : 0)
    || 0.02

  return createInflationExplanation(
    baseAmount,
    inflationRate,
    yearsPassed,
    rowData.inflationAnpassung,
  )
}

/**
 * Handle interest explanation
 */
export function handleInterestExplanation(params: {
  rowData: RowData
  context: HandlerContext
  applicableSegment: WithdrawalSegment | null
}): CalculationExplanation | null {
  const { rowData, context, applicableSegment } = params

  if (!rowData.zinsen) {
    return null
  }

  const returnRate = applicableSegment?.returnConfig?.mode === 'fixed'
    ? (applicableSegment.returnConfig.fixedRate || 0) * 100
    : context.formValue.rendite || 5

  return createWithdrawalInterestExplanation(
    rowData.startkapital || 0,
    rowData.zinsen,
    returnRate,
    rowData.year,
  )
}

/**
 * Handle tax explanation
 */
export function handleTaxExplanation(params: {
  rowData: RowData
  context: HandlerContext
}): CalculationExplanation | null {
  const { rowData, context } = params

  if (!rowData.bezahlteSteuer) {
    return null
  }

  const estimatedVorabpauschale = rowData.bezahlteSteuer
    / (context.steuerlast * (1 - context.teilfreistellungsquote))

  return createTaxExplanation(
    rowData.bezahlteSteuer,
    estimatedVorabpauschale,
    context.steuerlast,
    context.teilfreistellungsquote,
    rowData.genutzterFreibetrag || 2000,
    rowData.year,
  )
}

/**
 * Handle income tax explanation
 */
export function handleIncomeTaxExplanation(params: {
  rowData: RowData
  context: HandlerContext
  applicableSegment: WithdrawalSegment | null
}): CalculationExplanation | null {
  const { rowData, context, applicableSegment } = params

  if (rowData.einkommensteuer === undefined) {
    return null
  }

  const grundfreibetragAmount = context.grundfreibetragAktiv
    ? context.grundfreibetragBetrag
    : 0

  const incomeTaxRate = applicableSegment?.incomeTaxRate
    ? applicableSegment.incomeTaxRate * 100
    : context.formValue.einkommensteuersatz || 18

  return createIncomeTaxExplanation(
    rowData.entnahme || 0,
    grundfreibetragAmount,
    incomeTaxRate,
    rowData.einkommensteuer,
    rowData.genutzterGrundfreibetrag || 0,
  )
}

/**
 * Handle taxable income explanation
 */
export function handleTaxableIncomeExplanation(params: {
  rowData: RowData
  context: HandlerContext
}): CalculationExplanation {
  const { rowData, context } = params

  const grundfreibetragAmount = context.grundfreibetragAktiv
    ? context.grundfreibetragBetrag
    : 0

  const statutoryPensionTaxableAmount = rowData.statutoryPension?.taxableAmount || 0

  const otherIncomeGrossAmount = rowData.otherIncome?.sources?.reduce(
    (sum: number, source) => sum + (source.grossAnnualAmount || 0),
    0,
  ) || 0

  const healthCareInsuranceAnnual = rowData.healthCareInsurance?.totalAnnual || 0

  return createTaxableIncomeExplanation(
    rowData.entnahme || 0,
    grundfreibetragAmount,
    statutoryPensionTaxableAmount,
    otherIncomeGrossAmount,
    healthCareInsuranceAnnual,
  )
}

/**
 * Handle other income explanation
 */
export function handleOtherIncomeExplanation(params: {
  rowData: RowData
}): CalculationExplanation | null {
  const { rowData } = params

  if (!rowData.otherIncome) {
    return null
  }

  return createOtherIncomeExplanation(
    rowData.otherIncome.totalNetAmount || 0,
    rowData.otherIncome.totalTaxAmount || 0,
    rowData.otherIncome.sourceCount || 0,
    rowData.otherIncome,
  )
}

/**
 * Handle statutory pension explanation
 */
export function handleStatutoryPensionExplanation(params: {
  rowData: RowData
}): CalculationExplanation | null {
  const { rowData } = params

  if (!rowData.statutoryPension) {
    return null
  }

  return createStatutoryPensionExplanation(
    rowData.statutoryPension.grossAnnualAmount || 0,
    rowData.statutoryPension.netAnnualAmount || 0,
    rowData.statutoryPension.incomeTax || 0,
    rowData.statutoryPension.taxableAmount || 0,
    rowData.year,
  )
}

/**
 * Handle endkapital explanation
 */
export function handleEndkapitalExplanation(params: {
  rowData: RowData
}): CalculationExplanation {
  const { rowData } = params

  const zinsen = rowData.zinsen || 0
  const entnahme = rowData.entnahme || 0
  const bezahlteSteuer = rowData.bezahlteSteuer || 0
  const kosten = (rowData.terCosts || 0) + (rowData.transactionCosts || 0)

  return createEndkapitalExplanation(
    rowData.endkapital || 0,
    rowData.startkapital || 0,
    -entnahme,
    zinsen,
    bezahlteSteuer + kosten,
    rowData.year,
  )
}

/**
 * Handle health care insurance explanation
 */
export function handleHealthCareInsuranceExplanation(params: {
  rowData: RowData
}): CalculationExplanation | null {
  const { rowData } = params

  if (!rowData.healthCareInsurance) {
    return null
  }

  const insuranceData = rowData.healthCareInsurance

  return createHealthCareInsuranceExplanation(
    insuranceData.healthInsuranceAnnual || 0,
    insuranceData.careInsuranceAnnual || 0,
    insuranceData.totalAnnual || 0,
    insuranceData.insuranceType || 'statutory',
    insuranceData.effectiveHealthInsuranceRate || 0,
    insuranceData.effectiveCareInsuranceRate || 0,
    insuranceData.baseIncomeForCalculation || 0,
    insuranceData.isRetirementPhase || false,
    insuranceData.includesEmployerContribution || false,
    insuranceData.inflationAdjustmentFactor || 1,
    rowData.year,
  )
}
