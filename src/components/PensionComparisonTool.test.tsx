import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PensionComparisonTool } from './PensionComparisonTool'

// Mock the pension comparison helper
vi.mock('../../helpers/pension-comparison', () => ({
  comparePensionTypes: vi.fn(config => {
    const comparisons = []
    let totalAnnualContributions = 0
    let totalAnnualTaxBenefits = 0
    let totalMonthlyPensionNet = 0
    let totalAnnualPensionNet = 0

    // Add Riester if configured
    if (config.riesterRente) {
      const riesterComparison = {
        type: 'riester',
        displayName: 'Riester-Rente',
        enabled: true,
        annualContribution: config.riesterRente.annualContribution,
        annualEmployerContribution: 0,
        annualTaxBenefit: 300,
        monthlyPensionGross: config.riesterRente.expectedMonthlyPension,
        monthlyPensionNet: config.riesterRente.expectedMonthlyPension * 0.8,
        annualPensionNet: config.riesterRente.expectedMonthlyPension * 0.8 * 12,
        totalContributions: config.riesterRente.annualContribution * 30,
        totalTaxBenefits: 300 * 30,
        totalNetPension: config.riesterRente.expectedMonthlyPension * 0.8 * 12 * 20,
        roi: 0.5,
        netLifetimeBenefit: 50000,
      }
      comparisons.push(riesterComparison)
      totalAnnualContributions += riesterComparison.annualContribution
      totalAnnualTaxBenefits += riesterComparison.annualTaxBenefit
      totalMonthlyPensionNet += riesterComparison.monthlyPensionNet
      totalAnnualPensionNet += riesterComparison.annualPensionNet
    }

    // Add Rürup if configured
    if (config.ruerupRente) {
      const ruerupComparison = {
        type: 'ruerup',
        displayName: 'Rürup-Rente',
        enabled: true,
        annualContribution: config.ruerupRente.annualContribution,
        annualEmployerContribution: 0,
        annualTaxBenefit: 1500,
        monthlyPensionGross: config.ruerupRente.expectedMonthlyPension,
        monthlyPensionNet: config.ruerupRente.expectedMonthlyPension * 0.8,
        annualPensionNet: config.ruerupRente.expectedMonthlyPension * 0.8 * 12,
        totalContributions: config.ruerupRente.annualContribution * 30,
        totalTaxBenefits: 1500 * 30,
        totalNetPension: config.ruerupRente.expectedMonthlyPension * 0.8 * 12 * 20,
        roi: 0.6,
        netLifetimeBenefit: 60000,
      }
      comparisons.push(ruerupComparison)
      totalAnnualContributions += ruerupComparison.annualContribution
      totalAnnualTaxBenefits += ruerupComparison.annualTaxBenefit
      totalMonthlyPensionNet += ruerupComparison.monthlyPensionNet
      totalAnnualPensionNet += ruerupComparison.annualPensionNet
    }

    // Add Betriebsrente if configured
    if (config.betriebsrente) {
      const betriebsrenteComparison = {
        type: 'betriebsrente',
        displayName: 'Betriebliche Altersvorsorge',
        enabled: true,
        annualContribution: config.betriebsrente.annualEmployeeContribution,
        annualEmployerContribution: config.betriebsrente.annualEmployerContribution,
        annualTaxBenefit: 800,
        monthlyPensionGross: config.betriebsrente.expectedMonthlyPension,
        monthlyPensionNet: config.betriebsrente.expectedMonthlyPension * 0.75,
        annualPensionNet: config.betriebsrente.expectedMonthlyPension * 0.75 * 12,
        totalContributions: config.betriebsrente.annualEmployeeContribution * 30,
        totalTaxBenefits: 800 * 30,
        totalNetPension: config.betriebsrente.expectedMonthlyPension * 0.75 * 12 * 20,
        roi: 0.7,
        netLifetimeBenefit: 70000,
      }
      comparisons.push(betriebsrenteComparison)
      totalAnnualContributions += betriebsrenteComparison.annualContribution
      totalAnnualTaxBenefits += betriebsrenteComparison.annualTaxBenefit
      totalMonthlyPensionNet += betriebsrenteComparison.monthlyPensionNet
      totalAnnualPensionNet += betriebsrenteComparison.annualPensionNet
    }

    return {
      comparisons,
      summary: {
        totalAnnualContributions,
        totalAnnualTaxBenefits,
        totalMonthlyPensionNet,
        totalAnnualPensionNet,
        combinedROI: 0.6,
        combinedNetLifetimeBenefit: 180000,
      },
      bestROI: comparisons.length > 0 ? comparisons[comparisons.length - 1] : null,
      bestNetBenefit: comparisons.length > 0 ? comparisons[comparisons.length - 1] : null,
    }
  }),
}))

describe('PensionComparisonTool', () => {
  it('should render with collapsed state by default', () => {
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    expect(heading).toBeInTheDocument()
  })

  it('should expand when clicked and show configuration form', async () => {
    const user = userEvent.setup()
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    await user.click(heading)

    // Check for info message
    expect(screen.getByText(/Vergleichen Sie verschiedene deutsche Rentenversicherungsarten/i)).toBeInTheDocument()

    // Check for general configuration fields
    expect(screen.getByText(/Allgemeine Einstellungen/i)).toBeInTheDocument()
    expect(screen.getByText(/Aktuelles Jahr/i)).toBeInTheDocument()
    expect(screen.getByText(/Jahresbruttoeinkommen/i)).toBeInTheDocument()
    expect(screen.getByText(/Rentenbeginn \(Jahr\)/i)).toBeInTheDocument()
  })

  it('should show pension type activation switches', async () => {
    const user = userEvent.setup()
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    await user.click(heading)

    // Check for pension type switches
    expect(screen.getByText(/Riester-Rente \(staatlich gefördert\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Rürup-Rente \(Basis-Rente\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Betriebsrente \(bAV\)/i)).toBeInTheDocument()
  })

  it('should enable Riester-Rente and show configuration', async () => {
    const user = userEvent.setup()
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    await user.click(heading)

    // Find and click Riester switch
    const riesterLabel = screen.getByText(/Riester-Rente \(staatlich gefördert\)/i)
    const riesterSwitch = riesterLabel.previousElementSibling as HTMLElement
    await user.click(riesterSwitch)

    // Check that Riester configuration appears - use getAllByText since it appears in multiple places
    const contributionLabels = screen.getAllByText(/Jährlicher Beitrag/i)
    expect(contributionLabels.length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Erwartete monatliche Rente/i).length).toBeGreaterThan(0)
  })

  it('should show comparison results when pension types are enabled', async () => {
    const user = userEvent.setup()
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    await user.click(heading)

    // Enable Riester
    const riesterLabel = screen.getByText(/Riester-Rente \(staatlich gefördert\)/i)
    const riesterSwitch = riesterLabel.previousElementSibling as HTMLElement
    await user.click(riesterSwitch)

    // Check for results table - ROI appears in both table header and metrics explanation
    expect(screen.getByText(/Rentenart/i)).toBeInTheDocument()
    expect(screen.getAllByText(/ROI/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Lebenszeit­gewinn/i)).toBeInTheDocument()
  })

  it('should show best options highlight when multiple pensions are enabled', async () => {
    const user = userEvent.setup()
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    await user.click(heading)

    // Enable Riester
    const riesterLabel = screen.getByText(/Riester-Rente \(staatlich gefördert\)/i)
    const riesterSwitch = riesterLabel.previousElementSibling as HTMLElement
    await user.click(riesterSwitch)

    // Enable Rürup
    const ruerupLabel = screen.getByText(/Rürup-Rente \(Basis-Rente\)/i)
    const ruerupSwitch = ruerupLabel.previousElementSibling as HTMLElement
    await user.click(ruerupSwitch)

    // Check for best options highlight
    expect(screen.getByText(/Beste Rendite \(ROI\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Höchster Lebenszeitgewinn/i)).toBeInTheDocument()
  })

  it('should allow editing general configuration values', async () => {
    const user = userEvent.setup()
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    await user.click(heading)

    // Find and edit annual gross income
    const incomeInput = screen.getByLabelText(/Jahresbruttoeinkommen/i) as HTMLInputElement
    await user.clear(incomeInput)
    await user.type(incomeInput, '60000')

    expect(incomeInput.value).toBe('60000')
  })

  it('should show detailed breakdown section', async () => {
    const user = userEvent.setup()
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    await user.click(heading)

    // Enable a pension type
    const riesterLabel = screen.getByText(/Riester-Rente \(staatlich gefördert\)/i)
    const riesterSwitch = riesterLabel.previousElementSibling as HTMLElement
    await user.click(riesterSwitch)

    // Check for detailed breakdown
    expect(screen.getByText(/Detaillierte Aufschlüsselung/i)).toBeInTheDocument()
    expect(screen.getByText(/Gesamte Beiträge/i)).toBeInTheDocument()
    expect(screen.getByText(/Gesamte Steuervorteile/i)).toBeInTheDocument()
  })

  it('should show explanation of metrics', async () => {
    const user = userEvent.setup()
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    await user.click(heading)

    // Enable a pension type to show results
    const riesterLabel = screen.getByText(/Riester-Rente \(staatlich gefördert\)/i)
    const riesterSwitch = riesterLabel.previousElementSibling as HTMLElement
    await user.click(riesterSwitch)

    // Check for metrics explanation
    expect(screen.getByText(/Erklärung der Metriken/i)).toBeInTheDocument()
    expect(screen.getByText(/Jährlicher Beitrag:/i)).toBeInTheDocument()
    expect(screen.getByText(/Steuervorteil:/i)).toBeInTheDocument()
  })

  it('should handle Betriebsrente with employer contribution', async () => {
    const user = userEvent.setup()
    render(<PensionComparisonTool />)

    const heading = screen.getByText(/Rentenversicherungs-Vergleich/i)
    await user.click(heading)

    // Enable Betriebsrente
    const betriebsrenteLabel = screen.getByText(/Betriebsrente \(bAV\)/i)
    const betriebsrenteSwitch = betriebsrenteLabel.previousElementSibling as HTMLElement
    await user.click(betriebsrenteSwitch)

    // Check for employer contribution field
    expect(screen.getByText(/Jährlicher Arbeitgeberbeitrag/i)).toBeInTheDocument()
  })
})
