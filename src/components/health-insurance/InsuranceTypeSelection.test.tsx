import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InsuranceTypeSelection } from './InsuranceTypeSelection'
import userEvent from '@testing-library/user-event'

describe('InsuranceTypeSelection', () => {
  test('renders statutory insurance selection', () => {
    render(
      <InsuranceTypeSelection
        insuranceType="statutory"
        onInsuranceTypeChange={() => {}}
      />,
    )

    expect(screen.getByText('Versicherungsart')).toBeInTheDocument()
    expect(screen.getByText('Gesetzliche Krankenversicherung')).toBeInTheDocument()
    expect(screen.getByText('Private Krankenversicherung')).toBeInTheDocument()
  })

  test('calls onInsuranceTypeChange when selection changes', async () => {
    const user = userEvent.setup()
    let selectedType = 'statutory' as 'statutory' | 'private'
    const handleChange = (type: 'statutory' | 'private') => {
      selectedType = type
    }

    render(
      <InsuranceTypeSelection
        insuranceType={selectedType}
        onInsuranceTypeChange={handleChange}
      />,
    )

    // Change to private insurance
    const privateOption = screen.getByLabelText(/Private Krankenversicherung/i)
    await user.click(privateOption)

    expect(selectedType).toBe('private')
  })
})
