import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OtherIncomeConfigurationComponent } from './OtherIncomeConfiguration'
import { type OtherIncomeConfiguration } from '../../helpers/other-income'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

describe('OtherIncomeConfiguration', () => {
  let mockOnChange: ReturnType<typeof vi.fn>
  let defaultConfig: OtherIncomeConfiguration

  beforeEach(() => {
    mockOnChange = vi.fn()
    defaultConfig = {
      enabled: false,
      sources: [],
    }
  })

  it('renders collapsed by default', () => {
    render(<OtherIncomeConfigurationComponent config={defaultConfig} onChange={mockOnChange} />)

    expect(screen.getByText('💰 Andere Einkünfte')).toBeInTheDocument()
    expect(screen.queryByText('Andere Einkünfte aktivieren')).not.toBeInTheDocument()
  })

  it('expands when clicked and shows enable toggle', async () => {
    render(<OtherIncomeConfigurationComponent config={defaultConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      expect(screen.getByText('Andere Einkünfte aktivieren')).toBeInTheDocument()
    })

    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('enables other income sources when toggle is activated', async () => {
    render(<OtherIncomeConfigurationComponent config={defaultConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      expect(screen.getByText('Andere Einkünfte aktivieren')).toBeInTheDocument()
    })

    const toggleSwitch = screen.getByRole('switch')
    fireEvent.click(toggleSwitch)

    expect(mockOnChange).toHaveBeenCalledWith({
      enabled: true,
      sources: [],
    })
  })

  it('shows add button and empty state when enabled', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
    })

    expect(screen.getByText('Noch keine Einkommensquellen konfiguriert.')).toBeInTheDocument()
  })

  it('opens add form when add button is clicked', async () => {
    const enabledConfig = { ...defaultConfig, enabled: true }
    render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Neue Einkommensquelle hinzufügen'))

    await waitFor(() => {
      expect(screen.getByText('Neue Einkommensquelle')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Bezeichnung')).toBeInTheDocument()
    expect(screen.getByLabelText('Art der Einkünfte')).toBeInTheDocument()
  })

  describe('Mobile Layout Improvements', () => {
    describe('Action Button Layout', () => {
      it('should have responsive button layout classes for mobile stacking', async () => {
        const enabledConfig = { ...defaultConfig, enabled: true }
        render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

        fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

        await waitFor(() => {
          expect(screen.getByText('Neue Einkommensquelle hinzufügen')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Neue Einkommensquelle hinzufügen'))

        await waitFor(() => {
          expect(screen.getByRole('button', { name: 'Hinzufügen' })).toBeInTheDocument()
        })

        // Check button container has responsive flex classes
        const buttonContainer = screen.getByRole('button', { name: 'Hinzufügen' }).parentElement
        expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-2', 'pt-4')
      })

      it('should have full width classes on mobile for action buttons', async () => {
        const enabledConfig = { ...defaultConfig, enabled: true }
        render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

        fireEvent.click(screen.getByText('💰 Andere Einkünfte'))
        fireEvent.click(screen.getByText('Neue Einkommensquelle hinzufügen'))

        await waitFor(() => {
          const submitButton = screen.getByRole('button', { name: 'Hinzufügen' })
          const cancelButton = screen.getByRole('button', { name: /abbrechen/i })

          // Check mobile-first full width classes
          expect(submitButton).toHaveClass('w-full', 'sm:w-auto')
          expect(cancelButton).toHaveClass('w-full', 'sm:w-auto')
        })
      })
    })

    describe('Income Source Card Layout', () => {
      it('should render income source cards with proper responsive layout', () => {
        const configWithSources = {
          ...defaultConfig,
          enabled: true,
          sources: [
            {
              id: 'test-source',
              name: 'Test Income',
              type: 'rental' as const,
              monthlyAmount: 1000,
              amountType: 'gross' as const,
              taxRate: 30,
              startYear: 2025,
              endYear: null,
              inflationRate: 2,
              enabled: true,
              notes: '',
            },
          ],
        }

        render(<OtherIncomeConfigurationComponent config={configWithSources} onChange={mockOnChange} />)

        fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

        // Check that source card is rendered with proper layout
        expect(screen.getByText('Test Income')).toBeInTheDocument()
        expect(screen.getByText('Mieteinnahmen')).toBeInTheDocument()
        expect(screen.getByText('Brutto')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /bearbeiten/i })).toBeInTheDocument()
      })

      it('should have proper mobile-optimized button layout in cards', () => {
        const configWithSources = {
          ...defaultConfig,
          enabled: true,
          sources: [
            {
              id: 'test-source',
              name: 'Test Income',
              type: 'rental' as const,
              monthlyAmount: 1000,
              amountType: 'gross' as const,
              taxRate: 30,
              startYear: 2025,
              endYear: null,
              inflationRate: 2,
              enabled: true,
              notes: '',
            },
          ],
        }

        render(<OtherIncomeConfigurationComponent config={configWithSources} onChange={mockOnChange} />)

        fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

        // Find action buttons and verify they exist with proper mobile classes
        const editButton = screen.getByRole('button', { name: /bearbeiten/i })
        const buttonContainer = editButton.parentElement

        // Check responsive button container classes for mobile-first design
        expect(buttonContainer).toHaveClass('flex', 'flex-row', 'sm:flex-col', 'gap-2')
        expect(editButton).toHaveClass('flex-1', 'sm:flex-initial', 'min-w-0')
      })
    })

    describe('Accessibility and Mobile UX', () => {
      it('should maintain proper touch target sizes', async () => {
        const enabledConfig = { ...defaultConfig, enabled: true }
        render(<OtherIncomeConfigurationComponent config={enabledConfig} onChange={mockOnChange} />)

        fireEvent.click(screen.getByText('💰 Andere Einkünfte'))
        fireEvent.click(screen.getByText('Neue Einkommensquelle hinzufügen'))

        await waitFor(() => {
          const submitButton = screen.getByRole('button', { name: 'Hinzufügen' })
          const cancelButton = screen.getByRole('button', { name: /abbrechen/i })

          // Verify large button size for touch targets
          expect(submitButton).toHaveClass('h-12') // size="lg"
          expect(cancelButton).toHaveClass('h-12') // size="lg"
        })
      })

      it('should prevent text wrapping on badges with whitespace-nowrap', () => {
        const configWithSources = {
          ...defaultConfig,
          enabled: true,
          sources: [
            {
              id: 'test-source',
              name: 'Test Income',
              type: 'rental' as const,
              monthlyAmount: 1000,
              amountType: 'gross' as const,
              taxRate: 30,
              startYear: 2025,
              endYear: null,
              inflationRate: 2,
              enabled: true,
              notes: '',
            },
          ],
        }

        render(<OtherIncomeConfigurationComponent config={configWithSources} onChange={mockOnChange} />)

        fireEvent.click(screen.getByText('💰 Andere Einkünfte'))

        // Check badges have whitespace-nowrap to prevent wrapping
        const rentalBadge = screen.getByText('Mieteinnahmen')
        const grossBadge = screen.getByText('Brutto')

        expect(rentalBadge).toHaveClass('whitespace-nowrap')
        expect(grossBadge).toHaveClass('whitespace-nowrap')
      })
    })
  })
})
