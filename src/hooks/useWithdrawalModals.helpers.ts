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
import type { CalculationExplanation, WithdrawalSegment, RowData, HandlerContext } from './useWithdrawalModals.types'

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

  return withdrawalSegments.find((segment) => year >= segment.startYear && year <= segment.endYear) || null
}

/**
 * Get inflation rate from segment or form value
 */
function getInflationRate(applicableSegment: WithdrawalSegment | null, formValue: HandlerContext['formValue']): number {
  if (applicableSegment?.inflationConfig?.inflationRate) {
    return applicableSegment.inflationConfig.inflationRate
  }
  if (formValue.inflationsrate) {
    return formValue.inflationsrate / 100
  }
  return 0.02
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
  const inflationRate = getInflationRate(applicableSegment, context.formValue)

  return createInflationExplanation(baseAmount, inflationRate, yearsPassed, rowData.inflationAnpassung)
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

  const returnRate =
    applicableSegment?.returnConfig?.mode === 'fixed'
      ? (applicableSegment.returnConfig.fixedRate || 0) * 100
      : context.formValue.rendite || 5

  return createWithdrawalInterestExplanation(rowData.startkapital || 0, rowData.zinsen, returnRate, rowData.year)
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

  const estimatedVorabpauschale = rowData.bezahlteSteuer / (context.steuerlast * (1 - context.teilfreistellungsquote))

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

  const grundfreibetragAmount = context.grundfreibetragAktiv ? context.grundfreibetragBetrag : 0

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
 * Get Grundfreibetrag amount
 */
function getGrundfreibetragAmount(grundfreibetragAktiv: boolean, grundfreibetragBetrag: number): number {
  return grundfreibetragAktiv ? grundfreibetragBetrag : 0
}

/**
 * Calculate total gross amount from other income sources
 */
function calculateOtherIncomeGross(rowData: RowData): number {
  if (!rowData.otherIncome?.sources) {
    return 0
  }
  return rowData.otherIncome.sources.reduce((sum: number, source) => sum + (source.grossAnnualAmount || 0), 0)
}

/**
 * Handle taxable income explanation
 */
export function handleTaxableIncomeExplanation(params: {
  rowData: RowData
  context: HandlerContext
}): CalculationExplanation {
  const { rowData, context } = params

  const grundfreibetragAmount = getGrundfreibetragAmount(context.grundfreibetragAktiv, context.grundfreibetragBetrag)

  const statutoryPensionTaxableAmount = rowData.statutoryPension?.taxableAmount || 0
  const otherIncomeGrossAmount = calculateOtherIncomeGross(rowData)
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
export function handleOtherIncomeExplanation(params: { rowData: RowData }): CalculationExplanation | null {
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
export function handleStatutoryPensionExplanation(params: { rowData: RowData }): CalculationExplanation | null {
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
export function handleEndkapitalExplanation(params: { rowData: RowData }): CalculationExplanation {
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
export function handleHealthCareInsuranceExplanation(params: { rowData: RowData }): CalculationExplanation | null {
  const { rowData } = params

  if (!rowData.healthCareInsurance) {
    return null
  }

  const insuranceData = rowData.healthCareInsurance
  const defaults = {
    healthInsuranceAnnual: 0,
    careInsuranceAnnual: 0,
    totalAnnual: 0,
    insuranceType: 'statutory' as const,
    effectiveHealthInsuranceRate: 0,
    effectiveCareInsuranceRate: 0,
    baseIncomeForCalculation: 0,
    isRetirementPhase: false,
    includesEmployerContribution: false,
    inflationAdjustmentFactor: 1,
  }

  const values = { ...defaults, ...insuranceData }

  return createHealthCareInsuranceExplanation(
    values.healthInsuranceAnnual,
    values.careInsuranceAnnual,
    values.totalAnnual,
    values.insuranceType,
    values.effectiveHealthInsuranceRate,
    values.effectiveCareInsuranceRate,
    values.baseIncomeForCalculation,
    values.isRetirementPhase,
    values.includesEmployerContribution,
    values.inflationAdjustmentFactor,
    rowData.year,
  )
}
