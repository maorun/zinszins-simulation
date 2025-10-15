import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ReturnModeSelector } from './ReturnModeSelector'

describe('ReturnModeSelector', () => {
  it('renders the label', () => {
    render(
      <ReturnModeSelector
        withdrawalReturnMode="fixed"
        onWithdrawalReturnModeChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Rendite-Konfiguration (Entnahme-Phase)')).toBeInTheDocument()
  })

  it('renders all return mode options', () => {
    render(
      <ReturnModeSelector
        withdrawalReturnMode="fixed"
        onWithdrawalReturnModeChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Feste Rendite')).toBeInTheDocument()
    expect(screen.getByText('Zufällige Rendite')).toBeInTheDocument()
    expect(screen.getByText('Variable Rendite')).toBeInTheDocument()
    expect(screen.getByText('Multi-Asset Portfolio')).toBeInTheDocument()
  })

  it('displays descriptions for each mode', () => {
    render(
      <ReturnModeSelector
        withdrawalReturnMode="fixed"
        onWithdrawalReturnModeChange={vi.fn()}
      />,
    )

    expect(screen.getByText(/Konstante jährliche Rendite/)).toBeInTheDocument()
    expect(screen.getByText(/Monte Carlo Simulation/)).toBeInTheDocument()
    expect(screen.getByText(/Jahr-für-Jahr konfigurierbare Renditen/)).toBeInTheDocument()
    expect(screen.getByText(/Diversifiziertes Portfolio/)).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(
      <ReturnModeSelector
        withdrawalReturnMode="fixed"
        onWithdrawalReturnModeChange={vi.fn()}
      />,
    )

    expect(
      screen.getByText(/Konfiguration der erwarteten Rendite während der Entnahme-Phase/),
    ).toBeInTheDocument()
  })

  it('selects the current mode', () => {
    render(
      <ReturnModeSelector
        withdrawalReturnMode="random"
        onWithdrawalReturnModeChange={vi.fn()}
      />,
    )

    const randomOption = screen.getByRole('radio', { checked: true })
    expect(randomOption).toHaveAttribute('value', 'random')
  })

  it('calls onChange when mode is changed', () => {
    const onChange = vi.fn()
    render(
      <ReturnModeSelector
        withdrawalReturnMode="fixed"
        onWithdrawalReturnModeChange={onChange}
      />,
    )

    const variableOption = screen.getByText('Variable Rendite')
    fireEvent.click(variableOption)

    expect(onChange).toHaveBeenCalledWith('variable')
  })

  it('handles all mode changes', () => {
    const onChange = vi.fn()
    render(
      <ReturnModeSelector
        withdrawalReturnMode="fixed"
        onWithdrawalReturnModeChange={onChange}
      />,
    )

    fireEvent.click(screen.getByText('Zufällige Rendite'))
    expect(onChange).toHaveBeenCalledWith('random')

    fireEvent.click(screen.getByText('Multi-Asset Portfolio'))
    expect(onChange).toHaveBeenCalledWith('multiasset')
  })
})
