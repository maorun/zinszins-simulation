/**
 * Tests for ScenarioManagement component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ScenarioManagement } from './ScenarioManagement'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'

// Mock the hooks
vi.mock('../hooks/useScenarioManagement', () => ({
  useScenarioManagement: () => ({
    scenarios: [],
    isLoading: false,
    error: null,
    saveScenario: vi.fn((name, config, description) => ({
      id: 'test-id',
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      configuration: config,
    })),
    updateScenario: vi.fn(),
    deleteScenario: vi.fn(() => true),
    getScenario: vi.fn(),
    refreshScenarios: vi.fn(),
  }),
}))

vi.mock('../hooks/useNavigationItem', () => ({
  useNavigationItem: vi.fn(() => ({ current: null })),
}))

const mockConfig: ExtendedSavedConfiguration = {
  rendite: 5,
  steuerlast: 26.375,
  teilfreistellungsquote: 30,
  freibetragPerYear: {},
  returnMode: 'fixed',
  averageReturn: 5,
  standardDeviation: 0,
  variableReturns: {},
  startEnd: [2024, 2040],
  sparplan: [],
  simulationAnnual: 'yearly',
}

describe('ScenarioManagement', () => {
  const mockOnLoadScenario = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render closed by default', () => {
    render(<ScenarioManagement currentConfiguration={mockConfig} onLoadScenario={mockOnLoadScenario} />)
    
    expect(screen.getByText('Szenario-Verwaltung')).toBeInTheDocument()
    expect(screen.queryByText('Aktuelle Konfiguration speichern')).not.toBeInTheDocument()
  })

  it('should expand when clicked', async () => {
    render(<ScenarioManagement currentConfiguration={mockConfig} onLoadScenario={mockOnLoadScenario} />)
    
    const trigger = screen.getByText('Szenario-Verwaltung').closest('div')
    expect(trigger).toBeTruthy()
    
    fireEvent.click(trigger!)
    
    await waitFor(() => {
      expect(screen.getByText('Aktuelle Konfiguration speichern')).toBeInTheDocument()
    })
  })

  it('should show save form when expanded', async () => {
    render(<ScenarioManagement currentConfiguration={mockConfig} onLoadScenario={mockOnLoadScenario} />)
    
    const trigger = screen.getByText('Szenario-Verwaltung').closest('div')
    fireEvent.click(trigger!)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Szenario-Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Beschreibung/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Szenario speichern/ })).toBeInTheDocument()
    })
  })

  it('should show empty state when no scenarios', async () => {
    render(<ScenarioManagement currentConfiguration={mockConfig} onLoadScenario={mockOnLoadScenario} />)
    
    const trigger = screen.getByText('Szenario-Verwaltung').closest('div')
    fireEvent.click(trigger!)
    
    await waitFor(() => {
      expect(screen.getByText('Noch keine Szenarien gespeichert')).toBeInTheDocument()
    })
  })

  it('should disable save button when name is empty', async () => {
    render(<ScenarioManagement currentConfiguration={mockConfig} onLoadScenario={mockOnLoadScenario} />)
    
    const trigger = screen.getByText('Szenario-Verwaltung').closest('div')
    fireEvent.click(trigger!)
    
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /Szenario speichern/ })
      expect(saveButton).toBeDisabled()
    })
  })

  it('should enable save button when name is entered', async () => {
    render(<ScenarioManagement currentConfiguration={mockConfig} onLoadScenario={mockOnLoadScenario} />)
    
    const trigger = screen.getByText('Szenario-Verwaltung').closest('div')
    fireEvent.click(trigger!)
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Szenario-Name/)
      fireEvent.change(nameInput, { target: { value: 'Test Scenario' } })
      
      const saveButton = screen.getByRole('button', { name: /Szenario speichern/ })
      expect(saveButton).not.toBeDisabled()
    })
  })

  it('should allow entering scenario name and description', async () => {
    render(<ScenarioManagement currentConfiguration={mockConfig} onLoadScenario={mockOnLoadScenario} />)
    
    const trigger = screen.getByText('Szenario-Verwaltung').closest('div')
    fireEvent.click(trigger!)
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Szenario-Name/) as HTMLInputElement
      const descInput = screen.getByLabelText(/Beschreibung/) as HTMLInputElement
      
      fireEvent.change(nameInput, { target: { value: 'My Scenario' } })
      fireEvent.change(descInput, { target: { value: 'My Description' } })
      
      expect(nameInput.value).toBe('My Scenario')
      expect(descInput.value).toBe('My Description')
    })
  })
})
