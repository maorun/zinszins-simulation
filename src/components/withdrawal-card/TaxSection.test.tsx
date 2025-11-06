import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaxSection } from './TaxSection'
import type { WithdrawalFormValue } from '../../utils/config-storage'

const createMockFormValue = (): WithdrawalFormValue => ({
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
})

describe('TaxSection', () => {
  const mockFormatWithInflation = vi.fn(
    (params) => `${params.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`,
  )
  const mockOnCalculationInfoClick = vi.fn()

  const defaultRowData = {
    year: 2024,
    zinsen: 5000,
    bezahlteSteuer: 500,
    genutzterFreibetrag: 1000,
  }

  beforeEach(() => {
    mockOnCalculationInfoClick.mockClear()
  })

  test('renders interest and tax information', () => {
    render(
      <TaxSection
        rowData={defaultRowData}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getByText(/📈 Zinsen:/)).toBeInTheDocument()
    expect(screen.getByText(/💸 Bezahlte Steuer:/)).toBeInTheDocument()
    expect(screen.getByText(/🎯 Genutzter Freibetrag:/)).toBeInTheDocument()
  })

  test('calls onCalculationInfoClick for interest info icon', () => {
    const { container } = render(
      <TaxSection
        rowData={defaultRowData}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    const infoIcons = container.querySelectorAll('svg.lucide-info')
    expect(infoIcons.length).toBeGreaterThan(0)
    fireEvent.click(infoIcons[0])

    expect(mockOnCalculationInfoClick).toHaveBeenCalledWith('interest', defaultRowData)
  })

  test('calls onCalculationInfoClick for tax info icon', () => {
    const { container } = render(
      <TaxSection
        rowData={defaultRowData}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    const infoIcons = container.querySelectorAll('svg.lucide-info')
    expect(infoIcons.length).toBeGreaterThan(1)
    fireEvent.click(infoIcons[1])

    expect(mockOnCalculationInfoClick).toHaveBeenCalledWith('tax', defaultRowData)
  })

  test('displays Günstigerprüfung when available with personal tax rate', () => {
    const rowDataWithGuenstigerPruefung = {
      ...defaultRowData,
      guenstigerPruefungResultRealizedGains: {
        isFavorable: 'personal',
        usedTaxRate: 0.18,
        explanation: 'Persönlicher Steuersatz ist günstiger',
      },
    }

    render(
      <TaxSection
        rowData={rowDataWithGuenstigerPruefung}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getByText(/🔍 Günstigerprüfung \(Veräußerung\):/)).toBeInTheDocument()
    expect(screen.getAllByText(/Persönlicher Steuersatz/).length).toBeGreaterThan(0)
    expect(screen.getByText(/18\.00/)).toBeInTheDocument()
  })

  test('displays Günstigerprüfung with Abgeltungssteuer', () => {
    const rowDataWithGuenstigerPruefung = {
      ...defaultRowData,
      guenstigerPruefungResultRealizedGains: {
        isFavorable: 'flatTax',
        usedTaxRate: 0.26375,
        explanation: 'Abgeltungssteuer ist günstiger',
      },
    }

    render(
      <TaxSection
        rowData={rowDataWithGuenstigerPruefung}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getAllByText(/Abgeltungssteuer/).length).toBeGreaterThan(0)
    expect(screen.getByText(/26\.38/)).toBeInTheDocument()
  })

  test('does not display Günstigerprüfung when not available', () => {
    render(
      <TaxSection
        rowData={defaultRowData}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.queryByText(/🔍 Günstigerprüfung/)).not.toBeInTheDocument()
  })

  test('displays Vorabpauschale when available and greater than zero', () => {
    const rowDataWithVorabpauschale = {
      ...defaultRowData,
      vorabpauschale: 250,
    }

    const { container } = render(
      <TaxSection
        rowData={rowDataWithVorabpauschale}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getByText(/📊 Vorabpauschale:/)).toBeInTheDocument()
    expect(screen.getByText(/250,00 €/)).toBeInTheDocument()

    // Find the info icon for Vorabpauschale (should be the third one after interest and tax)
    const infoIcons = container.querySelectorAll('svg.lucide-info')
    expect(infoIcons.length).toBeGreaterThan(2)
    fireEvent.click(infoIcons[2])

    expect(mockOnCalculationInfoClick).toHaveBeenCalledWith('vorabpauschale', rowDataWithVorabpauschale)
  })

  test('does not display Vorabpauschale when zero', () => {
    const rowDataWithVorabpauschale = {
      ...defaultRowData,
      vorabpauschale: 0,
    }

    render(
      <TaxSection
        rowData={rowDataWithVorabpauschale}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.queryByText(/📊 Vorabpauschale:/)).not.toBeInTheDocument()
  })

  test('does not display Vorabpauschale when undefined', () => {
    render(
      <TaxSection
        rowData={defaultRowData}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.queryByText(/📊 Vorabpauschale:/)).not.toBeInTheDocument()
  })

  test('displays tax allowance used', () => {
    render(
      <TaxSection
        rowData={defaultRowData}
        formValue={createMockFormValue()}
        allYears={[2024, 2025, 2026]}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getByText(/🎯 Genutzter Freibetrag:/)).toBeInTheDocument()
    expect(screen.getByText(/1\.000,00 €/)).toBeInTheDocument()
  })
})
