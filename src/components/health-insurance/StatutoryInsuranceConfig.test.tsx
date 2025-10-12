import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatutoryInsuranceConfig } from './StatutoryInsuranceConfig'
import userEvent from '@testing-library/user-event'

describe('StatutoryInsuranceConfig', () => {
  test('renders all statutory insurance fields', () => {
    render(
      <StatutoryInsuranceConfig
        includeEmployerContribution={true}
        statutoryHealthInsuranceRate={14.6}
        statutoryCareInsuranceRate={3.05}
        statutoryMinimumIncomeBase={12000}
        statutoryMaximumIncomeBase={62550}
        onIncludeEmployerContributionChange={() => {}}
        onStatutoryMinimumIncomeBaseChange={() => {}}
        onStatutoryMaximumIncomeBaseChange={() => {}}
      />,
    )

    expect(screen.getByText(/Arbeitgeberanteil in Entnahme-Phase berücksichtigen/i)).toBeInTheDocument()
    expect(screen.getByText(/14\.60%/)).toBeInTheDocument()
    expect(screen.getByText(/3\.05%/)).toBeInTheDocument()
  })

  test('toggles employer contribution', async () => {
    const user = userEvent.setup()
    let includeEmployer = true
    const handleChange = (value: boolean) => {
      includeEmployer = value
    }

    render(
      <StatutoryInsuranceConfig
        includeEmployerContribution={includeEmployer}
        statutoryHealthInsuranceRate={14.6}
        statutoryCareInsuranceRate={3.05}
        statutoryMinimumIncomeBase={12000}
        statutoryMaximumIncomeBase={62550}
        onIncludeEmployerContributionChange={handleChange}
        onStatutoryMinimumIncomeBaseChange={() => {}}
        onStatutoryMaximumIncomeBaseChange={() => {}}
      />,
    )

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(includeEmployer).toBe(false)
  })

  test('calls handler when minimum income base changes', async () => {
    const user = userEvent.setup()
    let changeWasCalled = false
    const handleChange = () => {
      changeWasCalled = true
    }

    render(
      <StatutoryInsuranceConfig
        includeEmployerContribution={true}
        statutoryHealthInsuranceRate={14.6}
        statutoryCareInsuranceRate={3.05}
        statutoryMinimumIncomeBase={12000}
        statutoryMaximumIncomeBase={62550}
        onIncludeEmployerContributionChange={() => {}}
        onStatutoryMinimumIncomeBaseChange={handleChange}
        onStatutoryMaximumIncomeBaseChange={() => {}}
      />,
    )

    const minIncomeInput = screen.getByLabelText(/Mindestbeitragsbemessungsgrundlage/i)
    await user.type(minIncomeInput, '5')

    expect(changeWasCalled).toBe(true)
  })
})
