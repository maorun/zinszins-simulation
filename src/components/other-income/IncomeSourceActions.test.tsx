import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IncomeSourceActions } from './IncomeSourceActions'

describe('IncomeSourceActions', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    mockOnEdit.mockClear()
    mockOnDelete.mockClear()
  })

  it('renders edit and delete buttons', () => {
    render(<IncomeSourceActions onEdit={mockOnEdit} onDelete={mockOnDelete} editingDisabled={false} />)

    expect(screen.getByRole('button', { name: /bearbeiten/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2) // Edit and delete
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<IncomeSourceActions onEdit={mockOnEdit} onDelete={mockOnDelete} editingDisabled={false} />)

    fireEvent.click(screen.getByRole('button', { name: /bearbeiten/i }))
    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<IncomeSourceActions onEdit={mockOnEdit} onDelete={mockOnDelete} editingDisabled={false} />)

    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find((btn) => btn.querySelector('svg'))
    fireEvent.click(deleteButton!)
    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })

  it('disables edit button when editingDisabled is true', () => {
    render(<IncomeSourceActions onEdit={mockOnEdit} onDelete={mockOnDelete} editingDisabled={true} />)

    expect(screen.getByRole('button', { name: /bearbeiten/i })).toBeDisabled()
  })

  it('enables edit button when editingDisabled is false', () => {
    render(<IncomeSourceActions onEdit={mockOnEdit} onDelete={mockOnDelete} editingDisabled={false} />)

    expect(screen.getByRole('button', { name: /bearbeiten/i })).not.toBeDisabled()
  })
})
