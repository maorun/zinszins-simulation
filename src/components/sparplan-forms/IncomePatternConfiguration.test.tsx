import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { IncomePatternConfiguration } from './IncomePatternConfiguration'
import type { IncomePattern } from '../../utils/sparplan-utils'

describe('IncomePatternConfiguration', () => {
  test('renders with default disabled state', () => {
    const onChange = vi.fn()
    render(<IncomePatternConfiguration onChange={onChange} />)

    expect(screen.getByText('Schwankende Einkommen (Selbstständige)')).toBeInTheDocument()
    expect(screen.getByText('Einkommensmuster aktivieren')).toBeInTheDocument()

    // Should not show configuration options when disabled
    expect(screen.queryByText('Muster-Typ')).not.toBeInTheDocument()
  })

  test('shows configuration options when enabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<IncomePatternConfiguration onChange={onChange} />)

    // Enable the pattern
    const enableSwitch = screen.getByRole('switch', { name: /einkommensmuster aktivieren/i })
    await user.click(enableSwitch)

    // Should show configuration options
    expect(screen.getByText('Muster-Typ')).toBeInTheDocument()
    expect(screen.getByText('Monatlich')).toBeInTheDocument()
    expect(screen.getByText('Quartalsweise')).toBeInTheDocument()
    expect(screen.getByText('Vorlagen')).toBeInTheDocument()
  })

  test('calls onChange with pattern when enabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<IncomePatternConfiguration onChange={onChange} />)

    const enableSwitch = screen.getByRole('switch', { name: /einkommensmuster aktivieren/i })
    await user.click(enableSwitch)

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        type: 'monthly',
        monthlyMultipliers: expect.arrayContaining([1.0]),
      }),
    )
  })

  test('calls onChange with undefined when disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const initialPattern: IncomePattern = {
      enabled: true,
      type: 'monthly',
      monthlyMultipliers: Array(12).fill(1.0),
      quarterlyMultipliers: Array(4).fill(1.0),
    }

    render(<IncomePatternConfiguration incomePattern={initialPattern} onChange={onChange} />)

    const enableSwitch = screen.getByRole('switch', { name: /einkommensmuster aktivieren/i })
    await user.click(enableSwitch)

    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  test('switches between monthly and quarterly patterns', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const initialPattern: IncomePattern = {
      enabled: true,
      type: 'monthly',
      monthlyMultipliers: Array(12).fill(1.0),
      quarterlyMultipliers: Array(4).fill(1.0),
    }

    render(<IncomePatternConfiguration incomePattern={initialPattern} onChange={onChange} />)

    // Should start with monthly (12 months)
    expect(screen.getByText('Januar')).toBeInTheDocument()
    expect(screen.getByText('Dezember')).toBeInTheDocument()

    // Switch to quarterly
    const quarterlyButton = screen.getByRole('button', { name: /quartalsweise/i })
    await user.click(quarterlyButton)

    // Should show quarters instead of months
    expect(screen.getByText(/Q1 \(Jan-März\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Q4 \(Okt-Dez\)/i)).toBeInTheDocument()
    expect(screen.queryByText('Januar')).not.toBeInTheDocument()
  })

  test('applies seasonal preset correctly', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const initialPattern: IncomePattern = {
      enabled: true,
      type: 'monthly',
      monthlyMultipliers: Array(12).fill(1.0),
      quarterlyMultipliers: Array(4).fill(1.0),
    }

    render(<IncomePatternConfiguration incomePattern={initialPattern} onChange={onChange} />)

    const seasonalButton = screen.getByRole('button', { name: /saisonal/i })
    await user.click(seasonalButton)

    // Should update with seasonal pattern
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        type: 'monthly',
        monthlyMultipliers: [
          1.3,
          1.2,
          1.1, // Q1
          1.0,
          0.9,
          0.8, // Q2
          0.7,
          0.8,
          0.9, // Q3
          1.0,
          1.2,
          1.4, // Q4
        ],
        description: expect.stringContaining('Saisonales Geschäft'),
      }),
    )
  })

  test('applies quarterly cycle preset correctly', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const initialPattern: IncomePattern = {
      enabled: true,
      type: 'monthly',
      monthlyMultipliers: Array(12).fill(1.0),
      quarterlyMultipliers: Array(4).fill(1.0),
    }

    render(<IncomePatternConfiguration incomePattern={initialPattern} onChange={onChange} />)

    const quarterlyButton = screen.getByRole('button', { name: /quartalszyklus/i })
    await user.click(quarterlyButton)

    // Should update with quarterly pattern
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        type: 'quarterly',
        quarterlyMultipliers: [0.8, 1.0, 1.3, 0.9],
        description: expect.stringContaining('Quartalsweiser Zyklus'),
      }),
    )
  })

  test('resets multipliers to 1.0', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const initialPattern: IncomePattern = {
      enabled: true,
      type: 'monthly',
      monthlyMultipliers: [1.5, 1.5, 1.5, 1.5, 0.5, 0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0],
      quarterlyMultipliers: Array(4).fill(1.0),
    }

    render(<IncomePatternConfiguration incomePattern={initialPattern} onChange={onChange} />)

    const resetButton = screen.getByRole('button', { name: /zurücksetzen/i })
    await user.click(resetButton)

    // Should reset all multipliers to 1.0
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        type: 'monthly',
        monthlyMultipliers: Array(12).fill(1.0),
      }),
    )
  })

  test('updates individual multiplier values', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const initialPattern: IncomePattern = {
      enabled: true,
      type: 'monthly',
      monthlyMultipliers: Array(12).fill(1.0),
      quarterlyMultipliers: Array(4).fill(1.0),
    }

    render(<IncomePatternConfiguration incomePattern={initialPattern} onChange={onChange} />)

    // Find January input and change its value
    const januaryInput = screen.getByLabelText('Januar') as HTMLInputElement

    // Clear completely and type new value
    await user.tripleClick(januaryInput) // Select all
    await user.keyboard('2.5') // Type new value

    // After typing, should have been called with updated pattern
    // The onChange is called after each character, so we check the last call
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall).toMatchObject({
      enabled: true,
      type: 'monthly',
    })
    expect(lastCall.monthlyMultipliers[0]).toBeCloseTo(2.5, 1)
  })

  test('updates description field', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const initialPattern: IncomePattern = {
      enabled: true,
      type: 'monthly',
      monthlyMultipliers: Array(12).fill(1.0),
      quarterlyMultipliers: Array(4).fill(1.0),
    }

    render(<IncomePatternConfiguration incomePattern={initialPattern} onChange={onChange} />)

    const descriptionInput = screen.getByPlaceholderText(/z\.B\. Saisongeschäft/i)
    await user.type(descriptionInput, 'My custom pattern')

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        description: 'My custom pattern',
      }),
    )
  })

  test('displays info panel when enabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<IncomePatternConfiguration onChange={onChange} />)

    const enableSwitch = screen.getByRole('switch', { name: /einkommensmuster aktivieren/i })
    await user.click(enableSwitch)

    expect(screen.getByText(/ℹ️ Hinweis:/i)).toBeInTheDocument()
    expect(screen.getByText(/Die Multiplikatoren werden auf den Basis-Betrag angewendet/i)).toBeInTheDocument()
  })
})
