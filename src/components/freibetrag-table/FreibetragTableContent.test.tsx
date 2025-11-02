/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FreibetragTableContent } from './FreibetragTableContent'

describe('FreibetragTableContent', () => {
  const defaultProps = {
    freibetragPerYear: {
      2025: 2000,
      2026: 2500,
    },
    onUpdateYear: vi.fn(),
    onDeleteYear: vi.fn(),
  }

  it('renders table with correct headers', () => {
    render(<FreibetragTableContent {...defaultProps} />)

    expect(screen.getByText('Jahr')).toBeInTheDocument()
    expect(screen.getByText('Sparerpauschbetrag (€)')).toBeInTheDocument()
    expect(screen.getByText('Aktionen')).toBeInTheDocument()
  })

  it('renders all years from freibetragPerYear', () => {
    render(<FreibetragTableContent {...defaultProps} />)

    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
  })

  it('renders all amounts from freibetragPerYear', () => {
    render(<FreibetragTableContent {...defaultProps} />)

    expect(screen.getByDisplayValue('2000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2500')).toBeInTheDocument()
  })

  it('renders delete buttons for each row', () => {
    render(<FreibetragTableContent {...defaultProps} />)

    const deleteButtons = screen.getAllByRole('button')
    expect(deleteButtons).toHaveLength(2)
  })

  it('renders empty table body when no years provided', () => {
    render(
      <FreibetragTableContent
        freibetragPerYear={{}}
        onUpdateYear={vi.fn()}
        onDeleteYear={vi.fn()}
      />,
    )

    expect(screen.getByText('Jahr')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
