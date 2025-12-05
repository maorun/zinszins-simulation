import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { EMRenteConfiguration } from './EMRenteConfiguration'
import type { EMRenteConfig } from '../../helpers/em-rente'

describe('EMRenteConfiguration', () => {
  const mockOnChange = vi.fn()

  const defaultConfig: EMRenteConfig = {
    enabled: true,
    type: 'volle',
    disabilityStartYear: 2024,
    birthYear: 1979,
    accumulatedPensionPoints: 25.0,
    contributionYears: 25,
    region: 'west',
    annualIncreaseRate: 1.0,
    applyZurechnungszeiten: true,
    applyAbschlaege: true,
    taxablePercentage: 80,
  }

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render disabled state when config is null', () => {
    render(<EMRenteConfiguration config={null} onChange={mockOnChange} />)

    expect(screen.getByText('EM-Rente (Erwerbsminderungsrente)')).toBeInTheDocument()
    expect(
      screen.getByText(/Aktivieren Sie die EM-Rente-Berechnung/)
    ).toBeInTheDocument()
  })

  it('should enable configuration when toggle is switched on', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={null} onChange={mockOnChange} />)

    const toggle = screen.getByRole('switch')
    await user.click(toggle)

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        type: 'volle',
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
      })
    )
  })

  it('should disable configuration when toggle is switched off', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    const toggle = screen.getByRole('switch')
    await user.click(toggle)

    expect(mockOnChange).toHaveBeenCalledWith(null)
  })

  it('should render all configuration fields when enabled', () => {
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    expect(screen.getByLabelText(/Rentenart/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Region/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Beginn der Erwerbsminderung/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Geburtsjahr/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Rentenpunkte/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Beitragsjahre/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Jährliche Rentenanpassung/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Steuerpflichtiger Anteil/)).toBeInTheDocument()
  })

  it('should display information card', () => {
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    expect(screen.getByText(/Volle EM-Rente:/)).toBeInTheDocument()
    expect(screen.getByText(/Teilweise EM-Rente:/)).toBeInTheDocument()
    expect(screen.getByText(/Zurechnungszeiten:/)).toBeInTheDocument()
    expect(screen.getByText(/Abschläge:/)).toBeInTheDocument()
  })

  it('should update disability start year', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    const input = screen.getByLabelText(/Beginn der Erwerbsminderung/)
    await user.clear(input)
    await user.type(input, '2025')

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        disabilityStartYear: 2025,
      })
    )
  })

  it('should update pension points', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    const input = screen.getByLabelText(/Rentenpunkte/)
    await user.click(input)
    await user.keyboard('{Control>}a{/Control}30.5')

    // Check the last call since onChange is called for each keystroke
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall).toMatchObject({
      accumulatedPensionPoints: 30.5,
    })
  })

  it('should update contribution years', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    const input = screen.getByLabelText(/Beitragsjahre/)
    await user.click(input)
    await user.keyboard('{Control>}a{/Control}30')

    // Check the last call since onChange is called for each keystroke
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall).toMatchObject({
      contributionYears: 30,
    })
  })

  it('should update annual increase rate', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    const input = screen.getByLabelText(/Jährliche Rentenanpassung/)
    await user.clear(input)
    await user.type(input, '1.5')

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        annualIncreaseRate: 1.5,
      })
    )
  })

  it('should update taxable percentage', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    const input = screen.getByLabelText(/Steuerpflichtiger Anteil/)
    await user.click(input)
    await user.keyboard('{Control>}a{/Control}85')

    // Check the last call since onChange is called for each keystroke
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall).toMatchObject({
      taxablePercentage: 85,
    })
  })

  it('should update monthly additional income', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    const input = screen.getByLabelText(/Monatlicher Hinzuverdienst/)
    await user.click(input)
    await user.keyboard('{Control>}a{/Control}500')

    // Check the last call since onChange is called for each keystroke
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall).toMatchObject({
      monthlyAdditionalIncome: 500,
    })
  })

  it('should toggle Zurechnungszeiten', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    const toggle = screen.getByLabelText(/Zurechnungszeiten berücksichtigen/)
    await user.click(toggle)

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        applyZurechnungszeiten: false,
      })
    )
  })

  it('should toggle Abschläge', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={defaultConfig} onChange={mockOnChange} />)

    const toggle = screen.getByLabelText(/Abschläge anwenden/)
    await user.click(toggle)

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        applyAbschlaege: false,
      })
    )
  })

  it('should use provided birthYear as default', async () => {
    const user = userEvent.setup()
    render(<EMRenteConfiguration config={null} onChange={mockOnChange} birthYear={1985} currentYear={2024} />)

    // Enable the configuration
    const toggle = screen.getByRole('switch')
    await user.click(toggle)

    // Check that onChange was called with birthYear 1985
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        birthYear: 1985,
        disabilityStartYear: 2024,
      })
    )
  })
})
