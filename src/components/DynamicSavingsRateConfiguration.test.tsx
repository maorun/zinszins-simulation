import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DynamicSavingsRateConfiguration } from './DynamicSavingsRateConfiguration'
import { createDefaultDynamicSavingsConfig } from '../../helpers/dynamic-savings-rate'

describe('DynamicSavingsRateConfiguration', () => {
  it('should render with default config', () => {
    const config = createDefaultDynamicSavingsConfig(2000, 1990)
    const onChange = vi.fn()

    render(<DynamicSavingsRateConfiguration config={config} onChange={onChange} startYear={2024} />)

    expect(screen.getByText('Dynamische Sparraten')).toBeInTheDocument()
  })

  it('should toggle enabled state', async () => {
    const user = userEvent.setup()
    const config = createDefaultDynamicSavingsConfig(2000, 1990)
    const onChange = vi.fn()

    render(<DynamicSavingsRateConfiguration config={config} onChange={onChange} startYear={2024} />)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    expect(onChange).toHaveBeenCalledWith({ ...config, enabled: true })
  })

  it('should show configuration options when enabled', () => {
    const config = createDefaultDynamicSavingsConfig(2000, 1990)
    config.enabled = true
    const onChange = vi.fn()

    render(<DynamicSavingsRateConfiguration config={config} onChange={onChange} startYear={2024} />)

    expect(screen.getByLabelText('Geburtsjahr')).toBeInTheDocument()
    expect(screen.getByText(/Feature implementiert/i)).toBeInTheDocument()
  })

  it('should update birth year', () => {
    const config = createDefaultDynamicSavingsConfig(2000, 1990)
    config.enabled = true
    const onChange = vi.fn()

    render(<DynamicSavingsRateConfiguration config={config} onChange={onChange} startYear={2024} />)

    const birthYearInput = screen.getByLabelText('Geburtsjahr') as HTMLInputElement

    // Use fireEvent to change the value
    fireEvent.change(birthYearInput, { target: { value: '1995' } })

    // Check that onChange was called with the new birth year
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall.birthYear).toBe(1995)
  })

  it('should display validation errors', () => {
    const config = createDefaultDynamicSavingsConfig(-100, 1800) // Invalid config
    config.enabled = true
    const onChange = vi.fn()

    render(<DynamicSavingsRateConfiguration config={config} onChange={onChange} startYear={2024} />)

    expect(screen.getByText('Validierungsfehler gefunden')).toBeInTheDocument()
  })
})
