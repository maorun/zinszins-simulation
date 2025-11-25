import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ChildrenEducationConfigSection } from './ChildrenEducationConfigSection'
import type { OtherIncomeSource } from '../../../helpers/other-income'
import { createStandardEducationPath } from '../../../helpers/children-education'

describe('ChildrenEducationConfigSection', () => {
  const currentYear = 2024
  const mockOnUpdate = vi.fn()

  const baseSource: OtherIncomeSource = {
    id: 'test-1',
    name: 'Bildungskosten Max',
    type: 'kinder_bildung',
    amountType: 'net',
    monthlyAmount: 0,
    startYear: 2024,
    endYear: 2045,
    inflationRate: 2,
    taxRate: 0,
    enabled: true,
    kinderBildungConfig: createStandardEducationPath('Max', 2020, currentYear),
  }

  it('should render child name and birth year', () => {
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByLabelText(/Name des Kindes/i)).toHaveValue('Max')
    expect(screen.getByLabelText(/Geburtsjahr/i)).toHaveValue(2020)
  })

  it('should display child age', () => {
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/Alter des Kindes im Jahr 2024: 4 Jahre/i)).toBeInTheDocument()
  })

  it('should render education path buttons', () => {
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByRole('button', { name: /Regelweg \(Studium\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Berufsausbildung$/i })).toBeInTheDocument()
  })

  it('should display education phases overview', () => {
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/Kita\/Kindergarten:/i)).toBeInTheDocument()
    expect(screen.getByText(/Grundschule:/i)).toBeInTheDocument()
    expect(screen.getByText(/Weiterführende Schule:/i)).toBeInTheDocument()
    expect(screen.getByText(/Studium\/Universität:/i)).toBeInTheDocument()
  })

  it('should display estimated total costs', () => {
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/Geschätzte Gesamtkosten:/i)).toBeInTheDocument()
  })

  it('should display BAföG information when available', () => {
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/BAföG-Information/i)).toBeInTheDocument()
    expect(screen.getByText(/BAföG-Zeitraum:/i)).toBeInTheDocument()
  })

  it('should call onUpdate when child name changes', async () => {
    const user = userEvent.setup()
    mockOnUpdate.mockClear()
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    const nameInput = screen.getByLabelText(/Name des Kindes/i)
    await user.type(nameInput, 'a')

    expect(mockOnUpdate).toHaveBeenCalled()
    // Check that onUpdate was called with updated name
    const firstCall = mockOnUpdate.mock.calls[0][0]
    expect(firstCall.kinderBildungConfig?.childName).toBe('Maxa')
  })

  it('should call onUpdate when birth year changes', async () => {
    const user = userEvent.setup()
    mockOnUpdate.mockClear()
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    const birthYearInput = screen.getByLabelText(/Geburtsjahr/i)
    await user.clear(birthYearInput)
    await user.type(birthYearInput, '2018')

    expect(mockOnUpdate).toHaveBeenCalled()
  })

  it('should switch to vocational path when button clicked', async () => {
    const user = userEvent.setup()
    mockOnUpdate.mockClear()
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    const vocationalButton = screen.getByRole('button', { name: /^Berufsausbildung$/i })
    await user.click(vocationalButton)

    expect(mockOnUpdate).toHaveBeenCalled()
    const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0]
    expect(lastCall.kinderBildungConfig?.educationPath).toBe('ausbildung')
  })

  it('should return null if kinderBildungConfig is not present', () => {
    const sourceWithoutConfig: OtherIncomeSource = {
      ...baseSource,
      kinderBildungConfig: undefined,
    }

    const { container } = render(
      <ChildrenEducationConfigSection editingSource={sourceWithoutConfig} currentYear={currentYear} onUpdate={mockOnUpdate} />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('should display tax deductibility information', () => {
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/Steuerlich absetzbar/i)).toBeInTheDocument()
    expect(screen.getByText(/6\.000 € pro Jahr/i)).toBeInTheDocument()
  })

  it('should display BAföG explanation', () => {
    render(<ChildrenEducationConfigSection editingSource={baseSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/50% ist Zuschuss, 50% zinsloses Darlehen/i)).toBeInTheDocument()
  })
})
