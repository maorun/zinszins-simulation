import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FreistellungsauftragOptimizer } from './FreistellungsauftragOptimizer'
import type { BankAccount } from '../../helpers/freistellungsauftrag-optimization'

describe('FreistellungsauftragOptimizer', () => {
  const defaultProps = {
    totalFreibetrag: 1000,
    accounts: [] as BankAccount[],
    onAccountsChange: vi.fn(),
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
  }

  it('should render the optimizer with title', () => {
    render(<FreistellungsauftragOptimizer {...defaultProps} />)

    expect(screen.getByText('Freistellungsaufträge-Optimierung')).toBeInTheDocument()
    expect(screen.getByText(/Optimale Verteilung der Freistellungsaufträge/)).toBeInTheDocument()
  })

  it('should display total Freibetrag for individual', () => {
    render(<FreistellungsauftragOptimizer {...defaultProps} />)

    expect(screen.getByText('Einzelperson: 1.000 € pro Jahr')).toBeInTheDocument()
  })

  it('should display total Freibetrag for couple', () => {
    render(<FreistellungsauftragOptimizer {...defaultProps} totalFreibetrag={2000} />)

    expect(screen.getByText('Ehepaar: 2.000 € pro Jahr')).toBeInTheDocument()
  })

  it('should show empty state when no accounts exist', () => {
    render(<FreistellungsauftragOptimizer {...defaultProps} />)

    expect(screen.getByText('Noch keine Konten angelegt.')).toBeInTheDocument()
    expect(screen.getByText(/Fügen Sie Konten hinzu/)).toBeInTheDocument()
  })

  it('should call onAccountsChange when adding account', () => {
    const onAccountsChange = vi.fn()
    render(<FreistellungsauftragOptimizer {...defaultProps} onAccountsChange={onAccountsChange} />)

    const addButton = screen.getByText('Konto hinzufügen')
    fireEvent.click(addButton)

    expect(onAccountsChange).toHaveBeenCalledTimes(1)
    const newAccounts = onAccountsChange.mock.calls[0][0]
    expect(newAccounts).toHaveLength(1)
    expect(newAccounts[0]).toMatchObject({
      name: 'Konto 1',
      expectedCapitalGains: 0,
      assignedFreibetrag: 0,
    })
  })

  it('should render existing accounts', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: 2000, assignedFreibetrag: 700 },
      { id: '2', name: 'Trade Republic', expectedCapitalGains: 1500, assignedFreibetrag: 300 },
    ]

    render(<FreistellungsauftragOptimizer {...defaultProps} accounts={accounts} />)

    expect(screen.getByDisplayValue('DKB')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Trade Republic')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument()
  })

  it('should call onAccountsChange when removing account', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: 2000, assignedFreibetrag: 700 },
      { id: '2', name: 'Trade Republic', expectedCapitalGains: 1500, assignedFreibetrag: 300 },
    ]
    const onAccountsChange = vi.fn()

    render(
      <FreistellungsauftragOptimizer
        {...defaultProps}
        accounts={accounts}
        onAccountsChange={onAccountsChange}
      />,
    )

    const deleteButtons = screen.getAllByRole('button', { name: '' }) // Trash icon buttons
    fireEvent.click(deleteButtons[0])

    expect(onAccountsChange).toHaveBeenCalledTimes(1)
    const updatedAccounts = onAccountsChange.mock.calls[0][0]
    expect(updatedAccounts).toHaveLength(1)
    expect(updatedAccounts[0].id).toBe('2')
  })

  it('should update account name when input changes', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: 2000, assignedFreibetrag: 700 },
    ]
    const onAccountsChange = vi.fn()

    render(
      <FreistellungsauftragOptimizer
        {...defaultProps}
        accounts={accounts}
        onAccountsChange={onAccountsChange}
      />,
    )

    const nameInput = screen.getByDisplayValue('DKB')
    fireEvent.change(nameInput, { target: { value: 'Neue Bank' } })

    expect(onAccountsChange).toHaveBeenCalledTimes(1)
    const updatedAccounts = onAccountsChange.mock.calls[0][0]
    expect(updatedAccounts[0].name).toBe('Neue Bank')
  })

  it('should update expected capital gains when input changes', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: 2000, assignedFreibetrag: 700 },
    ]
    const onAccountsChange = vi.fn()

    render(
      <FreistellungsauftragOptimizer
        {...defaultProps}
        accounts={accounts}
        onAccountsChange={onAccountsChange}
      />,
    )

    const gainsInput = screen.getByDisplayValue('2000')
    fireEvent.change(gainsInput, { target: { value: '3000' } })

    expect(onAccountsChange).toHaveBeenCalledTimes(1)
    const updatedAccounts = onAccountsChange.mock.calls[0][0]
    expect(updatedAccounts[0].expectedCapitalGains).toBe(3000)
  })

  it('should display optimization results', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: 2000, assignedFreibetrag: 0 },
      { id: '2', name: 'Trade Republic', expectedCapitalGains: 1500, assignedFreibetrag: 0 },
    ]

    render(<FreistellungsauftragOptimizer {...defaultProps} accounts={accounts} />)

    // Should show optimization results section
    expect(screen.getByText('Optimierungsergebnis')).toBeInTheDocument()
    expect(screen.getByText('Zugewiesener Freibetrag:')).toBeInTheDocument()
    expect(screen.getByText('Eingesparte Steuern:')).toBeInTheDocument()
  })

  it('should show validation errors for invalid configuration', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: -100, assignedFreibetrag: 0 }, // Negative gains
    ]

    render(<FreistellungsauftragOptimizer {...defaultProps} accounts={accounts} />)

    expect(screen.getByText('Validierungsfehler:')).toBeInTheDocument()
    expect(screen.getByText(/Erwartete Kapitalerträge müssen positiv sein/)).toBeInTheDocument()
  })

  it('should show optimal distribution suggestion', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: 2000, assignedFreibetrag: 500 },
      { id: '2', name: 'Trade Republic', expectedCapitalGains: 1500, assignedFreibetrag: 500 },
    ]

    render(<FreistellungsauftragOptimizer {...defaultProps} accounts={accounts} />)

    // Should show "Optimal:" labels with suggested values
    const optimalLabels = screen.getAllByText(/Optimal:/)
    expect(optimalLabels.length).toBeGreaterThan(0)
  })

  it('should apply optimal distribution when button clicked', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: 2000, assignedFreibetrag: 0 },
      { id: '2', name: 'Trade Republic', expectedCapitalGains: 1500, assignedFreibetrag: 0 },
    ]
    const onAccountsChange = vi.fn()

    render(
      <FreistellungsauftragOptimizer
        {...defaultProps}
        accounts={accounts}
        onAccountsChange={onAccountsChange}
      />,
    )

    const applyButton = screen.getByText('Optimale Verteilung übernehmen')
    fireEvent.click(applyButton)

    expect(onAccountsChange).toHaveBeenCalledTimes(1)
    const optimizedAccounts = onAccountsChange.mock.calls[0][0]
    // DKB has higher gains, should get all Freibetrag
    expect(optimizedAccounts[0].assignedFreibetrag).toBe(1000)
    expect(optimizedAccounts[1].assignedFreibetrag).toBe(0)
  })

  it('should display effective tax rate and tax amount for accounts', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: 2000, assignedFreibetrag: 700 },
    ]

    render(<FreistellungsauftragOptimizer {...defaultProps} accounts={accounts} />)

    expect(screen.getByText('Steuer:')).toBeInTheDocument()
    expect(screen.getByText('Effektiver Steuersatz:')).toBeInTheDocument()
  })

  it('should show recommendations when present', () => {
    const accounts: BankAccount[] = [
      { id: '1', name: 'DKB', expectedCapitalGains: 500, assignedFreibetrag: 0 }, // Low gains, will have unused Freibetrag
    ]

    render(<FreistellungsauftragOptimizer {...defaultProps} accounts={accounts} />)

    expect(screen.getByText('Empfehlungen:')).toBeInTheDocument()
    expect(screen.getByText(/Freibetrag nicht genutzt/)).toBeInTheDocument()
  })

  it('should show help text', () => {
    render(<FreistellungsauftragOptimizer {...defaultProps} />)

    expect(screen.getByText(/Die Optimierung verteilt Ihren Sparerpauschbetrag/)).toBeInTheDocument()
    expect(screen.getByText(/berücksichtigt automatisch die Teilfreistellung/)).toBeInTheDocument()
  })
})
