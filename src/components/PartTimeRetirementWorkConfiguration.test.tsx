import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PartTimeRetirementWorkConfiguration } from './PartTimeRetirementWorkConfiguration'
import { createDefaultPartTimeRetirementWorkConfig } from '../../helpers/part-time-retirement-work'

describe('PartTimeRetirementWorkConfiguration', () => {
  const defaultProps = {
    config: createDefaultPartTimeRetirementWorkConfig(),
    onConfigChange: vi.fn(),
    startYear: 2025,
    endYear: 2040,
  }

  it('should render component with title and description', () => {
    render(<PartTimeRetirementWorkConfiguration {...defaultProps} />)

    expect(screen.getByText('Zeitweise Rückkehr in den Arbeitsmarkt')).toBeInTheDocument()
    expect(screen.getByText(/Simulieren Sie Teilzeit-Arbeit im Ruhestand/)).toBeInTheDocument()
  })

  it('should render configuration switches', () => {
    render(<PartTimeRetirementWorkConfiguration {...defaultProps} />)

    expect(screen.getByText('Portfolio-Entnahmen reduzieren')).toBeInTheDocument()
    expect(screen.getByText('Sozialversicherung berechnen')).toBeInTheDocument()
  })

  it('should show empty state when no work phases configured', () => {
    render(<PartTimeRetirementWorkConfiguration {...defaultProps} />)

    expect(screen.getByText('Keine Arbeitsphasen konfiguriert')).toBeInTheDocument()
    expect(screen.getByText('Arbeitsphasen (0)')).toBeInTheDocument()
  })

  it('should call onConfigChange when toggling reduce withdrawals', () => {
    const onConfigChange = vi.fn()
    render(<PartTimeRetirementWorkConfiguration {...defaultProps} onConfigChange={onConfigChange} />)

    const reduceWithdrawalsSwitch = screen.getByRole('switch', { name: /Portfolio-Entnahmen reduzieren/i })
    fireEvent.click(reduceWithdrawalsSwitch)

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        reduceWithdrawals: false, // It was true by default
      })
    )
  })

  it('should call onConfigChange when toggling calculate social security', () => {
    const onConfigChange = vi.fn()
    render(<PartTimeRetirementWorkConfiguration {...defaultProps} onConfigChange={onConfigChange} />)

    const socialSecuritySwitch = screen.getByRole('switch', { name: /Sozialversicherung berechnen/i })
    fireEvent.click(socialSecuritySwitch)

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        calculateSocialSecurity: false, // It was true by default
      })
    )
  })

  it('should show reduction percent input when reduce withdrawals is enabled', () => {
    render(<PartTimeRetirementWorkConfiguration {...defaultProps} />)

    expect(screen.getByLabelText(/Reduzierung der Entnahmen/i)).toBeInTheDocument()
  })

  it('should call onConfigChange when changing reduction percent', () => {
    const onConfigChange = vi.fn()
    render(<PartTimeRetirementWorkConfiguration {...defaultProps} onConfigChange={onConfigChange} />)

    const reductionPercentInput = screen.getByLabelText(/Reduzierung der Entnahmen/i)
    fireEvent.change(reductionPercentInput, { target: { value: '75' } })

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        withdrawalReductionPercent: 75,
      })
    )
  })

  it('should add a new work phase when clicking add button', () => {
    const onConfigChange = vi.fn()
    render(<PartTimeRetirementWorkConfiguration {...defaultProps} onConfigChange={onConfigChange} />)

    const addButtons = screen.getAllByRole('button', { name: /Arbeitsphase hinzufügen/i })
    fireEvent.click(addButtons[0])

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        workPhases: expect.arrayContaining([
          expect.objectContaining({
            startYear: 2025,
            monthlyGrossIncome: 1500,
            weeklyHours: 20,
            description: 'Teilzeit-Arbeit',
          }),
        ]),
      })
    )
  })

  it('should render work phase card when phases exist', () => {
    const configWithPhase = {
      ...defaultProps.config,
      workPhases: [
        {
          startYear: 2025,
          endYear: 2027,
          monthlyGrossIncome: 2000,
          weeklyHours: 25,
          description: 'Beratungstätigkeit',
        },
      ],
    }

    render(<PartTimeRetirementWorkConfiguration {...defaultProps} config={configWithPhase} />)

    expect(screen.getByText('Arbeitsphase 1: Beratungstätigkeit')).toBeInTheDocument()
    expect(screen.getByText('2025 - 2027 (3 Jahre)')).toBeInTheDocument()
    expect(screen.getByText('Arbeitsphasen (1)')).toBeInTheDocument()
  })

  it('should update work phase when editing fields', () => {
    const onConfigChange = vi.fn()
    const configWithPhase = {
      ...defaultProps.config,
      workPhases: [
        {
          startYear: 2025,
          endYear: 2027,
          monthlyGrossIncome: 2000,
          weeklyHours: 25,
          description: 'Beratung',
        },
      ],
    }

    render(<PartTimeRetirementWorkConfiguration {...defaultProps} config={configWithPhase} onConfigChange={onConfigChange} />)

    const monthlyIncomeInput = screen.getByDisplayValue('2000')
    fireEvent.change(monthlyIncomeInput, { target: { value: '2500' } })

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        workPhases: [
          expect.objectContaining({
            monthlyGrossIncome: 2500,
          }),
        ],
      })
    )
  })

  it('should delete work phase when clicking delete button', () => {
    const onConfigChange = vi.fn()
    const configWithPhase = {
      ...defaultProps.config,
      workPhases: [
        {
          startYear: 2025,
          endYear: 2027,
          monthlyGrossIncome: 2000,
          weeklyHours: 25,
          description: 'Beratung',
        },
      ],
    }

    render(<PartTimeRetirementWorkConfiguration {...defaultProps} config={configWithPhase} onConfigChange={onConfigChange} />)

    const deleteButton = screen.getByRole('button', { name: '' }) // Delete button has no text, just an icon
    fireEvent.click(deleteButton)

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        workPhases: [],
      })
    )
  })

  it('should show validation errors for invalid phase', () => {
    const configWithInvalidPhase = {
      ...defaultProps.config,
      workPhases: [
        {
          startYear: 2027,
          endYear: 2025, // Invalid: end before start
          monthlyGrossIncome: -1000, // Invalid: negative
          weeklyHours: 50, // Invalid: too many
          description: '', // Invalid: empty
        },
      ],
    }

    render(<PartTimeRetirementWorkConfiguration {...defaultProps} config={configWithInvalidPhase} />)

    // Check for validation error display
    expect(screen.getByText(/Endjahr muss nach dem Startjahr liegen/)).toBeInTheDocument()
    expect(screen.getByText(/Bruttoeinkommen muss zwischen/)).toBeInTheDocument()
    expect(screen.getByText(/Wochenstunden müssen zwischen/)).toBeInTheDocument()
    expect(screen.getByText(/Beschreibung darf nicht leer sein/)).toBeInTheDocument()
  })

  it('should display annual income calculation', () => {
    const configWithPhase = {
      ...defaultProps.config,
      workPhases: [
        {
          startYear: 2025,
          endYear: 2027,
          monthlyGrossIncome: 1500,
          weeklyHours: 20,
          description: 'Teilzeit',
        },
      ],
    }

    render(<PartTimeRetirementWorkConfiguration {...defaultProps} config={configWithPhase} />)

    // 1500 * 12 = 18000
    expect(screen.getByText(/Jährlich: 18.000 €/)).toBeInTheDocument()
  })

  it('should render hints section', () => {
    render(<PartTimeRetirementWorkConfiguration {...defaultProps} />)

    expect(screen.getByText(/Teilzeit-Einkommen wird zusammen mit Renten/)).toBeInTheDocument()
    expect(screen.getByText(/Sozialversicherungsbeiträge/)).toBeInTheDocument()
    expect(screen.getByText(/Portfolio-Schonung verlängert/)).toBeInTheDocument()
  })

  it('should handle multiple work phases', () => {
    const configWithMultiplePhases = {
      ...defaultProps.config,
      workPhases: [
        {
          startYear: 2025,
          endYear: 2027,
          monthlyGrossIncome: 1500,
          weeklyHours: 20,
          description: 'Phase 1',
        },
        {
          startYear: 2030,
          endYear: 2032,
          monthlyGrossIncome: 2000,
          weeklyHours: 25,
          description: 'Phase 2',
        },
      ],
    }

    render(<PartTimeRetirementWorkConfiguration {...defaultProps} config={configWithMultiplePhases} />)

    expect(screen.getByText('Arbeitsphase 1: Phase 1')).toBeInTheDocument()
    expect(screen.getByText('Arbeitsphase 2: Phase 2')).toBeInTheDocument()
    expect(screen.getByText('Arbeitsphasen (2)')).toBeInTheDocument()
  })
})
