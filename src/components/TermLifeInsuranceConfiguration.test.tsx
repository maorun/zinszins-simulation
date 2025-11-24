import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { TermLifeInsuranceConfiguration } from './TermLifeInsuranceConfiguration'
import { createDefaultTermLifeInsuranceConfig } from '../../helpers/term-life-insurance'

describe('TermLifeInsuranceConfiguration', () => {
  const defaultProps = {
    config: null,
    onChange: vi.fn(),
    currentYear: 2024,
    birthYear: 1989,
    planningMode: 'individual' as const,
  }

  it('renders the collapsed card initially', () => {
    render(<TermLifeInsuranceConfiguration {...defaultProps} />)

    expect(screen.getByText(/Risikolebensversicherung/)).toBeInTheDocument()
  })

  it('allows enabling the insurance', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TermLifeInsuranceConfiguration {...defaultProps} onChange={onChange} />)

    // First expand the collapsible
    const header = screen.getByText(/Risikolebensversicherung/)
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
    const config = createDefaultTermLifeInsuranceConfig()
    config.enabled = true

    render(<TermLifeInsuranceConfiguration {...defaultProps} config={config} />)

    // Expand the collapsible
    const header = screen.getByText(/Risikolebensversicherung/)
    await user.click(header)

    expect(screen.getByText(/reinen Todesfallschutz ohne Sparanteil/)).toBeInTheDocument()
  })

  it('shows couple mode hint when in couple planning mode', async () => {
    const user = userEvent.setup()
    const config = createDefaultTermLifeInsuranceConfig()
    config.enabled = true

    render(<TermLifeInsuranceConfiguration {...defaultProps} config={config} planningMode="couple" />)

    // Expand the collapsible
    const header = screen.getByText(/Risikolebensversicherung/)
    await user.click(header)

    expect(screen.getByText(/Hinweis für Ehepaare/)).toBeInTheDocument()
  })

  it('allows resetting to default values', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const config = createDefaultTermLifeInsuranceConfig()
    config.enabled = true
    config.coverageAmount = 500000

    render(<TermLifeInsuranceConfiguration {...defaultProps} config={config} onChange={onChange} birthYear={1989} />)

    // Expand the collapsible
    const header = screen.getByText(/Risikolebensversicherung/)
    await user.click(header)

    const resetButton = screen.getByText(/Auf Standardwerte zurücksetzen/)
    await user.click(resetButton)

    expect(onChange).toHaveBeenCalled()
    const newConfig = onChange.mock.calls[0]?.[0]
    expect(newConfig).toBeDefined()
    expect(newConfig?.enabled).toBe(true)
    expect(newConfig?.birthYear).toBe(1989)
  })

  it('allows disabling the insurance', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const config = createDefaultTermLifeInsuranceConfig()
    config.enabled = true

    render(<TermLifeInsuranceConfiguration {...defaultProps} config={config} onChange={onChange} />)

    // First expand the collapsible
    const header = screen.getByText(/Risikolebensversicherung/)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    expect(onChange).toHaveBeenCalled()
    const newConfig = onChange.mock.calls[0]?.[0]
    expect(newConfig?.enabled).toBe(false)
  })
})
