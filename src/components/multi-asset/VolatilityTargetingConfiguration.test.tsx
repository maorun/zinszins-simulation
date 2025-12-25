import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { VolatilityTargetingConfiguration } from './VolatilityTargetingConfiguration'
import { createDefaultVolatilityTargetingConfig } from '../../../helpers/volatility-targeting'

describe('VolatilityTargetingConfiguration', () => {
  it('renders with default config', () => {
    const config = createDefaultVolatilityTargetingConfig()
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Volatilitäts-Targeting')).toBeInTheDocument()
    expect(screen.getByText('Dynamische Allokation aktivieren')).toBeInTheDocument()
  })

  it('shows enabled switch', () => {
    const config = createDefaultVolatilityTargetingConfig()
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()
  })

  it('calls onChange when enabling', async () => {
    const user = userEvent.setup()
    const config = createDefaultVolatilityTargetingConfig()
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(onChange).toHaveBeenCalledWith({ enabled: true })
  })

  it('shows detailed configuration when enabled', () => {
    const config = { ...createDefaultVolatilityTargetingConfig(), enabled: true }
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Strategie')).toBeInTheDocument()
    expect(screen.getByText('Ziel-Volatilität (jährlich)')).toBeInTheDocument()
  })

  it('does not show detailed config when disabled', () => {
    const config = { ...createDefaultVolatilityTargetingConfig(), enabled: false }
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    expect(screen.queryByText('Strategie')).not.toBeInTheDocument()
    expect(screen.queryByText('Ziel-Volatilität (jährlich)')).not.toBeInTheDocument()
  })

  it('displays validation errors', () => {
    const config = {
      ...createDefaultVolatilityTargetingConfig(),
      enabled: true,
      targetVolatility: 1.5, // Invalid: > 1.0
    }
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Konfigurationsfehler:')).toBeInTheDocument()
    expect(screen.getByText(/Ziel-Volatilität muss zwischen 0% und 100% liegen/)).toBeInTheDocument()
  })

  it('shows strategy description', () => {
    const config = { ...createDefaultVolatilityTargetingConfig(), enabled: true }
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    expect(
      screen.getByText(/Skaliert riskante Assets basierend auf realisierter Volatilität/),
    ).toBeInTheDocument()
  })

  it('renders all configuration fields when enabled and strategy is not none', () => {
    const config = { ...createDefaultVolatilityTargetingConfig(), enabled: true, strategy: 'simple' as const }
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    expect(screen.getByText('Lookback-Periode')).toBeInTheDocument()
    expect(screen.getByText('Minimale Risikoallokation')).toBeInTheDocument()
    expect(screen.getByText('Maximale Risikoallokation')).toBeInTheDocument()
    expect(screen.getByText('Glättungsfaktor')).toBeInTheDocument()
  })

  it('renders target volatility input with correct value', () => {
    const config = { ...createDefaultVolatilityTargetingConfig(), enabled: true, targetVolatility: 0.12 }
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    const input = screen.getByLabelText('Ziel-Volatilität (jährlich)') as HTMLInputElement
    expect(input.value).toBe('12.0') // 0.12 * 100 = 12.0
  })

  it('renders lookback years input with correct value', () => {
    const config = { ...createDefaultVolatilityTargetingConfig(), enabled: true, lookbackYears: 5 }
    const onChange = vi.fn()

    render(<VolatilityTargetingConfiguration config={config} onChange={onChange} />)

    const input = screen.getByLabelText('Lookback-Periode') as HTMLInputElement
    expect(input.value).toBe('5')
  })
})
