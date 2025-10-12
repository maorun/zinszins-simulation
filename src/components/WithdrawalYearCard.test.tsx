import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WithdrawalYearCard } from './WithdrawalYearCard'
import type { WithdrawalFormValue } from '../utils/config-storage'

const createMockFormValue = (overrides?: Partial<WithdrawalFormValue>): WithdrawalFormValue => ({
  strategie: '4prozent',
  rendite: 5,
  withdrawalFrequency: 'yearly',
  inflationAktiv: false,
  inflationsrate: 2,
  monatlicheBetrag: 2000,
  guardrailsAktiv: false,
  guardrailsSchwelle: 10,
  variabelProzent: 5,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 8,
  dynamischObereAnpassung: 5,
  dynamischUntereSchwell: 2,
  dynamischUntereAnpassung: -5,
  rmdStartAge: 65,
  kapitalerhaltNominalReturn: 7,
  kapitalerhaltInflationRate: 2,
  steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
  steueroptimierteEntnahmeTargetTaxRate: 0.26375,
  steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
  steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
  steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
  grundfreibetragAktiv: false,
  grundfreibetragBetrag: 10908,
  einkommensteuersatz: 18,
  ...overrides,
})

describe('WithdrawalYearCard', () => {
  const mockOnCalculationInfoClick = vi.fn()

  const defaultRowData = {
    year: 2024,
    startkapital: 100000,
    endkapital: 105000,
    entnahme: 4000,
    zinsen: 5000,
    bezahlteSteuer: 500,
    genutzterFreibetrag: 1000,
  }

  const defaultFormValue = createMockFormValue()

  const allYears = [2024, 2025, 2026]

  test('renders basic withdrawal information', () => {
    render(
      <WithdrawalYearCard
        rowData={defaultRowData}
        formValue={defaultFormValue}
        allYears={allYears}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/📅 2024/)).toBeInTheDocument()
    expect(screen.getByText(/💰 Startkapital:/)).toBeInTheDocument()
    expect(screen.getByText(/💸 Entnahme:/)).toBeInTheDocument()
    expect(screen.getByText(/📈 Zinsen:/)).toBeInTheDocument()
    expect(screen.getByText(/💸 Bezahlte Steuer:/)).toBeInTheDocument()
  })

  test('displays monthly withdrawal for monatlich_fest strategy', () => {
    const rowDataWithMonthly = {
      ...defaultRowData,
      monatlicheEntnahme: 333.33,
    }

    const formValueMonthly = createMockFormValue({ strategie: 'monatlich_fest' })

    render(
      <WithdrawalYearCard
        rowData={rowDataWithMonthly}
        formValue={formValueMonthly}
        allYears={allYears}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/📅 Monatlich:/)).toBeInTheDocument()
  })

  test('displays inflation adjustment when active', () => {
    const rowDataWithInflation = {
      ...defaultRowData,
      inflationAnpassung: 100,
    }

    const formValueWithInflation = createMockFormValue({ inflationAktiv: true, inflationsrate: 2 })

    render(
      <WithdrawalYearCard
        rowData={rowDataWithInflation}
        formValue={formValueWithInflation}
        allYears={allYears}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/📈 Inflation:/)).toBeInTheDocument()
  })

  test('displays Grundfreibetrag when enabled', () => {
    const rowDataWithGrundfreibetrag = {
      ...defaultRowData,
      einkommensteuer: 200,
      genutzterGrundfreibetrag: 10908,
    }

    const formValueWithGrundfreibetrag = createMockFormValue({ grundfreibetragAktiv: true })

    render(
      <WithdrawalYearCard
        rowData={rowDataWithGrundfreibetrag}
        formValue={formValueWithGrundfreibetrag}
        allYears={allYears}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/🏛️ Einkommensteuer:/)).toBeInTheDocument()
    expect(screen.getByText(/🆓 Grundfreibetrag:/)).toBeInTheDocument()
  })

  test('displays other income when available', () => {
    const rowDataWithOtherIncome = {
      ...defaultRowData,
      otherIncome: {
        totalNetAmount: 5000,
        totalTaxAmount: 1000,
        sourceCount: 2,
      },
    }

    render(
      <WithdrawalYearCard
        rowData={rowDataWithOtherIncome}
        formValue={defaultFormValue}
        allYears={allYears}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/💰 Andere Einkünfte \(Netto\):/)).toBeInTheDocument()
    expect(screen.getByText(/📊 Anzahl Einkommensquellen:/)).toBeInTheDocument()
  })

  test('displays health care insurance when available', () => {
    const rowDataWithHealthCare = {
      ...defaultRowData,
      healthCareInsurance: {
        totalAnnual: 6000,
        healthInsuranceAnnual: 4000,
        careInsuranceAnnual: 2000,
        totalMonthly: 500,
        insuranceType: 'statutory' as const,
      },
    }

    render(
      <WithdrawalYearCard
        rowData={rowDataWithHealthCare}
        formValue={defaultFormValue}
        allYears={allYears}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/🏥 Krankenversicherung/)).toBeInTheDocument()
    expect(screen.getByText(/🩺 Pflegeversicherung:/)).toBeInTheDocument()
    expect(screen.getByText(/📅 Monatliche Beiträge:/)).toBeInTheDocument()
  })

  test('displays statutory pension when available', () => {
    const rowDataWithPension = {
      ...defaultRowData,
      statutoryPension: {
        grossAnnualAmount: 15000,
        netAnnualAmount: 13000,
        incomeTax: 2000,
      },
    }

    render(
      <WithdrawalYearCard
        rowData={rowDataWithPension}
        formValue={defaultFormValue}
        allYears={allYears}
        onCalculationInfoClick={mockOnCalculationInfoClick}
      />,
    )

    expect(screen.getByText(/🏛️ Gesetzliche Rente \(Brutto\):/)).toBeInTheDocument()
    expect(screen.getByText(/🏛️ Gesetzliche Rente \(Netto\):/)).toBeInTheDocument()
    expect(screen.getByText(/📅 Monatliche Rente \(Netto\):/)).toBeInTheDocument()
  })
})
