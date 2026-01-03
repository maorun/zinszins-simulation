/**
 * Tests for GeographicDiversificationConfiguration component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GeographicDiversificationConfiguration } from './GeographicDiversificationConfiguration'
import { createDefaultGeographicDiversificationConfig } from '../../../helpers/geographic-diversification'

describe('GeographicDiversificationConfiguration', () => {
  it('renders the main switch', () => {
    const config = createDefaultGeographicDiversificationConfig()
    const onChange = vi.fn()

    render(<GeographicDiversificationConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Geografische Diversifikation')).toBeInTheDocument()
  })

  it('shows info box', () => {
    const config = createDefaultGeographicDiversificationConfig()
    const onChange = vi.fn()

    render(<GeographicDiversificationConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText(/Regionale Aufteilung internationaler Aktien/)).toBeInTheDocument()
  })

  it('displays all four geographic regions when enabled', () => {
    const config = createDefaultGeographicDiversificationConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(<GeographicDiversificationConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Nordamerika')).toBeInTheDocument()
    expect(screen.getByText('Europa (ex-Deutschland)')).toBeInTheDocument()
    expect(screen.getByText('Asien-Pazifik')).toBeInTheDocument()
    expect(screen.getByText('Schwellenländer')).toBeInTheDocument()
  })

  it('calls onChange when main switch is toggled', async () => {
    const user = userEvent.setup()
    const config = createDefaultGeographicDiversificationConfig()
    const onChange = vi.fn()

    render(<GeographicDiversificationConfiguration config={config} onChange={onChange} />)

    const switches = screen.getAllByRole('switch')
    await user.click(switches[0])

    expect(onChange).toHaveBeenCalledWith({ enabled: true })
  })

  it('shows portfolio statistics when enabled', () => {
    const config = createDefaultGeographicDiversificationConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(<GeographicDiversificationConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Portfolio-Rendite')).toBeInTheDocument()
    expect(screen.getByText('Portfolio-Risiko')).toBeInTheDocument()
  })

  it('shows action buttons when enabled', () => {
    const config = createDefaultGeographicDiversificationConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(<GeographicDiversificationConfiguration config={config} onChange={onChange} />)

    expect(screen.getByRole('button', { name: /Auf 100% normalisieren/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Zurücksetzen/ })).toBeInTheDocument()
  })

  it('shows withholding tax preview when value provided', () => {
    const config = createDefaultGeographicDiversificationConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(
      <GeographicDiversificationConfiguration
        config={config}
        onChange={onChange}
        internationalStocksValue={100000}
      />,
    )

    expect(screen.getByText('Geschätzte Quellensteuer-Auswirkung')).toBeInTheDocument()
  })

  it('displays validation errors when invalid', () => {
    const config = createDefaultGeographicDiversificationConfig()
    config.enabled = true
    Object.keys(config.regions).forEach((key) => {
      config.regions[key as keyof typeof config.regions].enabled = false
    })
    const onChange = vi.fn()

    render(<GeographicDiversificationConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Validierungsfehler:')).toBeInTheDocument()
  })

  it('calls onChange when normalize button clicked', async () => {
    const user = userEvent.setup()
    const config = createDefaultGeographicDiversificationConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(<GeographicDiversificationConfiguration config={config} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /Auf 100% normalisieren/ }))

    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange when reset button clicked', async () => {
    const user = userEvent.setup()
    const config = createDefaultGeographicDiversificationConfig()
    config.enabled = true
    const onChange = vi.fn()

    render(<GeographicDiversificationConfiguration config={config} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /Zurücksetzen/ }))

    expect(onChange).toHaveBeenCalled()
  })
})
