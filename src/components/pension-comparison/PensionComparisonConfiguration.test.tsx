import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PensionComparisonConfiguration } from './PensionComparisonConfiguration'
import type { PensionComparisonConfig } from '../../../helpers/pension-comparison'

describe('PensionComparisonConfiguration', () => {
  const defaultConfig: PensionComparisonConfig = {
    currentYear: 2024,
    pensionStartYear: 2056,
    pensionEndYear: 2076,
    personalTaxRate: 0.35,
    pensionTaxRate: 0.20,
    annualGrossIncome: 50000,
    socialSecurityRate: 0.20,
    inStatutoryHealthInsurance: true,
    hasChildren: true,
  }

  it('should render all general configuration fields', () => {
    const onConfigChange = vi.fn()
    render(<PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />)
    
    expect(screen.getByText(/Allgemeine Einstellungen/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Aktuelles Jahr/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Jahresbruttoeinkommen/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Rentenbeginn \(Jahr\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Rentenende \(Jahr\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Steuersatz während Erwerbsphase/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Steuersatz während Rente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sozialversicherungssatz/i)).toBeInTheDocument()
  })

  it('should display formatted currency for annual gross income', () => {
    const onConfigChange = vi.fn()
    render(<PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />)
    
    expect(screen.getByText(/50\.000,00 €/i)).toBeInTheDocument()
  })

  it('should handle general config changes', async () => {
    const user = userEvent.setup()
    const onConfigChange = vi.fn()
    render(<PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />)
    
    const incomeInput = screen.getByLabelText(/Jahresbruttoeinkommen/i) as HTMLInputElement
    await user.clear(incomeInput)
    await user.type(incomeInput, '60000')
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        annualGrossIncome: 60000,
      })
    )
  })

  it('should render pension type activation switches', () => {
    const onConfigChange = vi.fn()
    render(<PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />)
    
    expect(screen.getByText(/Rentenversicherungen aktivieren/i)).toBeInTheDocument()
    expect(screen.getByText(/Riester-Rente \(staatlich gefördert\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Rürup-Rente \(Basis-Rente\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Betriebsrente \(bAV\)/i)).toBeInTheDocument()
  })

  it('should enable Riester-Rente and show configuration', async () => {
    const user = userEvent.setup()
    const onConfigChange = vi.fn()
    render(<PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />)
    
    const riesterLabel = screen.getByText(/Riester-Rente \(staatlich gefördert\)/i)
    const riesterSwitch = riesterLabel.previousElementSibling as HTMLElement
    await user.click(riesterSwitch)
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        riesterRente: expect.objectContaining({
          enabled: true,
          annualContribution: 2100,
        }),
      })
    )
  })

  it('should show Riester configuration when enabled', () => {
    const onConfigChange = vi.fn()
    const configWithRiester = {
      ...defaultConfig,
      riesterRente: {
        enabled: true,
        annualGrossIncome: 50000,
        annualContribution: 2100,
        numberOfChildren: 2,
        childrenBirthYears: [2015, 2018],
        pensionStartYear: 2056,
        expectedMonthlyPension: 500,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      },
    }
    
    render(<PensionComparisonConfiguration config={configWithRiester} onConfigChange={onConfigChange} />)
    
    expect(screen.getByLabelText(/Anzahl Kinder/i)).toBeInTheDocument()
  })

  it('should enable Rürup-Rente and show configuration', async () => {
    const user = userEvent.setup()
    const onConfigChange = vi.fn()
    render(<PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />)
    
    const ruerupLabel = screen.getByText(/Rürup-Rente \(Basis-Rente\)/i)
    const ruerupSwitch = ruerupLabel.previousElementSibling as HTMLElement
    await user.click(ruerupSwitch)
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ruerupRente: expect.objectContaining({
          enabled: true,
          annualContribution: 5000,
        }),
      })
    )
  })

  it('should enable Betriebsrente and show configuration', async () => {
    const user = userEvent.setup()
    const onConfigChange = vi.fn()
    render(<PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />)
    
    const betriebsrenteLabel = screen.getByText(/Betriebsrente \(bAV\)/i)
    const betriebsrenteSwitch = betriebsrenteLabel.previousElementSibling as HTMLElement
    await user.click(betriebsrenteSwitch)
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        betriebsrente: expect.objectContaining({
          enabled: true,
          annualEmployeeContribution: 3000,
          annualEmployerContribution: 600,
        }),
      })
    )
  })

  it('should show Betriebsrente configuration when enabled', () => {
    const onConfigChange = vi.fn()
    const configWithBetriebsrente = {
      ...defaultConfig,
      betriebsrente: {
        enabled: true,
        annualEmployeeContribution: 3000,
        annualEmployerContribution: 600,
        pensionStartYear: 2056,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        implementationType: 'direktversicherung' as const,
      },
    }
    
    render(<PensionComparisonConfiguration config={configWithBetriebsrente} onConfigChange={onConfigChange} />)
    
    expect(screen.getByLabelText(/Jährlicher Arbeitnehmerbeitrag/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Jährlicher Arbeitgeberbeitrag/i)).toBeInTheDocument()
  })

  it('should disable pension type when switch is toggled off', async () => {
    const user = userEvent.setup()
    const onConfigChange = vi.fn()
    const configWithRiester = {
      ...defaultConfig,
      riesterRente: {
        enabled: true,
        annualGrossIncome: 50000,
        annualContribution: 2100,
        numberOfChildren: 2,
        childrenBirthYears: [2015, 2018],
        pensionStartYear: 2056,
        expectedMonthlyPension: 500,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      },
    }
    
    render(<PensionComparisonConfiguration config={configWithRiester} onConfigChange={onConfigChange} />)
    
    const riesterLabel = screen.getByText(/Riester-Rente \(staatlich gefördert\)/i)
    const riesterSwitch = riesterLabel.previousElementSibling as HTMLElement
    await user.click(riesterSwitch)
    
    // Config should be called without riesterRente
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.not.objectContaining({
        riesterRente: expect.anything(),
      })
    )
  })

  it('should handle tax rate percentage display correctly', () => {
    const onConfigChange = vi.fn()
    render(<PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />)
    
    const personalTaxInput = screen.getByLabelText(/Steuersatz während Erwerbsphase/i) as HTMLInputElement
    expect(personalTaxInput.value).toBe('35.0')
    
    const pensionTaxInput = screen.getByLabelText(/Steuersatz während Rente/i) as HTMLInputElement
    expect(pensionTaxInput.value).toBe('20.0')
  })

  it('should handle boolean switches correctly', async () => {
    const user = userEvent.setup()
    const onConfigChange = vi.fn()
    render(<PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />)
    
    const healthInsuranceLabel = screen.getByText(/Gesetzlich krankenversichert/i)
    const healthInsuranceSwitch = healthInsuranceLabel.previousElementSibling as HTMLElement
    await user.click(healthInsuranceSwitch)
    
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        inStatutoryHealthInsurance: false,
      })
    )
  })

  it('should use unique IDs for all form elements', () => {
    const onConfigChange = vi.fn()
    const { container } = render(
      <PensionComparisonConfiguration config={defaultConfig} onConfigChange={onConfigChange} />
    )
    
    const inputs = container.querySelectorAll('input')
    const ids = Array.from(inputs).map((input) => input.id).filter(Boolean)
    
    // All IDs should be unique
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
