import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { YearHeader } from './YearHeader'
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

describe('YearHeader', () => {
  const mockFormatWithInflation = vi.fn(
    params => `${params.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`,
  )
  const mockOnCalculationInfoClick = vi.fn()
  const mockRowData = { year: 2024, endkapital: 105000 }

  test('renders year correctly', () => {
    render(
      <YearHeader
        year={2024}
        endkapital={105000}
        allYears={[2024, 2025, 2026]}
        formValue={createMockFormValue()}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        rowData={mockRowData}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(screen.getByText(/📅 2024/)).toBeInTheDocument()
  })

  test('displays formatted end capital', () => {
    render(
      <YearHeader
        year={2024}
        endkapital={105000}
        allYears={[2024, 2025, 2026]}
        formValue={createMockFormValue()}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        rowData={mockRowData}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    expect(mockFormatWithInflation).toHaveBeenCalledWith({
      value: 105000,
      year: 2024,
      allYears: [2024, 2025, 2026],
      formValue: expect.any(Object),
      showIcon: true,
    })
  })

  test('calls onCalculationInfoClick when info icon is clicked', () => {
    const { container } = render(
      <YearHeader
        year={2024}
        endkapital={105000}
        allYears={[2024, 2025, 2026]}
        formValue={createMockFormValue()}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        rowData={mockRowData}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    const infoIcon = container.querySelector('svg.lucide-info')
    expect(infoIcon).toBeTruthy()
    fireEvent.click(infoIcon!)

    expect(mockOnCalculationInfoClick).toHaveBeenCalledWith('endkapital', mockRowData)
  })

  test('renders with correct styling classes', () => {
    const { container } = render(
      <YearHeader
        year={2024}
        endkapital={105000}
        allYears={[2024, 2025, 2026]}
        formValue={createMockFormValue()}
        onCalculationInfoClick={mockOnCalculationInfoClick}
        rowData={mockRowData}
        formatWithInflation={mockFormatWithInflation}
      />,
    )

    const headerDiv = container.querySelector('.border-b.border-gray-200')
    expect(headerDiv).toBeInTheDocument()
  })
})
