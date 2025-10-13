/**
 * Shared type definitions for useWithdrawalModals hook and helpers
 */

import type { VorabpauschaleDetails } from '../utils/simulate'

export type { VorabpauschaleDetails }

export interface CalculationStep {
  title: string
  description: string
  calculation: string
  result: string
  backgroundColor: string
  borderColor: string
}

export interface CalculationExplanation {
  title: string
  introduction: string
  steps: CalculationStep[]
  finalResult: {
    title: string
    values: Array<{ label: string, value: string }>
  }
}

export interface ModalWithdrawalFormValue extends Record<string, unknown> {
  inflationsrate?: number
  rendite?: number
  einkommensteuersatz?: number
}

export interface ReturnConfig extends Record<string, unknown> {
  mode: string
  fixedRate?: number
}

export interface InflationConfig extends Record<string, unknown> {
  inflationRate?: number
}

export interface WithdrawalSegment extends Record<string, unknown> {
  startYear: number
  endYear: number
  returnConfig?: ReturnConfig
  inflationConfig?: InflationConfig
  incomeTaxRate?: number
}

export interface WithdrawalData extends Record<string, unknown> {
  startingCapital: number
}

export interface RowData extends Record<string, unknown> {
  year: number
  inflationAnpassung?: number
  zinsen?: number
  startkapital?: number
  bezahlteSteuer?: number
  genutzterFreibetrag?: number
  einkommensteuer?: number
  entnahme?: number
  genutzterGrundfreibetrag?: number
  statutoryPension?: {
    grossAnnualAmount?: number
    netAnnualAmount?: number
    incomeTax?: number
    taxableAmount?: number
  }
  otherIncome?: {
    totalNetAmount?: number
    totalTaxAmount?: number
    sourceCount?: number
    sources?: Array<{ grossAnnualAmount?: number }>
  }
  healthCareInsurance?: {
    totalAnnual?: number
    healthInsuranceAnnual?: number
    careInsuranceAnnual?: number
    insuranceType?: 'statutory' | 'private'
    effectiveHealthInsuranceRate?: number
    effectiveCareInsuranceRate?: number
    baseIncomeForCalculation?: number
    isRetirementPhase?: boolean
    includesEmployerContribution?: boolean
    inflationAdjustmentFactor?: number
  }
  endkapital?: number
  terCosts?: number
  transactionCosts?: number
  vorabpauschaleDetails?: VorabpauschaleDetails
}

export interface HandlerContext {
  formValue: ModalWithdrawalFormValue
  withdrawalData: WithdrawalData | null
  startOfIndependence: number
  steuerlast: number
  teilfreistellungsquote: number
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
}
