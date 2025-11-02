import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RandomSeedInput } from './RandomSeedInput'

describe('RandomSeedInput', () => {
  const defaultProps = {
    segmentId: 'test-segment',
    seed: undefined,
    onSeedChange: vi.fn(),
  }

  it('renders the label', () => {
    render(<RandomSeedInput {...defaultProps} />)

    expect(screen.getByText('Zufalls-Seed (optional)')).toBeInTheDocument()
  })

  it('displays the seed value when provided', () => {
    render(<RandomSeedInput {...defaultProps} seed={42} />)

    expect(screen.getByDisplayValue('42')).toBeInTheDocument()
  })

  it('displays empty input when seed is undefined', () => {
    render(<RandomSeedInput {...defaultProps} seed={undefined} />)

    const input = screen.getByPlaceholderText('Für reproduzierbare Ergebnisse')
    expect(input).toHaveValue(null)
  })

  it('calls onSeedChange when value changes', () => {
    const onSeedChange = vi.fn()
    render(<RandomSeedInput {...defaultProps} onSeedChange={onSeedChange} />)

    const input = screen.getByPlaceholderText('Für reproduzierbare Ergebnisse')
    fireEvent.change(input, { target: { value: '123' } })

    expect(onSeedChange).toHaveBeenCalledWith(123)
  })

  it('calls onSeedChange with undefined when input is cleared', () => {
    const onSeedChange = vi.fn()
    render(<RandomSeedInput {...defaultProps} seed={42} onSeedChange={onSeedChange} />)

    const input = screen.getByDisplayValue('42')
    fireEvent.change(input, { target: { value: '' } })

    expect(onSeedChange).toHaveBeenCalledWith(undefined)
  })

  it('displays helper text', () => {
    render(<RandomSeedInput {...defaultProps} />)

    expect(
      screen.getByText(/Optionaler Seed für reproduzierbare Zufallsrenditen/),
    ).toBeInTheDocument()
  })
})
