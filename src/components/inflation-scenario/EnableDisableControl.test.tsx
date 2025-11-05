import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EnableDisableControl } from './EnableDisableControl'

describe('EnableDisableControl', () => {
  it('should render enabled and disabled options', () => {
    const mockOnChange = vi.fn()
    render(
      <EnableDisableControl
        isEnabled={false}
        onEnabledChange={mockOnChange}
        enabledRadioId="test-enabled"
        disabledRadioId="test-disabled"
      />,
    )

    expect(screen.getByText('Inflationsszenario aktivieren')).toBeInTheDocument()
    expect(screen.getByText('Aktiviert')).toBeInTheDocument()
    expect(screen.getByText('Deaktiviert')).toBeInTheDocument()
  })

  it('should call onEnabledChange when enabled is clicked', () => {
    const mockOnChange = vi.fn()
    render(
      <EnableDisableControl
        isEnabled={false}
        onEnabledChange={mockOnChange}
        enabledRadioId="test-enabled"
        disabledRadioId="test-disabled"
      />,
    )

    const enabledOption = screen.getByLabelText('Aktiviert')
    fireEvent.click(enabledOption)

    expect(mockOnChange).toHaveBeenCalledWith('enabled')
  })

  it('should call onEnabledChange when disabled is clicked', () => {
    const mockOnChange = vi.fn()
    render(
      <EnableDisableControl
        isEnabled={true}
        onEnabledChange={mockOnChange}
        enabledRadioId="test-enabled"
        disabledRadioId="test-disabled"
      />,
    )

    const disabledOption = screen.getByLabelText('Deaktiviert')
    fireEvent.click(disabledOption)

    expect(mockOnChange).toHaveBeenCalledWith('disabled')
  })
})
