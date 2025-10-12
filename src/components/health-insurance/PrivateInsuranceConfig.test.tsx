import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrivateInsuranceConfig } from './PrivateInsuranceConfig'
import userEvent from '@testing-library/user-event'

describe('PrivateInsuranceConfig', () => {
  test('renders all private insurance fields', () => {
    render(
      <PrivateInsuranceConfig
        privateHealthInsuranceMonthly={450}
        privateCareInsuranceMonthly={60}
        privateInsuranceInflationRate={3.0}
        onPrivateHealthInsuranceMonthlyChange={() => {}}
        onPrivateCareInsuranceMonthlyChange={() => {}}
        onPrivateInsuranceInflationRateChange={() => {}}
      />,
    )

    expect(screen.getByLabelText(/Krankenversicherung \(monatlich\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Pflegeversicherung \(monatlich\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Jährliche Steigerung.*3\.0%/i)).toBeInTheDocument()
  })

  test('shows total when both values are set', () => {
    render(
      <PrivateInsuranceConfig
        privateHealthInsuranceMonthly={450}
        privateCareInsuranceMonthly={60}
        privateInsuranceInflationRate={3.0}
        onPrivateHealthInsuranceMonthlyChange={() => {}}
        onPrivateCareInsuranceMonthlyChange={() => {}}
        onPrivateInsuranceInflationRateChange={() => {}}
      />,
    )

    expect(screen.getByText(/Gesamt pro Monat/i)).toBeInTheDocument()
    expect(screen.getByText(/510,00\s*€/)).toBeInTheDocument()
  })

  test('calls handler when health insurance amount changes', async () => {
    const user = userEvent.setup()
    let changeWasCalled = false
    const handleChange = () => {
      changeWasCalled = true
    }

    render(
      <PrivateInsuranceConfig
        privateHealthInsuranceMonthly={450}
        privateCareInsuranceMonthly={60}
        privateInsuranceInflationRate={3.0}
        onPrivateHealthInsuranceMonthlyChange={handleChange}
        onPrivateCareInsuranceMonthlyChange={() => {}}
        onPrivateInsuranceInflationRateChange={() => {}}
      />,
    )

    const healthInput = screen.getByLabelText(/Krankenversicherung \(monatlich\)/i)
    await user.type(healthInput, '5')

    expect(changeWasCalled).toBe(true)
  })
})
