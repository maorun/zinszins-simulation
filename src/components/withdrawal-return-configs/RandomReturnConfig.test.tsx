import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RandomReturnConfig } from './RandomReturnConfig'

describe('RandomReturnConfig', () => {
  const defaultProps = {
    withdrawalAverageReturn: 5,
    withdrawalStandardDeviation: 15,
    withdrawalRandomSeed: undefined,
    onWithdrawalAverageReturnChange: vi.fn(),
    onWithdrawalStandardDeviationChange: vi.fn(),
    onWithdrawalRandomSeedChange: vi.fn(),
  }

  it('renders all input fields', () => {
    render(<RandomReturnConfig {...defaultProps} />)

    expect(screen.getByText('Durchschnittliche Rendite (%)')).toBeInTheDocument()
    expect(screen.getByText('Standardabweichung (%)')).toBeInTheDocument()
    expect(screen.getByText('Zufalls-Seed (optional)')).toBeInTheDocument()
  })

  it('displays average return value', () => {
    render(<RandomReturnConfig {...defaultProps} withdrawalAverageReturn={7} />)

    expect(screen.getByText('7%')).toBeInTheDocument()
  })

  it('displays standard deviation value', () => {
    render(<RandomReturnConfig {...defaultProps} withdrawalStandardDeviation={18} />)

    expect(screen.getByText('18%')).toBeInTheDocument()
  })

  it('renders sliders with correct values', () => {
    render(<RandomReturnConfig {...defaultProps} />)

    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '5')
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '15')
  })

  it('displays helper texts', () => {
    render(<RandomReturnConfig {...defaultProps} />)

    expect(
      screen.getByText(/Erwartete durchschnittliche Rendite für die Entnahme-Phase/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Volatilität der Renditen/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Optionaler Seed für reproduzierbare Zufallsrenditen/),
    ).toBeInTheDocument()
  })

  it('displays seed input value', () => {
    render(<RandomReturnConfig {...defaultProps} withdrawalRandomSeed={42} />)

    expect(screen.getByDisplayValue('42')).toBeInTheDocument()
  })

  it('calls onChange when seed changes', () => {
    const onSeedChange = vi.fn()
    render(
      <RandomReturnConfig {...defaultProps} onWithdrawalRandomSeedChange={onSeedChange} />,
    )

    const input = screen.getByPlaceholderText('Für reproduzierbare Ergebnisse')
    fireEvent.change(input, { target: { value: '123' } })

    expect(onSeedChange).toHaveBeenCalledWith(123)
  })

  it('handles empty seed input', () => {
    const onSeedChange = vi.fn()
    render(
      <RandomReturnConfig
        {...defaultProps}
        withdrawalRandomSeed={42}
        onWithdrawalRandomSeedChange={onSeedChange}
      />,
    )

    const input = screen.getByDisplayValue('42')
    fireEvent.change(input, { target: { value: '' } })

    expect(onSeedChange).toHaveBeenCalledWith(undefined)
  })

  it('displays correct min and max labels for average return', () => {
    render(<RandomReturnConfig {...defaultProps} />)

    const labels = screen.getAllByText('0%')
    expect(labels.length).toBeGreaterThan(0)
    expect(screen.getByText('12%')).toBeInTheDocument()
  })

  it('displays correct min and max labels for standard deviation', () => {
    render(<RandomReturnConfig {...defaultProps} />)

    const fivePercent = screen.getAllByText('5%')
    expect(fivePercent.length).toBeGreaterThan(0)
    expect(screen.getByText('25%')).toBeInTheDocument()
  })
})
