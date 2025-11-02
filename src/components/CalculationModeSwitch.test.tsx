/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import CalculationModeSwitch from './CalculationModeSwitch'

describe('CalculationModeSwitch', () => {
  it('renders with yearly mode selected', () => {
    const onToggle = vi.fn()
    render(
      <CalculationModeSwitch
        simulationAnnual="yearly"
        onToggle={onToggle}
      />,
    )

    expect(screen.getByText('Berechnungsmodus')).toBeInTheDocument()
    expect(screen.getByText('Jährlich')).toBeInTheDocument()
    expect(screen.getByText('Monatlich')).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('renders with monthly mode selected', () => {
    const onToggle = vi.fn()
    render(
      <CalculationModeSwitch
        simulationAnnual="monthly"
        onToggle={onToggle}
      />,
    )

    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('calls onToggle when switch is clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()

    render(
      <CalculationModeSwitch
        simulationAnnual="yearly"
        onToggle={onToggle}
      />,
    )

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('displays description text on desktop and mobile', () => {
    const onToggle = vi.fn()
    render(
      <CalculationModeSwitch
        simulationAnnual="yearly"
        onToggle={onToggle}
      />,
    )

    const descriptions = screen.getAllByText(
      /Jährlich für schnellere Berechnung, Monatlich für präzisere Ergebnisse/,
    )
    expect(descriptions).toHaveLength(2) // One visible on desktop, one on mobile
  })
})
