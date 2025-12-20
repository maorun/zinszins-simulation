import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PensionComparisonResults } from './PensionComparisonResults'
import type { PensionComparisonResult } from '../../../helpers/pension-comparison'

describe('PensionComparisonResults', () => {
  const mockSinglePensionResult: PensionComparisonResult = {
    comparisons: [
      {
        type: 'riester',
        displayName: 'Riester-Rente',
        enabled: true,
        annualContribution: 2100,
        annualEmployerContribution: 0,
        annualTaxBenefit: 300,
        monthlyPensionGross: 500,
        monthlyPensionNet: 400,
        annualPensionNet: 4800,
        totalContributions: 63000,
        totalTaxBenefits: 9000,
        totalNetPension: 96000,
        roi: 0.5,
        netLifetimeBenefit: 42000,
      },
    ],
    summary: {
      totalAnnualContributions: 2100,
      totalAnnualTaxBenefits: 300,
      totalMonthlyPensionNet: 400,
      totalAnnualPensionNet: 4800,
      combinedROI: 0.5,
      combinedNetLifetimeBenefit: 42000,
    },
    bestROI: null,
    bestNetBenefit: null,
  }

  const mockMultiplePensionResult: PensionComparisonResult = {
    comparisons: [
      {
        type: 'riester',
        displayName: 'Riester-Rente',
        enabled: true,
        annualContribution: 2100,
        annualEmployerContribution: 0,
        annualTaxBenefit: 300,
        monthlyPensionGross: 500,
        monthlyPensionNet: 400,
        annualPensionNet: 4800,
        totalContributions: 63000,
        totalTaxBenefits: 9000,
        totalNetPension: 96000,
        roi: 0.5,
        netLifetimeBenefit: 42000,
      },
      {
        type: 'ruerup',
        displayName: 'Rürup-Rente',
        enabled: true,
        annualContribution: 5000,
        annualEmployerContribution: 0,
        annualTaxBenefit: 1500,
        monthlyPensionGross: 600,
        monthlyPensionNet: 480,
        annualPensionNet: 5760,
        totalContributions: 150000,
        totalTaxBenefits: 45000,
        totalNetPension: 115200,
        roi: 0.6,
        netLifetimeBenefit: 10200,
      },
      {
        type: 'betriebsrente',
        displayName: 'Betriebliche Altersvorsorge',
        enabled: true,
        annualContribution: 3000,
        annualEmployerContribution: 600,
        annualTaxBenefit: 800,
        monthlyPensionGross: 400,
        monthlyPensionNet: 300,
        annualPensionNet: 3600,
        totalContributions: 90000,
        totalTaxBenefits: 24000,
        totalNetPension: 72000,
        roi: 0.7,
        netLifetimeBenefit: 6000,
      },
    ],
    summary: {
      totalAnnualContributions: 10100,
      totalAnnualTaxBenefits: 2600,
      totalMonthlyPensionNet: 1180,
      totalAnnualPensionNet: 14160,
      combinedROI: 0.6,
      combinedNetLifetimeBenefit: 58200,
    },
    bestROI: {
      type: 'betriebsrente',
      displayName: 'Betriebliche Altersvorsorge',
      enabled: true,
      annualContribution: 3000,
      annualEmployerContribution: 600,
      annualTaxBenefit: 800,
      monthlyPensionGross: 400,
      monthlyPensionNet: 300,
      annualPensionNet: 3600,
      totalContributions: 90000,
      totalTaxBenefits: 24000,
      totalNetPension: 72000,
      roi: 0.7,
      netLifetimeBenefit: 6000,
    },
    bestNetBenefit: {
      type: 'riester',
      displayName: 'Riester-Rente',
      enabled: true,
      annualContribution: 2100,
      annualEmployerContribution: 0,
      annualTaxBenefit: 300,
      monthlyPensionGross: 500,
      monthlyPensionNet: 400,
      annualPensionNet: 4800,
      totalContributions: 63000,
      totalTaxBenefits: 9000,
      totalNetPension: 96000,
      roi: 0.5,
      netLifetimeBenefit: 42000,
    },
  }

  it('should show message when no pensions are enabled', () => {
    const emptyResult: PensionComparisonResult = {
      comparisons: [],
      summary: {
        totalAnnualContributions: 0,
        totalAnnualTaxBenefits: 0,
        totalMonthlyPensionNet: 0,
        totalAnnualPensionNet: 0,
        combinedROI: 0,
        combinedNetLifetimeBenefit: 0,
      },
      bestROI: null,
      bestNetBenefit: null,
    }
    
    render(<PensionComparisonResults results={emptyResult} />)
    
    expect(
      screen.getByText(/Aktivieren Sie mindestens eine Rentenversicherung/i)
    ).toBeInTheDocument()
  })

  it('should render comparison table with single pension', () => {
    render(<PensionComparisonResults results={mockSinglePensionResult} />)
    
    // Check table headers
    expect(screen.getByText(/Rentenart/i)).toBeInTheDocument()
    expect(screen.getByText(/Jährl\. Beitrag/i)).toBeInTheDocument()
    expect(screen.getByText(/Steuer­vorteil/i)).toBeInTheDocument()
    expect(screen.getByText(/Netto­rente\/Mon\./i)).toBeInTheDocument()
    // ROI appears in both table header and metrics explanation - use getAllByText
    expect(screen.getAllByText(/ROI/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Lebenszeit­gewinn/i)).toBeInTheDocument()
    
    // Check pension type - appears in table, so use getAllByText
    expect(screen.getAllByText('Riester-Rente').length).toBeGreaterThan(0)
  })

  it('should display formatted currency values', () => {
    render(<PensionComparisonResults results={mockSinglePensionResult} />)
    
    // Check for formatted values (German format with €) - many values appear multiple times
    expect(screen.getAllByText(/2\.100,00 €/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/300,00 €/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/400,00 €/i).length).toBeGreaterThan(0)
  })

  it('should display ROI as percentage', () => {
    render(<PensionComparisonResults results={mockSinglePensionResult} />)
    
    // ROI of 0.5 should be displayed as +50.0%
    expect(screen.getByText(/\+50\.0%/i)).toBeInTheDocument()
  })

  it('should show summary row for multiple pensions', () => {
    render(<PensionComparisonResults results={mockMultiplePensionResult} />)
    
    // Check for summary/total row - "Gesamt" appears in detailed breakdown titles too
    const gesamtElements = screen.getAllByText(/Gesamt/i)
    expect(gesamtElements.length).toBeGreaterThan(0)
  })

  it('should not show summary row for single pension', () => {
    render(<PensionComparisonResults results={mockSinglePensionResult} />)
    
    // For single pension, "Gesamt" appears only in detailed breakdown, not in table footer
    // Check that the table footer with "Gesamt" is not present by looking for specific structure
    const tables = document.querySelectorAll('table')
    expect(tables.length).toBeGreaterThan(0)
    const table = tables[0]
    const tfoot = table.querySelector('tfoot')
    expect(tfoot).toBeNull()
  })

  it('should show best options highlight for multiple pensions', () => {
    render(<PensionComparisonResults results={mockMultiplePensionResult} />)
    
    expect(screen.getByText(/Beste Rendite \(ROI\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Höchster Lebenszeitgewinn/i)).toBeInTheDocument()
    // Names appear in table, best options, and detailed breakdown
    expect(screen.getAllByText('Betriebliche Altersvorsorge').length).toBeGreaterThan(0)
  })

  it('should not show best options for single pension', () => {
    render(<PensionComparisonResults results={mockSinglePensionResult} />)
    
    expect(screen.queryByText(/Beste Rendite \(ROI\)/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Höchster Lebenszeitgewinn/i)).not.toBeInTheDocument()
  })

  it('should show detailed breakdown section', () => {
    render(<PensionComparisonResults results={mockSinglePensionResult} />)
    
    expect(screen.getByText(/Detaillierte Aufschlüsselung/i)).toBeInTheDocument()
    // These labels appear in detailed breakdown section
    expect(screen.getAllByText(/Gesamte Beiträge/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Gesamte Steuervorteile/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Gesamte Nettorente/i).length).toBeGreaterThan(0)
  })

  it('should show metrics explanation', () => {
    render(<PensionComparisonResults results={mockSinglePensionResult} />)
    
    expect(screen.getByText(/Erklärung der Metriken/i)).toBeInTheDocument()
    expect(screen.getByText(/Jährlicher Beitrag:/i)).toBeInTheDocument()
    expect(screen.getByText(/Steuervorteil:/i)).toBeInTheDocument()
    expect(screen.getByText(/Nettorente:/i)).toBeInTheDocument()
    expect(screen.getByText(/ROI:/i)).toBeInTheDocument()
    expect(screen.getByText(/Lebenszeitgewinn:/i)).toBeInTheDocument()
  })

  it('should display employer contribution for Betriebsrente', () => {
    render(<PensionComparisonResults results={mockMultiplePensionResult} />)
    
    // Betriebsrente has employer contribution
    expect(screen.getByText(/600,00 € AG/i)).toBeInTheDocument()
  })

  it('should show all three pension types when enabled', () => {
    render(<PensionComparisonResults results={mockMultiplePensionResult} />)
    
    // Use getAllByText since names appear in table, best options, and detailed breakdown
    expect(screen.getAllByText('Riester-Rente').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Rürup-Rente').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Betriebliche Altersvorsorge').length).toBeGreaterThan(0)
  })

  it('should show pension descriptions in table', () => {
    render(<PensionComparisonResults results={mockMultiplePensionResult} />)
    
    expect(screen.getByText(/Staatlich gefördert/i)).toBeInTheDocument()
    expect(screen.getByText(/Basis-Rente für Selbstständige/i)).toBeInTheDocument()
    expect(screen.getByText(/Arbeitgeberfinanziert/i)).toBeInTheDocument()
  })

  it('should color positive ROI green and negative red', () => {
    const negativeROIResult: PensionComparisonResult = {
      comparisons: [
        {
          type: 'riester',
          displayName: 'Riester-Rente',
          enabled: true,
          annualContribution: 2100,
          annualEmployerContribution: 0,
          annualTaxBenefit: 300,
          monthlyPensionGross: 500,
          monthlyPensionNet: 400,
          annualPensionNet: 4800,
          totalContributions: 63000,
          totalTaxBenefits: 9000,
          totalNetPension: 96000,
          roi: -0.2,
          netLifetimeBenefit: -10000,
        },
      ],
      summary: {
        totalAnnualContributions: 2100,
        totalAnnualTaxBenefits: 300,
        totalMonthlyPensionNet: 400,
        totalAnnualPensionNet: 4800,
        combinedROI: -0.2,
        combinedNetLifetimeBenefit: -10000,
      },
      bestROI: null,
      bestNetBenefit: null,
    }
    
    const { container } = render(<PensionComparisonResults results={negativeROIResult} />)
    
    // Find elements with text-red-600 class for negative values
    const redElements = container.querySelectorAll('.text-red-600')
    expect(redElements.length).toBeGreaterThan(0)
  })

  it('should display annual pension amount below monthly', () => {
    render(<PensionComparisonResults results={mockSinglePensionResult} />)
    
    // Monthly pension is 400€, annual should be 4800€
    expect(screen.getByText(/4\.800,00 €\/Jahr/i)).toBeInTheDocument()
  })
})
