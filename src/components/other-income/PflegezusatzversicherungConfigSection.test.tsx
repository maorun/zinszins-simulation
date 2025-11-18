import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PflegezusatzversicherungConfigSection } from './PflegezusatzversicherungConfigSection'
import type { OtherIncomeSource } from '../../../helpers/other-income'

describe('PflegezusatzversicherungConfigSection', () => {
  const currentYear = 2025

  const createMockSource = (): OtherIncomeSource => ({
    id: 'test-id',
    name: 'Test Pflegezusatzversicherung',
    type: 'pflegezusatzversicherung',
    amountType: 'gross',
    monthlyAmount: 1500,
    startYear: 2045,
    endYear: null,
    inflationRate: 2,
    taxRate: 0,
    enabled: true,
    pflegezusatzversicherungConfig: {
      careStartYear: 2045,
      careEndYear: null,
      pflegegrad: 3,
      birthYear: 1985,
      monthlyPremium: 50,
      policyStartYear: 2020,
      applyTaxBenefits: true,
      maxAnnualTaxDeduction: 1900,
    },
  })

  it('renders all configuration fields', () => {
    const mockSource = createMockSource()
    const mockOnUpdate = vi.fn()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByLabelText(/Geburtsjahr des Versicherten/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Vertragsbeginn/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Beginn der Pflegebedürftigkeit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Ende der Pflegebedürftigkeit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Pflegegrad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Monatlicher Beitrag/i)).toBeInTheDocument()
  })

  it('displays Pflegegrad description', () => {
    const mockSource = createMockSource()
    const mockOnUpdate = vi.fn()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/Pflegegrad 3: Schwere Beeinträchtigung der Selbstständigkeit/i)).toBeInTheDocument()
  })

  it('updates care start year when changed', async () => {
    const mockSource = createMockSource()
    const mockOnUpdate = vi.fn()
    const user = userEvent.setup()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    const careStartYearInput = screen.getByLabelText(/Beginn der Pflegebedürftigkeit/i)
    await user.clear(careStartYearInput)
    await user.type(careStartYearInput, '2050')

    // Verify onUpdate was called and startYear syncs with careStartYear
    expect(mockOnUpdate).toHaveBeenCalled()
    const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0]
    expect(lastCall.startYear).toBe(lastCall.pflegezusatzversicherungConfig.careStartYear)
  })

  it('updates Pflegegrad when changed', async () => {
    const mockSource = createMockSource()
    const mockOnUpdate = vi.fn()
    const user = userEvent.setup()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    const pflegegradInput = screen.getByLabelText(/Pflegegrad/i)
    await user.clear(pflegegradInput)
    await user.type(pflegegradInput, '5')

    expect(mockOnUpdate).toHaveBeenCalled()
    const updatedSource = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0]
    expect(updatedSource.pflegezusatzversicherungConfig.pflegegrad).toBe(5)
  })

  it('updates monthly premium when changed', async () => {
    const mockSource = createMockSource()
    const mockOnUpdate = vi.fn()
    const user = userEvent.setup()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    const premiumInput = screen.getByLabelText(/Monatlicher Beitrag/i)
    await user.clear(premiumInput)
    await user.type(premiumInput, '100')

    // Verify onUpdate was called with updated premium
    expect(mockOnUpdate).toHaveBeenCalled()
    const lastCall = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0]
    expect(lastCall.pflegezusatzversicherungConfig.monthlyPremium).toBeGreaterThan(0)
  })

  it('toggles tax benefits when switch is clicked', async () => {
    const mockSource = createMockSource()
    const mockOnUpdate = vi.fn()
    const user = userEvent.setup()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    const taxBenefitsSwitch = screen.getByRole('switch', { name: /Steuerliche Absetzbarkeit/i })
    await user.click(taxBenefitsSwitch)

    expect(mockOnUpdate).toHaveBeenCalled()
    const updatedSource = mockOnUpdate.mock.calls[0][0]
    expect(updatedSource.pflegezusatzversicherungConfig.applyTaxBenefits).toBe(false)
  })

  it('shows max annual tax deduction field when tax benefits are enabled', () => {
    const mockSource = createMockSource()
    mockSource.pflegezusatzversicherungConfig!.applyTaxBenefits = true
    const mockOnUpdate = vi.fn()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByLabelText(/Maximaler jährlicher Steuerabzug/i)).toBeInTheDocument()
  })

  it('hides max annual tax deduction field when tax benefits are disabled', () => {
    const mockSource = createMockSource()
    mockSource.pflegezusatzversicherungConfig!.applyTaxBenefits = false
    const mockOnUpdate = vi.fn()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.queryByLabelText(/Maximaler jährlicher Steuerabzug/i)).not.toBeInTheDocument()
  })

  it('displays info box with benefit calculations', () => {
    const mockSource = createMockSource()
    const mockOnUpdate = vi.fn()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    expect(screen.getByText(/Pflegezusatzversicherung - Übersicht/i)).toBeInTheDocument()
    expect(screen.getByText(/Monatliche Leistung: 1.500 €/i)).toBeInTheDocument()
    expect(screen.getByText(/Monatlicher Beitrag: 50 €/i)).toBeInTheDocument()
  })

  it('returns null when pflegezusatzversicherungConfig is not present', () => {
    const mockSource = createMockSource()
    delete mockSource.pflegezusatzversicherungConfig
    const mockOnUpdate = vi.fn()

    const { container } = render(
      <PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('allows setting care end year to null (lifelong care)', async () => {
    const mockSource = createMockSource()
    mockSource.pflegezusatzversicherungConfig!.careEndYear = 2060
    const mockOnUpdate = vi.fn()
    const user = userEvent.setup()

    render(<PflegezusatzversicherungConfigSection editingSource={mockSource} currentYear={currentYear} onUpdate={mockOnUpdate} />)

    const careEndYearInput = screen.getByLabelText(/Ende der Pflegebedürftigkeit/i)
    await user.clear(careEndYearInput)

    expect(mockOnUpdate).toHaveBeenCalled()
    const updatedSource = mockOnUpdate.mock.calls[mockOnUpdate.mock.calls.length - 1][0]
    expect(updatedSource.pflegezusatzversicherungConfig.careEndYear).toBeNull()
    expect(updatedSource.endYear).toBeNull() // Should sync with income end year
  })
})
