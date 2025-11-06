import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { SegmentReturnModeSelector } from './SegmentReturnModeSelector'

describe('SegmentReturnModeSelector', () => {
  const mockOnModeChange = vi.fn()

  it('renders the mode selector label', () => {
    render(<SegmentReturnModeSelector currentMode="fixed" onModeChange={mockOnModeChange} />)

    expect(screen.getByText('Rendite-Modus')).toBeInTheDocument()
  })

  it('renders all four mode options', () => {
    render(<SegmentReturnModeSelector currentMode="fixed" onModeChange={mockOnModeChange} />)

    expect(screen.getByText('Feste Rendite')).toBeInTheDocument()
    expect(screen.getByText('Zufällige Rendite')).toBeInTheDocument()
    expect(screen.getByText('Variable Rendite')).toBeInTheDocument()
    expect(screen.getByText('Multi-Asset Portfolio')).toBeInTheDocument()
  })

  it('renders descriptions for each mode', () => {
    render(<SegmentReturnModeSelector currentMode="fixed" onModeChange={mockOnModeChange} />)

    expect(screen.getByText('Konstante jährliche Rendite für diese Phase')).toBeInTheDocument()
    expect(screen.getByText('Monte Carlo Simulation mit Volatilität')).toBeInTheDocument()
    expect(screen.getByText('Jahr-für-Jahr konfigurierbare Renditen')).toBeInTheDocument()
    expect(screen.getByText('Diversifiziertes Portfolio mit automatischem Rebalancing')).toBeInTheDocument()
  })

  it('calls onModeChange when a different mode is selected', async () => {
    const user = userEvent.setup()
    render(<SegmentReturnModeSelector currentMode="fixed" onModeChange={mockOnModeChange} />)

    const randomOption = screen.getByText('Zufällige Rendite')
    await user.click(randomOption)

    expect(mockOnModeChange).toHaveBeenCalledWith('random')
  })

  it('displays fixed mode as selected', () => {
    render(<SegmentReturnModeSelector currentMode="fixed" onModeChange={mockOnModeChange} />)

    const fixedRadio = screen.getByRole('radio', { name: /Feste Rendite/i })
    expect(fixedRadio).toBeChecked()
  })

  it('displays random mode as selected', () => {
    render(<SegmentReturnModeSelector currentMode="random" onModeChange={mockOnModeChange} />)

    const randomRadio = screen.getByRole('radio', { name: /Zufällige Rendite/i })
    expect(randomRadio).toBeChecked()
  })

  it('displays variable mode as selected', () => {
    render(<SegmentReturnModeSelector currentMode="variable" onModeChange={mockOnModeChange} />)

    const variableRadio = screen.getByRole('radio', { name: /Variable Rendite/i })
    expect(variableRadio).toBeChecked()
  })

  it('displays multiasset mode as selected', () => {
    render(<SegmentReturnModeSelector currentMode="multiasset" onModeChange={mockOnModeChange} />)

    const multiassetRadio = screen.getByRole('radio', { name: /Multi-Asset Portfolio/i })
    expect(multiassetRadio).toBeChecked()
  })
})
