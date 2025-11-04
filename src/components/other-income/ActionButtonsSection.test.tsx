import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionButtonsSection } from './ActionButtonsSection'

describe('ActionButtonsSection', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  it('renders save button with "Hinzufügen" when adding new', () => {
    render(<ActionButtonsSection isAddingNew={true} onSave={mockOnSave} onCancel={mockOnCancel} />)

    expect(screen.getByRole('button', { name: /Hinzufügen/i })).toBeInTheDocument()
  })

  it('renders save button with "Aktualisieren" when editing existing', () => {
    render(<ActionButtonsSection isAddingNew={false} onSave={mockOnSave} onCancel={mockOnCancel} />)

    expect(screen.getByRole('button', { name: /Aktualisieren/i })).toBeInTheDocument()
  })

  it('renders cancel button', () => {
    render(<ActionButtonsSection isAddingNew={true} onSave={mockOnSave} onCancel={mockOnCancel} />)

    expect(screen.getByRole('button', { name: /Abbrechen/i })).toBeInTheDocument()
  })

  it('calls onSave when save button is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionButtonsSection isAddingNew={true} onSave={mockOnSave} onCancel={mockOnCancel} />)

    const saveButton = screen.getByRole('button', { name: /Hinzufügen/i })
    await user.click(saveButton)

    expect(mockOnSave).toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ActionButtonsSection isAddingNew={true} onSave={mockOnSave} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /Abbrechen/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })
})
