import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CareInsuranceConfiguration } from './CareInsuranceConfiguration'
import { createDefaultCareInsuranceConfig } from '../../helpers/care-insurance'

describe('CareInsuranceConfiguration', () => {
  const defaultProps = {
    config: null,
    onChange: vi.fn(),
    currentYear: 2024,
    birthYear: 1979,
    planningMode: 'individual' as const,
  }

  it('renders the collapsed card initially', () => {
    render(<CareInsuranceConfiguration {...defaultProps} />)

    expect(screen.getByText(/Pflegezusatzversicherung/)).toBeInTheDocument()
  })

  it('allows enabling the insurance', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<CareInsuranceConfiguration {...defaultProps} onChange={onChange} />)

    // First expand the collapsible
    const header = screen.getByText(/Pflegezusatzversicherung/)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    expect(onChange).toHaveBeenCalled()
    const config = onChange.mock.calls[0]?.[0]
    expect(config).toBeDefined()
    expect(config?.enabled).toBe(true)
  })

  it('shows configuration content when enabled', async () => {
    const user = userEvent.setup()
    const config = createDefaultCareInsuranceConfig()
    config.enabled = true

    render(<CareInsuranceConfiguration {...defaultProps} config={config} />)

    // Expand the collapsible
    const header = screen.getByText(/Pflegezusatzversicherung/)
    await user.click(header)

    expect(screen.getByText(/ergänzt die gesetzliche Pflegeversicherung/)).toBeInTheDocument()
  })

  it('shows Pflege-Bahr information when enabled', async () => {
    const user = userEvent.setup()
    const config = createDefaultCareInsuranceConfig()
    config.enabled = true

    render(<CareInsuranceConfiguration {...defaultProps} config={config} />)

    // Expand the collapsible
    const header = screen.getByText(/Pflegezusatzversicherung/)
    await user.click(header)

    expect(screen.getByText(/Pflege-Bahr/)).toBeInTheDocument()
    expect(screen.getByText(/5 €\/Monat Zuschuss/)).toBeInTheDocument()
  })

  it('shows couple mode hint when in couple planning mode', async () => {
    const user = userEvent.setup()
    const config = createDefaultCareInsuranceConfig()
    config.enabled = true

    render(<CareInsuranceConfiguration {...defaultProps} config={config} planningMode="couple" />)

    // Expand the collapsible
    const header = screen.getByText(/Pflegezusatzversicherung/)
    await user.click(header)

    expect(screen.getByText(/Hinweis für Ehepaare/)).toBeInTheDocument()
  })

  it('shows care cost information', async () => {
    const user = userEvent.setup()
    const config = createDefaultCareInsuranceConfig()
    config.enabled = true

    render(<CareInsuranceConfiguration {...defaultProps} config={config} />)

    // Expand the collapsible
    const header = screen.getByText(/Pflegezusatzversicherung/)
    await user.click(header)

    expect(screen.getByText(/2.000-4.500 €/)).toBeInTheDocument()
    expect(screen.getByText(/50-70%/)).toBeInTheDocument()
  })

  it('allows resetting to default values', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const config = createDefaultCareInsuranceConfig()
    config.enabled = true
    config.monthlyPremium = 100

    render(<CareInsuranceConfiguration {...defaultProps} config={config} onChange={onChange} birthYear={1979} />)

    // Expand the collapsible
    const header = screen.getByText(/Pflegezusatzversicherung/)
    await user.click(header)

    const resetButton = screen.getByText(/Auf Standardwerte zurücksetzen/)
    await user.click(resetButton)

    expect(onChange).toHaveBeenCalled()
    const newConfig = onChange.mock.calls[0]?.[0]
    expect(newConfig).toBeDefined()
    expect(newConfig?.enabled).toBe(true)
    expect(newConfig?.birthYear).toBe(1979)
  })

  it('allows disabling the insurance', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const config = createDefaultCareInsuranceConfig()
    config.enabled = true

    render(<CareInsuranceConfiguration {...defaultProps} config={config} onChange={onChange} />)

    // First expand the collapsible
    const header = screen.getByText(/Pflegezusatzversicherung/)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    expect(onChange).toHaveBeenCalled()
    const newConfig = onChange.mock.calls[0]?.[0]
    expect(newConfig?.enabled).toBe(false)
  })

  it('creates config with birth year when enabling', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<CareInsuranceConfiguration {...defaultProps} onChange={onChange} birthYear={1979} currentYear={2024} />)

    // First expand the collapsible
    const header = screen.getByText(/Pflegezusatzversicherung/)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    expect(onChange).toHaveBeenCalled()
    const config = onChange.mock.calls[0]?.[0]
    expect(config).toBeDefined()
    expect(config?.birthYear).toBe(1979)
    expect(config?.startYear).toBe(2024)
    expect(config?.endYear).toBe(2064) // 2024 + 40 years
  })

  it('shows tax information about benefits', async () => {
    const user = userEvent.setup()
    const config = createDefaultCareInsuranceConfig()
    config.enabled = true

    render(<CareInsuranceConfiguration {...defaultProps} config={config} />)

    // Expand the collapsible
    const header = screen.getByText(/Pflegezusatzversicherung/)
    await user.click(header)

    expect(screen.getByText(/§ 3 Nr. 1a EStG/)).toBeInTheDocument()
    expect(screen.getByText(/Steuerfreie Pflegeleistungen/)).toBeInTheDocument()
  })
})
