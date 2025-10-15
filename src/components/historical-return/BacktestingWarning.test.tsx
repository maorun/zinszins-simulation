import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BacktestingWarning } from './BacktestingWarning'

describe('BacktestingWarning', () => {
  it('should render the warning card with correct styling', () => {
    render(<BacktestingWarning nestingLevel={0} />)

    // Check for warning icon
    const alertIcon = document.querySelector('.text-amber-600')
    expect(alertIcon).toBeInTheDocument()
  })

  it('should display the main warning heading', () => {
    render(<BacktestingWarning nestingLevel={0} />)

    expect(screen.getByText('Wichtiger Hinweis zum Backtesting')).toBeInTheDocument()
  })

  it('should display the primary warning message', () => {
    render(<BacktestingWarning nestingLevel={0} />)

    expect(screen.getByText(/Die Vergangenheit lässt keine Rückschlüsse auf die Zukunft zu/)).toBeInTheDocument()
    expect(screen.getByText(/Historische Daten dienen nur zu Bildungs- und Testzwecken/)).toBeInTheDocument()
  })

  it('should display the secondary warning message', () => {
    render(<BacktestingWarning nestingLevel={0} />)

    expect(screen.getByText(/Vergangene Wertentwicklungen sind kein verlässlicher Indikator/)).toBeInTheDocument()
    expect(screen.getByText(/Märkte können sich fundamental ändern/)).toBeInTheDocument()
  })

  it('should apply correct amber styling classes', () => {
    const { container } = render(<BacktestingWarning nestingLevel={0} />)

    // Check for amber-colored card
    const amberCard = container.querySelector('.border-amber-200.bg-amber-50')
    expect(amberCard).toBeInTheDocument()
  })

  it('should render with different nesting levels', () => {
    const { rerender } = render(<BacktestingWarning nestingLevel={0} />)
    expect(screen.getByText('Wichtiger Hinweis zum Backtesting')).toBeInTheDocument()

    rerender(<BacktestingWarning nestingLevel={2} />)
    expect(screen.getByText('Wichtiger Hinweis zum Backtesting')).toBeInTheDocument()
  })
})
