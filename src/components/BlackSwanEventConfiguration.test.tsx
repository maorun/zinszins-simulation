import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BlackSwanEventConfiguration from './BlackSwanEventConfiguration'

describe('BlackSwanEventConfiguration', () => {
  const defaultProps = {
    simulationStartYear: 2025,
    onEventChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the Black Swan configuration card', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      expect(screen.getByText(/🦢 Black Swan Ereignisse/)).toBeInTheDocument()
    })

    it('renders as collapsed by default', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      // Info box should not be visible when collapsed
      expect(screen.queryByText(/Was sind Black Swan Ereignisse?/)).not.toBeInTheDocument()
    })

    it('expands when clicked', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      expect(screen.getByText(/Was sind Black Swan Ereignisse?/)).toBeInTheDocument()
    })
  })

  describe('Enable/Disable Functionality', () => {
    it('starts with Black Swan disabled', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      expect(screen.getByText('Deaktiviert (Standard Monte Carlo)')).toBeInTheDocument()
    })

    it('shows event selection when enabled', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      fireEvent.click(enableRadio!)

      // Should show event options - use getAllByText since text appears in both info box and radio buttons
      expect(screen.getAllByText(/Dotcom-Blase/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Finanzkrise/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/COVID-19 Pandemie/).length).toBeGreaterThan(0)
    })

    it('calls onEventChange with null when disabled', () => {
      const onEventChange = vi.fn()
      render(<BlackSwanEventConfiguration {...defaultProps} onEventChange={onEventChange} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      // Enable first
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      fireEvent.click(enableRadio!)

      // Then disable
      const disableRadio = screen.getByText('Deaktiviert (Standard Monte Carlo)').closest('label')
      fireEvent.click(disableRadio!)

      expect(onEventChange).toHaveBeenCalledWith(null)
    })
  })

  describe('Event Selection', () => {
    it('displays event details when an event is selected', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      fireEvent.click(enableRadio!)

      // Select Financial Crisis using radio button role
      const financialCrisisRadio = screen.getByRole('radio', { name: /Finanzkrise/ })
      fireEvent.click(financialCrisisRadio)

      // Should show event details
      expect(screen.getByText(/📉 Ereignis-Details/)).toBeInTheDocument()
      expect(screen.getByText(/Globale Finanzkrise/)).toBeInTheDocument()
      expect(screen.getByText(/Kumulativer Verlust/)).toBeInTheDocument()
    })

    it('calls onEventChange when event is selected', () => {
      const onEventChange = vi.fn()
      render(<BlackSwanEventConfiguration {...defaultProps} onEventChange={onEventChange} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      fireEvent.click(enableRadio!)

      // Select Dotcom Crash using radio button role
      const dotcomRadio = screen.getByRole('radio', { name: /Dotcom-Blase/ })
      fireEvent.click(dotcomRadio)

      // Should be called with event returns
      expect(onEventChange).toHaveBeenCalled()
      const callArgs = onEventChange.mock.calls[onEventChange.mock.calls.length - 1][0]
      expect(callArgs).not.toBeNull()
      expect(typeof callArgs).toBe('object')
    })
  })

  describe('Event Year Selection', () => {
    it('displays year slider when enabled', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      fireEvent.click(enableRadio!)

      expect(screen.getByText(/Jahr des Ereignisses:/)).toBeInTheDocument()
    })

    it('defaults to 5 years after simulation start', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} simulationStartYear={2025} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      fireEvent.click(enableRadio!)

      // Default year should be 2030 (2025 + 5)
      expect(screen.getByText(/Jahr des Ereignisses:/)).toHaveTextContent('2030')
    })
  })

  describe('Warning Messages', () => {
    it('displays important disclaimer', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      expect(screen.getByText(/⚠️ Wichtiger Hinweis/)).toBeInTheDocument()
      expect(screen.getByText(/Black Swan Ereignisse sind per Definition selten/)).toBeInTheDocument()
    })

    it('displays info about Black Swan events', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      expect(screen.getByText(/ℹ️ Was sind Black Swan Ereignisse?/)).toBeInTheDocument()
    })
  })

  describe('Integration with Event Data', () => {
    it('displays correct cumulative impact for financial crisis', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      // Enable and select financial crisis
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      fireEvent.click(enableRadio!)

      const financialCrisisRadio = screen.getByRole('radio', { name: /Finanzkrise/ })
      fireEvent.click(financialCrisisRadio)

      // Should show -55.0% cumulative loss
      expect(screen.getByText(/-55\.0%/)).toBeInTheDocument()
    })

    it('displays year-by-year returns for selected event', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} simulationStartYear={2025} />)

      const trigger = screen.getByText(/🦢 Black Swan Ereignisse/).closest('div')
      fireEvent.click(trigger!)

      // Enable and select financial crisis
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      fireEvent.click(enableRadio!)

      const financialCrisisRadio = screen.getByRole('radio', { name: /Finanzkrise/ })
      fireEvent.click(financialCrisisRadio)

      // Should show yearly returns (event starts in 2030 by default)
      expect(screen.getByText(/Jahr 2030/)).toBeInTheDocument()
      expect(screen.getByText(/Jahr 2031/)).toBeInTheDocument()
    })
  })
})
