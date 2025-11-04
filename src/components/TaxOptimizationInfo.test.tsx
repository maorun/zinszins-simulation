import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaxOptimizationInfo } from './TaxOptimizationInfo'

describe('TaxOptimizationInfo', () => {
  test('renders info box with title', () => {
    render(<TaxOptimizationInfo />)

    expect(screen.getByText('💡 Steueroptimierung:')).toBeInTheDocument()
  })

  test('displays all optimization features', () => {
    render(<TaxOptimizationInfo />)

    expect(screen.getByText('• Berücksichtigt Vorabpauschale und Basiszins')).toBeInTheDocument()
    expect(screen.getByText('• Nutzt Sparerpauschbetrag (Freibetrag) optimal')).toBeInTheDocument()
    expect(screen.getByText('• Passt Entnahmebeträge dynamisch an')).toBeInTheDocument()
    expect(screen.getByText('• Berücksichtigt Günstigerprüfung bei hohen Einkommen')).toBeInTheDocument()
  })

  test('applies correct styling classes', () => {
    const { container } = render(<TaxOptimizationInfo />)

    const infoBox = container.firstChild as HTMLElement
    expect(infoBox).toHaveClass('bg-green-100', 'border', 'border-green-300', 'rounded-md', 'p-3')
  })
})
