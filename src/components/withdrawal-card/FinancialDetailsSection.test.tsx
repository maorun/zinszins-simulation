import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FinancialDetailsSection } from './FinancialDetailsSection'
import type { WithdrawalFormValue } from '../../utils/config-storage'

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

describe('FinancialDetailsSection', () => {
  const mockFormatWithInflation = vi.fn(params => `${params.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`)
  const mockOnCalculationInfoClick = vi.fn()

  const defaultRowData = {
    year: 2024,
    startkapital: 100000,
    entnahme: 4000,
  }

  test('renders start capital and withdrawal', () => {
    render(
      <FinancialDetailsSection
        rowData={defaultRowData}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getByText(/💰 Startkapital:/)).toBeInTheDocument()
    expect(screen.getByText(/💸 Entnahme:/)).toBeInTheDocument()
  })

  test('displays monthly withdrawal for monatlich_fest strategy', () => {
    const rowDataWithMonthly = {
      ...defaultRowData,
      monatlicheEntnahme: 333.33,
    }

    render(
      <FinancialDetailsSection
        rowData={rowDataWithMonthly}
        formValue={createMockFormValue({ strategie: 'monatlich_fest' })}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getByText(/📅 Monatlich:/)).toBeInTheDocument()
    expect(screen.getByText(/333,33 €/)).toBeInTheDocument()
  })

  test('does not display monthly withdrawal for non-monatlich_fest strategy', () => {
    const rowDataWithMonthly = {
      ...defaultRowData,
      monatlicheEntnahme: 333.33,
    }

    render(
      <FinancialDetailsSection
        rowData={rowDataWithMonthly}
        formValue={createMockFormValue({ strategie: '4prozent' })}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.queryByText(/📅 Monatlich:/)).not.toBeInTheDocument()
  })

  test('displays inflation adjustment when active', () => {
    const rowDataWithInflation = {
      ...defaultRowData,
      inflationAnpassung: 100,
    }

    const { container } = render(
      <FinancialDetailsSection
        rowData={rowDataWithInflation}
        formValue={createMockFormValue({ inflationAktiv: true, inflationsrate: 2 })}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getByText(/📈 Inflation:/)).toBeInTheDocument()
    expect(screen.getByText(/100,00 €/)).toBeInTheDocument()

    // Test info icon click
    const infoIcon = container.querySelector('svg.lucide-info')
    expect(infoIcon).toBeTruthy()
    fireEvent.click(infoIcon!)
    expect(mockOnCalculationInfoClick).toHaveBeenCalledWith('inflation', rowDataWithInflation)
  })

  test('does not display inflation adjustment when not active', () => {
    const rowDataWithInflation = {
      ...defaultRowData,
      inflationAnpassung: 100,
    }

    render(
      <FinancialDetailsSection
        rowData={rowDataWithInflation}
        formValue={createMockFormValue({ inflationAktiv: false })}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.queryByText(/📈 Inflation:/)).not.toBeInTheDocument()
  })

  test('displays guardrails adjustment when active with monatlich_fest strategy', () => {
    const rowDataWithGuardrails = {
      ...defaultRowData,
      portfolioAnpassung: 500,
    }

    render(
      <FinancialDetailsSection
        rowData={rowDataWithGuardrails}
        formValue={createMockFormValue({ strategie: 'monatlich_fest', guardrailsAktiv: true, guardrailsSchwelle: 10 })}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getByText(/🛡️ Guardrails:/)).toBeInTheDocument()
    expect(screen.getByText(/500,00 €/)).toBeInTheDocument()
  })

  test('does not display guardrails adjustment when not active', () => {
    const rowDataWithGuardrails = {
      ...defaultRowData,
      portfolioAnpassung: 500,
    }

    render(
      <FinancialDetailsSection
        rowData={rowDataWithGuardrails}
        formValue={createMockFormValue({ strategie: 'monatlich_fest', guardrailsAktiv: false })}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.queryByText(/🛡️ Guardrails:/)).not.toBeInTheDocument()
  })

  test('does not display guardrails for non-monatlich_fest strategy even if active', () => {
    const rowDataWithGuardrails = {
      ...defaultRowData,
      portfolioAnpassung: 500,
    }

    render(
      <FinancialDetailsSection
        rowData={rowDataWithGuardrails}
        formValue={createMockFormValue({ strategie: '4prozent', guardrailsAktiv: true })}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.queryByText(/🛡️ Guardrails:/)).not.toBeInTheDocument()
  })
})
