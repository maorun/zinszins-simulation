import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { DisabledStateView } from './DisabledStateView'

describe('DisabledStateView', () => {
  it('renders header', () => {
    const onEnabledChange = vi.fn()
    render(<DisabledStateView onEnabledChange={onEnabledChange} />)

    expect(screen.getByText(/Kranken- und Pflegeversicherung/)).toBeInTheDocument()
  })

  it('renders description when expanded', async () => {
    const onEnabledChange = vi.fn()
    const user = userEvent.setup()
    render(<DisabledStateView onEnabledChange={onEnabledChange} />)

    // Expand the collapsible card
    const header = screen.getByText(/Kranken- und Pflegeversicherung/)
    await user.click(header)

    expect(screen.getByText(/Aktivieren Sie diese Option/)).toBeInTheDocument()
  })

  it('renders toggle in disabled state when expanded', async () => {
    const onEnabledChange = vi.fn()
    const user = userEvent.setup()
    render(<DisabledStateView onEnabledChange={onEnabledChange} />)

    // Expand the collapsible card
    const header = screen.getByText(/Kranken- und Pflegeversicherung/)
    await user.click(header)

    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onEnabledChange when toggle is clicked', async () => {
    const onEnabledChange = vi.fn()
    const user = userEvent.setup()
    render(<DisabledStateView onEnabledChange={onEnabledChange} />)

    // Expand the collapsible card
    const header = screen.getByText(/Kranken- und Pflegeversicherung/)
    await user.click(header)

    await user.click(screen.getByRole('switch'))

    expect(onEnabledChange).toHaveBeenCalledWith(true)
  })
})
