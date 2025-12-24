import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { BetriebsrenteConfiguration } from './BetriebsrenteConfiguration'
import type { BetriebsrenteConfig } from '../../helpers/betriebsrente'

describe('BetriebsrenteConfiguration', () => {
  const defaultConfig: BetriebsrenteConfig = {
    enabled: false,
    annualEmployeeContribution: 3600,
    annualEmployerContribution: 1800,
    pensionStartYear: 2050,
    expectedMonthlyPension: 500,
    pensionIncreaseRate: 0.01,
    implementationType: 'direktversicherung',
  }

  it('should render disabled state by default', () => {
    const onChange = vi.fn()
    render(<BetriebsrenteConfiguration config={defaultConfig} onChange={onChange} />)

    expect(screen.getByText('Betriebliche Altersvorsorge (bAV)')).toBeInTheDocument()
    expect(screen.getByText('Betriebliche Altersvorsorge aktivieren')).toBeInTheDocument()
    expect(
      screen.getByText('Aktivieren Sie die betriebliche Altersvorsorge, um Ihre Vorsorge zu planen.'),
    ).toBeInTheDocument()
  })

  it('should enable configuration when switch is toggled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BetriebsrenteConfiguration config={defaultConfig} onChange={onChange} />)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }))
  })

  it('should render configuration fields when enabled', () => {
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} />)

    expect(screen.getByText('Durchführungsweg')).toBeInTheDocument()
    expect(screen.getByText('Jährlicher Arbeitnehmerbeitrag (Entgeltumwandlung)')).toBeInTheDocument()
    expect(screen.getByText('Jährlicher Arbeitgeberzuschuss')).toBeInTheDocument()
    expect(screen.getByText('Rentenbeginn (Jahr)')).toBeInTheDocument()
    expect(screen.getByText('Erwartete monatliche Rente (brutto)')).toBeInTheDocument()
    expect(screen.getByText('Jährliche Rentenanpassung (%)')).toBeInTheDocument()
  })

  it('should render all implementation types', () => {
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} />)

    expect(screen.getByText('Direktversicherung')).toBeInTheDocument()
    expect(screen.getByText('Pensionskasse')).toBeInTheDocument()
    expect(screen.getByText('Pensionsfonds')).toBeInTheDocument()
    expect(screen.getByText('Direktzusage')).toBeInTheDocument()
    expect(screen.getByText('Unterstützungskasse')).toBeInTheDocument()
  })

  it('should update employee contribution', async () => {
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} />)

    const input = screen.getByLabelText('Jährlicher Arbeitnehmerbeitrag (Entgeltumwandlung)')
    fireEvent.change(input, { target: { value: '5000' } })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ annualEmployeeContribution: 5000 }))
  })

  it('should update employer contribution', async () => {
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} />)

    const input = screen.getByLabelText('Jährlicher Arbeitgeberzuschuss')
    fireEvent.change(input, { target: { value: '2400' } })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ annualEmployerContribution: 2400 }))
  })

  it('should update pension start year', async () => {
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} />)

    const input = screen.getByLabelText('Rentenbeginn (Jahr)')
    fireEvent.change(input, { target: { value: '2055' } })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ pensionStartYear: 2055 }))
  })

  it('should update expected monthly pension', async () => {
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} />)

    const input = screen.getByLabelText('Erwartete monatliche Rente (brutto)')
    fireEvent.change(input, { target: { value: '800' } })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ expectedMonthlyPension: 800 }))
  })

  it('should update pension increase rate', async () => {
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} />)

    const input = screen.getByLabelText('Jährliche Rentenanpassung (%)')
    fireEvent.change(input, { target: { value: '2.0' } })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ pensionIncreaseRate: 0.02 }))
  })

  it('should toggle tax calculation details', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} />)

    // Initially details are hidden
    expect(screen.queryByText('Steuerliche Berechnung')).not.toBeInTheDocument()

    // Click to show details
    const toggleButton = screen.getByText('Steuerberechnung anzeigen')
    await user.click(toggleButton)

    // Details should now be visible
    expect(screen.getByText('Steuerliche Berechnung')).toBeInTheDocument()
    expect(screen.getByText(/Ansparphase/)).toBeInTheDocument()
    expect(screen.getByText(/Auszahlungsphase/)).toBeInTheDocument()

    // Click again to hide
    const hideButton = screen.getByText('Steuerberechnung ausblenden')
    await user.click(hideButton)

    // Details should be hidden again
    expect(screen.queryByText('Steuerliche Berechnung')).not.toBeInTheDocument()
  })

  it('should display tax calculation details when shown', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(
      <BetriebsrenteConfiguration
        config={enabledConfig}
        onChange={onChange}
        contributionYear={2024}
        personalTaxRate={0.35}
        pensionTaxRate={0.25}
      />,
    )

    const toggleButton = screen.getByText('Steuerberechnung anzeigen')
    await user.click(toggleButton)

    // Check that calculation details are shown
    expect(screen.getByText('Steuerliche Berechnung')).toBeInTheDocument()
    expect(screen.getByText('Ansparphase (2024)')).toBeInTheDocument()
    expect(screen.getByText('Auszahlungsphase (erstes Rentenjahr)')).toBeInTheDocument()

    // Check for specific calculation fields
    expect(screen.getByText('Gesamtbeitrag (AN + AG):')).toBeInTheDocument()
    expect(screen.getByText('Steuerersparnis AN:')).toBeInTheDocument()
    expect(screen.getByText('SV-Ersparnis AN:')).toBeInTheDocument()
    expect(screen.getByText('Bruttomonatsrente:')).toBeInTheDocument()
    expect(screen.getByText('Nettomonatsrente:')).toBeInTheDocument()
  })

  it('should display limits info text', () => {
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} contributionYear={2024} />)

    // Should show BBG-based limits (text appears multiple times for employee and employer fields)
    expect(screen.getAllByText(/sozialversicherungsfrei/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/steuerfrei/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/4% BBG/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/8% BBG/).length).toBeGreaterThan(0)
  })

  it('should display tooltip info icon', () => {
    const onChange = vi.fn()
    render(<BetriebsrenteConfiguration config={defaultConfig} onChange={onChange} />)

    // Info icon should be present (rendered as SVG with tooltip trigger)
    const title = screen.getByText('Betriebliche Altersvorsorge (bAV)')
    expect(title).toBeInTheDocument()

    // The Info icon is inside the title element
    const svg = title.parentElement?.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should handle zero contributions', () => {
    const onChange = vi.fn()
    const zeroConfig: BetriebsrenteConfig = {
      ...defaultConfig,
      enabled: true,
      annualEmployeeContribution: 0,
      annualEmployerContribution: 0,
      expectedMonthlyPension: 0,
    }
    render(<BetriebsrenteConfiguration config={zeroConfig} onChange={onChange} />)

    expect(screen.getByText('Durchführungsweg')).toBeInTheDocument()
  })

  it('should select different implementation type', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<BetriebsrenteConfiguration config={enabledConfig} onChange={onChange} />)

    const pensionskasseButton = screen.getByText('Pensionskasse')
    await user.click(pensionskasseButton)

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ implementationType: 'pensionskasse' }))
  })
})
