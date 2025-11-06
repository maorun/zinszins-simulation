import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OtherIncomeSection, HealthCareInsuranceSection, StatutoryPensionSection } from './withdrawal-card-sections'

describe('withdrawal-card-sections', () => {
  const mockOnCalculationInfoClick = vi.fn()
  const mockRowData = {}

  describe('OtherIncomeSection', () => {
    test('renders nothing when otherIncome is undefined', () => {
      const { container } = render(
        <OtherIncomeSection
          otherIncome={undefined}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )
      expect(container.firstChild).toBeNull()
    })

    test('renders nothing when totalNetAmount is 0', () => {
      const { container } = render(
        <OtherIncomeSection
          otherIncome={{
            totalNetAmount: 0,
            totalTaxAmount: 0,
            sourceCount: 0,
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )
      expect(container.firstChild).toBeNull()
    })

    test('renders other income information when available', () => {
      render(
        <OtherIncomeSection
          otherIncome={{
            totalNetAmount: 5000,
            totalTaxAmount: 1000,
            sourceCount: 2,
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )

      expect(screen.getByText(/💰 Andere Einkünfte \(Netto\):/)).toBeInTheDocument()
      expect(screen.getByText(/📊 Anzahl Einkommensquellen:/)).toBeInTheDocument()
    })

    test('displays tax amount when greater than 0', () => {
      render(
        <OtherIncomeSection
          otherIncome={{
            totalNetAmount: 5000,
            totalTaxAmount: 1000,
            sourceCount: 2,
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )

      expect(screen.getByText(/💸 Steuern auf andere Einkünfte:/)).toBeInTheDocument()
    })

    test('does not display tax amount when 0', () => {
      render(
        <OtherIncomeSection
          otherIncome={{
            totalNetAmount: 5000,
            totalTaxAmount: 0,
            sourceCount: 1,
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )

      expect(screen.queryByText(/💸 Steuern auf andere Einkünfte:/)).not.toBeInTheDocument()
    })
  })

  describe('HealthCareInsuranceSection', () => {
    test('renders nothing when healthCareInsurance is undefined', () => {
      const { container } = render(
        <HealthCareInsuranceSection
          healthCareInsurance={undefined}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )
      expect(container.firstChild).toBeNull()
    })

    test('renders nothing when totalAnnual is 0', () => {
      const { container } = render(
        <HealthCareInsuranceSection
          healthCareInsurance={{
            totalAnnual: 0,
            healthInsuranceAnnual: 0,
            careInsuranceAnnual: 0,
            totalMonthly: 0,
            insuranceType: 'statutory',
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )
      expect(container.firstChild).toBeNull()
    })

    test('renders statutory health care insurance information', () => {
      render(
        <HealthCareInsuranceSection
          healthCareInsurance={{
            totalAnnual: 6000,
            healthInsuranceAnnual: 4000,
            careInsuranceAnnual: 2000,
            totalMonthly: 500,
            insuranceType: 'statutory',
            effectiveHealthInsuranceRate: 14.6,
            effectiveCareInsuranceRate: 3.4,
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )

      expect(screen.getAllByText(/Gesetzlich/).length).toBeGreaterThan(0)
      expect(screen.getByText(/🏥 Krankenversicherung/)).toBeInTheDocument()
      expect(screen.getByText(/🩺 Pflegeversicherung:/)).toBeInTheDocument()
      expect(screen.getByText(/📅 Monatliche Beiträge:/)).toBeInTheDocument()
    })

    test('renders private health care insurance information', () => {
      render(
        <HealthCareInsuranceSection
          healthCareInsurance={{
            totalAnnual: 7200,
            healthInsuranceAnnual: 5000,
            careInsuranceAnnual: 2200,
            totalMonthly: 600,
            insuranceType: 'private',
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )

      expect(screen.getAllByText(/Privat/).length).toBeGreaterThan(0)
    })
  })

  describe('StatutoryPensionSection', () => {
    test('renders nothing when statutoryPension is undefined', () => {
      const { container } = render(
        <StatutoryPensionSection
          statutoryPension={undefined}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )
      expect(container.firstChild).toBeNull()
    })

    test('renders nothing when grossAnnualAmount is 0', () => {
      const { container } = render(
        <StatutoryPensionSection
          statutoryPension={{
            grossAnnualAmount: 0,
            netAnnualAmount: 0,
            incomeTax: 0,
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )
      expect(container.firstChild).toBeNull()
    })

    test('renders statutory pension information', () => {
      render(
        <StatutoryPensionSection
          statutoryPension={{
            grossAnnualAmount: 15000,
            netAnnualAmount: 13000,
            incomeTax: 2000,
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )

      expect(screen.getByText(/🏛️ Gesetzliche Rente \(Brutto\):/)).toBeInTheDocument()
      expect(screen.getByText(/🏛️ Gesetzliche Rente \(Netto\):/)).toBeInTheDocument()
      expect(screen.getByText(/📅 Monatliche Rente \(Netto\):/)).toBeInTheDocument()
    })

    test('displays income tax when greater than 0', () => {
      render(
        <StatutoryPensionSection
          statutoryPension={{
            grossAnnualAmount: 15000,
            netAnnualAmount: 13000,
            incomeTax: 2000,
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )

      expect(screen.getByText(/💸 Einkommensteuer auf Rente:/)).toBeInTheDocument()
    })

    test('does not display income tax when 0', () => {
      render(
        <StatutoryPensionSection
          statutoryPension={{
            grossAnnualAmount: 15000,
            netAnnualAmount: 15000,
            incomeTax: 0,
          }}
          onCalculationInfoClick={mockOnCalculationInfoClick}
          rowData={mockRowData}
        />,
      )

      expect(screen.queryByText(/💸 Einkommensteuer auf Rente:/)).not.toBeInTheDocument()
    })
  })
})
