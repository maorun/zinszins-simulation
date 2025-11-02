/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FreibetragYearInput } from './FreibetragYearInput'

describe('FreibetragYearInput', () => {
  it('renders input field and button', () => {
    const onAddYear = vi.fn()
    render(<FreibetragYearInput yearToday={2025} onAddYear={onAddYear} />)

    expect(screen.getByPlaceholderText('Jahr')).toBeInTheDocument()
    expect(screen.getByText('Jahr hinzufügen')).toBeInTheDocument()
  })

  it('calls onAddYear with current year when button is clicked', () => {
    const onAddYear = vi.fn()
    render(<FreibetragYearInput yearToday={2025} onAddYear={onAddYear} />)

    fireEvent.click(screen.getByText('Jahr hinzufügen'))
    expect(onAddYear).toHaveBeenCalledWith(2025)
  })

  it('calls onAddYear with entered year when Enter is pressed', () => {
    const onAddYear = vi.fn()
    render(<FreibetragYearInput yearToday={2025} onAddYear={onAddYear} />)

    const input = screen.getByPlaceholderText('Jahr')
    fireEvent.change(input, { target: { value: '2030' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onAddYear).toHaveBeenCalledWith(2030)
  })

  it('clears input field after adding year via Enter', () => {
    const onAddYear = vi.fn()
    render(<FreibetragYearInput yearToday={2025} onAddYear={onAddYear} />)

    const input = screen.getByPlaceholderText('Jahr') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2030' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(input.value).toBe('')
  })

  it('does not call onAddYear when Enter is pressed with empty input', () => {
    const onAddYear = vi.fn()
    render(<FreibetragYearInput yearToday={2025} onAddYear={onAddYear} />)

    const input = screen.getByPlaceholderText('Jahr')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onAddYear).not.toHaveBeenCalled()
  })
})
