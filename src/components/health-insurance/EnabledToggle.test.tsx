import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { EnabledToggle } from './EnabledToggle'

describe('EnabledToggle', () => {
  it('renders with enabled state', () => {
    const onEnabledChange = vi.fn()
    render(<EnabledToggle enabled={true} onEnabledChange={onEnabledChange} />)

    expect(screen.getByText('Kranken- und Pflegeversicherung berücksichtigen')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('renders with disabled state', () => {
    const onEnabledChange = vi.fn()
    render(<EnabledToggle enabled={false} onEnabledChange={onEnabledChange} />)

    expect(screen.getByText('Kranken- und Pflegeversicherung berücksichtigen')).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onEnabledChange when toggled', async () => {
    const onEnabledChange = vi.fn()
    const user = userEvent.setup()
    render(<EnabledToggle enabled={false} onEnabledChange={onEnabledChange} />)

    await user.click(screen.getByRole('switch'))

    expect(onEnabledChange).toHaveBeenCalledWith(true)
  })

  it('uses custom idPrefix when provided', () => {
    const onEnabledChange = vi.fn()
    render(<EnabledToggle enabled={false} onEnabledChange={onEnabledChange} idPrefix="custom-prefix" />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement.id).toContain('custom-prefix')
  })
})
