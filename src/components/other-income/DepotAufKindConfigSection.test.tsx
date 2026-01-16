/**
 * Tests for Depot-auf-Kind Configuration Section Component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DepotAufKindConfigSection } from './DepotAufKindConfigSection'
import { createDefaultDepotAufKindConfig } from '../../../helpers/depot-auf-kind'

describe('DepotAufKindConfigSection', () => {
  const currentYear = 2024
  const defaultConfig = createDefaultDepotAufKindConfig('Emma', 2010)

  it('should render without crashing', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    expect(screen.getByText('👶 Depot-auf-Kind-Strategie')).toBeInTheDocument()
  })

  it('should display tax benefits information', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    expect(screen.getByText(/Steuervorteile der Depot-auf-Kind-Strategie/)).toBeInTheDocument()
    expect(screen.getByText(/Sparerpauschbetrag/)).toBeInTheDocument()
    expect(screen.getByText(/Grundfreibetrag/)).toBeInTheDocument()
  })

  it('should display child name input field', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const nameInput = screen.getByLabelText('Name des Kindes')
    expect(nameInput).toBeInTheDocument()
    expect(nameInput).toHaveValue('Emma')
  })

  it('should display birth year input field', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const birthYearInput = screen.getByLabelText('Geburtsjahr')
    expect(birthYearInput).toBeInTheDocument()
    expect(birthYearInput).toHaveValue(2010)
  })

  it('should display child age calculation', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    expect(screen.getByText(/Alter des Kindes im Jahr 2024: 14 Jahre/)).toBeInTheDocument()
  })

  it('should display depot value input field', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const depotInput = screen.getByLabelText('Depot-Wert (Initial)')
    expect(depotInput).toBeInTheDocument()
    expect(depotInput).toHaveValue(50000)
  })

  it('should display expected return input field', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const returnInput = screen.getByLabelText(/Erwartete Rendite/)
    expect(returnInput).toBeInTheDocument()
    expect(returnInput).toHaveValue(5) // 5%
  })

  it('should display simulation years input field', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const yearsInput = screen.getByLabelText(/Simulationsdauer/)
    expect(yearsInput).toBeInTheDocument()
  })

  it('should display asset type selector with all options', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    expect(screen.getByText('Aktienfonds')).toBeInTheDocument()
    expect(screen.getByText('Mischfonds')).toBeInTheDocument()
    expect(screen.getByText('Rentenfonds')).toBeInTheDocument()
    expect(screen.getByText('Sparkonto')).toBeInTheDocument()
  })

  it('should display parent tax rate input field', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const taxRateInput = screen.getByLabelText(/Grenzsteuersatz der Eltern/)
    expect(taxRateInput).toBeInTheDocument()
    expect(taxRateInput).toHaveValue(42) // 42%
  })

  it('should display child income checkbox', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const incomeCheckbox = screen.getByLabelText('Kind hat eigenes Einkommen')
    expect(incomeCheckbox).toBeInTheDocument()
    expect(incomeCheckbox).not.toBeChecked()
  })

  it('should show child income input when checkbox is checked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const incomeCheckbox = screen.getByLabelText('Kind hat eigenes Einkommen')
    await user.click(incomeCheckbox)

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ hasOtherIncome: true }))
    })
  })

  it('should display optimal transfer timing recommendation', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    expect(screen.getByText(/Empfehlung: Optimaler Übertragungszeitpunkt/)).toBeInTheDocument()
    expect(screen.getByText(/Transfer im Alter von/)).toBeInTheDocument()
  })

  it('should display tax savings preview', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    expect(screen.getByText('Steueroptimierungs-Potenzial')).toBeInTheDocument()
    expect(screen.getByText('📊 Depot des Kindes')).toBeInTheDocument()
    expect(screen.getByText('👨‍👩‍👧‍👦 Depot der Eltern')).toBeInTheDocument()
  })

  it('should call onUpdate when child name changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const nameInput = screen.getByLabelText('Name des Kindes')
    await user.clear(nameInput)
    await user.type(nameInput, 'Max')

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
      // Check that childName was updated in at least one call
      const calls = onUpdate.mock.calls
      const hasChildNameUpdate = calls.some((call) => call[0].childName !== undefined)
      expect(hasChildNameUpdate).toBe(true)
    })
  })

  it('should call onUpdate when birth year changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const birthYearInput = screen.getByLabelText('Geburtsjahr')
    await user.clear(birthYearInput)
    await user.type(birthYearInput, '2015')

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
      // Check that birthYear was updated in at least one call
      const calls = onUpdate.mock.calls
      const hasBirthYearUpdate = calls.some((call) => call[0].birthYear !== undefined)
      expect(hasBirthYearUpdate).toBe(true)
    })
  })

  it('should call onUpdate when depot value changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const depotInput = screen.getByLabelText('Depot-Wert (Initial)')
    await user.clear(depotInput)
    await user.type(depotInput, '75000')

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
      // Check that initialDepotValue was updated in at least one call
      const calls = onUpdate.mock.calls
      const hasDepotValueUpdate = calls.some((call) => call[0].initialDepotValue !== undefined)
      expect(hasDepotValueUpdate).toBe(true)
    })
  })

  it('should call onUpdate when expected return changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const returnInput = screen.getByLabelText(/Erwartete Rendite/)
    await user.clear(returnInput)
    await user.type(returnInput, '7')

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
      // Check that expectedAnnualReturn was updated in at least one call
      const calls = onUpdate.mock.calls
      const hasReturnUpdate = calls.some((call) => call[0].expectedAnnualReturn !== undefined)
      expect(hasReturnUpdate).toBe(true)
    })
  })

  it('should call onUpdate when asset type is selected', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const mischfondsButton = screen.getByText('Mischfonds')
    await user.click(mischfondsButton)

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ assetType: 'mixed_fund' }))
    })
  })

  it('should call onUpdate when parent tax rate changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const taxRateInput = screen.getByLabelText(/Grenzsteuersatz der Eltern/)
    await user.clear(taxRateInput)
    await user.type(taxRateInput, '38')

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
      // Check that parentMarginalTaxRate was updated in at least one call
      const calls = onUpdate.mock.calls
      const hasTaxRateUpdate = calls.some((call) => call[0].parentMarginalTaxRate !== undefined)
      expect(hasTaxRateUpdate).toBe(true)
    })
  })

  it('should highlight selected asset type', () => {
    const onUpdate = vi.fn()
    const config = { ...defaultConfig, assetType: 'equity_fund' as const }
    render(<DepotAufKindConfigSection config={config} onUpdate={onUpdate} currentYear={currentYear} />)

    const equityButton = screen.getByText('Aktienfonds').closest('button')
    expect(equityButton).toHaveClass('bg-purple-600')
  })

  it('should display validation errors for invalid configuration', () => {
    const onUpdate = vi.fn()
    const invalidConfig = { ...defaultConfig, childName: '', initialDepotValue: -1000 }
    render(<DepotAufKindConfigSection config={invalidConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    expect(screen.getByText('Konfiguration unvollständig')).toBeInTheDocument()
  })

  it('should display total tax savings prominently', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    expect(screen.getByText('Gesamte Steuerersparnis')).toBeInTheDocument()
  })

  it('should display average annual tax savings', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    expect(screen.getByText(/Durchschnittlich.*pro Jahr/)).toBeInTheDocument()
  })

  it('should display effective tax rates for both child and parent', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const effectiveTaxRateElements = screen.getAllByText(/Effektiver Steuersatz:/)
    expect(effectiveTaxRateElements).toHaveLength(2)
  })

  it('should display end capital values for both scenarios', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const endkapitalElements = screen.getAllByText(/Endkapital:/)
    expect(endkapitalElements).toHaveLength(2)
  })

  it('should display tax burden comparison', () => {
    const onUpdate = vi.fn()
    render(<DepotAufKindConfigSection config={defaultConfig} onUpdate={onUpdate} currentYear={currentYear} />)

    const steuerlastElements = screen.getAllByText(/Steuerlast:/)
    expect(steuerlastElements).toHaveLength(2)
  })
})
