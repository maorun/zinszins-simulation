import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OptimizationModeRadioGroup } from './OptimizationModeRadioGroup'

describe('OptimizationModeRadioGroup', () => {
  test('renders all optimization mode options', () => {
    const onChange = vi.fn()
    render(<OptimizationModeRadioGroup value="balanced" onChange={onChange} />)

    expect(screen.getByText('Optimierungsstrategie')).toBeInTheDocument()
    expect(screen.getByText('Steuerminimierung')).toBeInTheDocument()
    expect(screen.getByText('Netto-Maximierung')).toBeInTheDocument()
    expect(screen.getByText('Ausgewogen')).toBeInTheDocument()
    expect(screen.getByText('Minimiere die Gesamtsteuerlast')).toBeInTheDocument()
    expect(screen.getByText('Maximiere das Netto-Einkommen')).toBeInTheDocument()
    expect(screen.getByText('Balance zwischen Steueroptimierung und stabilen Entnahmen')).toBeInTheDocument()
  })

  test('displays help text', () => {
    const onChange = vi.fn()
    render(<OptimizationModeRadioGroup value="balanced" onChange={onChange} />)

    expect(screen.getByText('Bestimmt das Hauptziel der Steueroptimierung.')).toBeInTheDocument()
  })

  test('shows minimize_taxes option as checked when value is minimize_taxes', () => {
    const onChange = vi.fn()
    render(<OptimizationModeRadioGroup value="minimize_taxes" onChange={onChange} />)

    const minimizeTaxesOption = screen.getByRole('radio', { name: /Steuerminimierung/i })
    expect(minimizeTaxesOption).toBeChecked()
  })

  test('shows maximize_after_tax option as checked when value is maximize_after_tax', () => {
    const onChange = vi.fn()
    render(<OptimizationModeRadioGroup value="maximize_after_tax" onChange={onChange} />)

    const maximizeOption = screen.getByRole('radio', { name: /Netto-Maximierung/i })
    expect(maximizeOption).toBeChecked()
  })

  test('shows balanced option as checked when value is balanced', () => {
    const onChange = vi.fn()
    render(<OptimizationModeRadioGroup value="balanced" onChange={onChange} />)

    const balancedOption = screen.getByRole('radio', { name: /Ausgewogen/i })
    expect(balancedOption).toBeChecked()
  })

  test('calls onChange with minimize_taxes when that option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<OptimizationModeRadioGroup value="balanced" onChange={onChange} />)

    const minimizeTaxesOption = screen.getByRole('radio', { name: /Steuerminimierung/i })
    await user.click(minimizeTaxesOption)

    expect(onChange).toHaveBeenCalledWith('minimize_taxes')
  })

  test('calls onChange with maximize_after_tax when that option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<OptimizationModeRadioGroup value="balanced" onChange={onChange} />)

    const maximizeOption = screen.getByRole('radio', { name: /Netto-Maximierung/i })
    await user.click(maximizeOption)

    expect(onChange).toHaveBeenCalledWith('maximize_after_tax')
  })

  test('calls onChange with balanced when that option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<OptimizationModeRadioGroup value="minimize_taxes" onChange={onChange} />)

    const balancedOption = screen.getByRole('radio', { name: /Ausgewogen/i })
    await user.click(balancedOption)

    expect(onChange).toHaveBeenCalledWith('balanced')
  })
})
