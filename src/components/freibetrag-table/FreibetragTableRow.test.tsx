/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FreibetragTableRow } from './FreibetragTableRow'

describe('FreibetragTableRow', () => {
  const defaultProps = {
    year: '2025',
    amount: 2000,
    onUpdateYear: vi.fn(),
    onDeleteYear: vi.fn(),
  }

  it('renders year and amount correctly', () => {
    render(
      <table>
        <tbody>
          <FreibetragTableRow {...defaultProps} />
        </tbody>
      </table>,
    )

    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument()
  })

  it('calls onUpdateYear when amount is changed', () => {
    const onUpdateYear = vi.fn()
    render(
      <table>
        <tbody>
          <FreibetragTableRow {...defaultProps} onUpdateYear={onUpdateYear} />
        </tbody>
      </table>,
    )

    const input = screen.getByDisplayValue('2000')
    fireEvent.change(input, { target: { value: '3000' } })

    expect(onUpdateYear).toHaveBeenCalledWith(2025, 3000)
  })

  it('calls onDeleteYear when delete button is clicked', () => {
    const onDeleteYear = vi.fn()
    render(
      <table>
        <tbody>
          <FreibetragTableRow {...defaultProps} onDeleteYear={onDeleteYear} />
        </tbody>
      </table>,
    )

    const deleteButton = screen.getByRole('button')
    fireEvent.click(deleteButton)

    expect(onDeleteYear).toHaveBeenCalledWith(2025)
  })

  it('handles invalid input values correctly', () => {
    const onUpdateYear = vi.fn()
    render(
      <table>
        <tbody>
          <FreibetragTableRow {...defaultProps} onUpdateYear={onUpdateYear} />
        </tbody>
      </table>,
    )

    const input = screen.getByDisplayValue('2000')
    // When user types an invalid value, the browser may convert it to 0 or keep the previous value
    // The component checks !isNaN(value) before calling onUpdateYear
    fireEvent.change(input, { target: { value: '' } })

    // Empty string converts to 0, which is a valid number
    expect(onUpdateYear).toHaveBeenCalledWith(2025, 0)
  })
})
