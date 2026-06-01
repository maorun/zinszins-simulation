import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BUCaseFields } from './BUCaseFields'
import { createMockEventFormValues } from './test-utils'

describe('BUCaseFields', () => {
  const mockFormValues = createMockEventFormValues({
    eventType: 'bu_case',
    buBirthYear: '1980',
    buStartYear: '2025',
    buEndYear: '',
    monthlyBUPension: '2000',
    monthlyIncomeReduction: '3500',
    applyLeibrentenBesteuerung: true,
  })

  it('renders all BU form fields', () => {
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('🦽 BU-Fall-Details (Berufsunfähigkeit)')).toBeInTheDocument()
    expect(screen.getByLabelText('Geburtsjahr des Versicherten *')).toBeInTheDocument()
    expect(screen.getByLabelText('Beginn der Berufsunfähigkeit (Jahr) *')).toBeInTheDocument()
    expect(screen.getByLabelText('Ende der Berufsunfähigkeit (Jahr, leer = dauerhaft)')).toBeInTheDocument()
    expect(screen.getByLabelText('Monatliche BU-Rente (€) *')).toBeInTheDocument()
    expect(screen.getByLabelText('Monatlicher Einkommensverlust durch BU (€)')).toBeInTheDocument()
  })

  it('calls onFormChange when birth year changes', () => {
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Geburtsjahr des Versicherten *')
    fireEvent.change(input, { target: { value: '1985' } })

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        buBirthYear: '1985',
      }),
    )
  })

  it('calls onFormChange when BU start year changes', () => {
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Beginn der Berufsunfähigkeit (Jahr) *')
    fireEvent.change(input, { target: { value: '2028' } })

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        buStartYear: '2028',
      }),
    )
  })

  it('calls onFormChange when BU end year changes (time-limited case)', () => {
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Ende der Berufsunfähigkeit (Jahr, leer = dauerhaft)')
    fireEvent.change(input, { target: { value: '2030' } })

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        buEndYear: '2030',
      }),
    )
  })

  it('calls onFormChange when monthly BU pension changes', () => {
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Monatliche BU-Rente (€) *')
    fireEvent.change(input, { target: { value: '2500' } })

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        monthlyBUPension: '2500',
      }),
    )
  })

  it('calls onFormChange when income reduction changes', () => {
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Monatlicher Einkommensverlust durch BU (€)')
    fireEvent.change(input, { target: { value: '4000' } })

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        monthlyIncomeReduction: '4000',
      }),
    )
  })

  it('shows info box when required fields are filled', () => {
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    // Should show permanent BU info
    expect(screen.getByText(/Dauerhafter BU-Fall/)).toBeInTheDocument()
    // Text is split across elements (text node + <strong>), use a partial match on the container
    expect(screen.getByText((_, element) => {
      return element?.tagName === 'P' && (element?.textContent ?? '').includes('Alter bei BU-Beginn:') && (element?.textContent ?? '').includes('45 Jahre')
    })).toBeInTheDocument()
  })

  it('shows time-limited BU info when end year is provided', () => {
    const temporaryFormValues = createMockEventFormValues({
      eventType: 'bu_case',
      buBirthYear: '1980',
      buStartYear: '2025',
      buEndYear: '2030',
      monthlyBUPension: '2000',
      monthlyIncomeReduction: '3500',
      applyLeibrentenBesteuerung: true,
    })
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={temporaryFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText(/Zeitlich begrenzter BU-Fall/)).toBeInTheDocument()
    expect(screen.getByText(/Dauer: 5 Jahre/)).toBeInTheDocument()
  })

  it('shows Ertragsanteil info when Leibrenten-Besteuerung is active', () => {
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    // Age 45 → Ertragsanteil 34%
    expect(screen.getByText(/34%/)).toBeInTheDocument()
  })

  it('shows placeholder when required fields are missing', () => {
    const emptyFormValues = createMockEventFormValues({
      eventType: 'bu_case',
      buBirthYear: '',
      buStartYear: '',
      monthlyBUPension: '',
    })
    const onFormChange = vi.fn()
    render(<BUCaseFields formValues={emptyFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText(/Bitte füllen Sie Geburtsjahr und BU-Beginn aus/)).toBeInTheDocument()
  })
})
