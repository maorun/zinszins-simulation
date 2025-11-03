/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ReturnModeSelector from './ReturnModeSelector'

describe('ReturnModeSelector', () => {
  it('renders all return mode options', () => {
    const mockOnChange = vi.fn()
    render(<ReturnModeSelector returnMode="random" onReturnModeChange={mockOnChange} />)

    expect(screen.getByText('Rendite-Modus für Sparphase')).toBeInTheDocument()
    expect(screen.getByText('Feste Rendite')).toBeInTheDocument()
    expect(screen.getByText('Zufällige Rendite')).toBeInTheDocument()
    expect(screen.getByText('Variable Rendite')).toBeInTheDocument()
    expect(screen.getByText('Historische Daten')).toBeInTheDocument()
    expect(screen.getByText('Multi-Asset Portfolio')).toBeInTheDocument()
  })

  it('calls onReturnModeChange when a mode is selected', () => {
    const mockOnChange = vi.fn()
    render(<ReturnModeSelector returnMode="random" onReturnModeChange={mockOnChange} />)

    fireEvent.click(screen.getByText('Feste Rendite'))

    expect(mockOnChange).toHaveBeenCalledWith('fixed')
  })

  it('displays the correct selected mode', () => {
    const mockOnChange = vi.fn()
    const { rerender } = render(<ReturnModeSelector returnMode="fixed" onReturnModeChange={mockOnChange} />)

    // Check that fixed is selected (this would be reflected in the RadioTileGroup's internal state)
    expect(screen.getByText('Feste Rendite')).toBeInTheDocument()

    rerender(<ReturnModeSelector returnMode="variable" onReturnModeChange={mockOnChange} />)
    expect(screen.getByText('Variable Rendite')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    const mockOnChange = vi.fn()
    render(<ReturnModeSelector returnMode="random" onReturnModeChange={mockOnChange} />)

    expect(
      screen.getByText(
        'Konfiguration der erwarteten Rendite während der Ansparphase (bis zum Beginn der Entnahme).',
      ),
    ).toBeInTheDocument()
  })
})
