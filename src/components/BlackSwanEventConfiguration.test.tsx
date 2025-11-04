import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BlackSwanEventConfiguration from './BlackSwanEventConfiguration'
import React from 'react'

// Mock the collapsible component to be always open for testing purposes
vi.mock('./ui/collapsible', () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

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

    it('renders the info box when collapsible is open', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      // Info box should be visible since collapsible is mocked to be always open
      expect(screen.getByText(/Was sind Black Swan Ereignisse?/)).toBeInTheDocument()
    })

    it('displays content elements', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      expect(screen.getByText(/Was sind Black Swan Ereignisse?/)).toBeInTheDocument()
    })
  })

  describe('Enable/Disable Functionality', () => {
    it('starts with Black Swan disabled', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      expect(screen.getByText('Deaktiviert (Standard Monte Carlo)')).toBeInTheDocument()
    })

    it('shows event selection when enabled', async () => {
      const user = userEvent.setup()
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      await user.click(enableRadio!)

      // Should show event options - use getAllByText since text appears in both info box and radio buttons
      expect(screen.getAllByText(/Dotcom-Blase/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Finanzkrise/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/COVID-19 Pandemie/).length).toBeGreaterThan(0)
    })

    it('calls onEventChange with null when disabled', async () => {
      const user = userEvent.setup()
      const onEventChange = vi.fn()
      render(<BlackSwanEventConfiguration {...defaultProps} onEventChange={onEventChange} />)

      // Enable first
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      await user.click(enableRadio!)

      // Then disable
      const disableRadio = screen.getByText('Deaktiviert (Standard Monte Carlo)').closest('label')
      await user.click(disableRadio!)

      expect(onEventChange).toHaveBeenCalledWith(null, '')
    })
  })

  describe('Event Selection', () => {
    it('displays event details when an event is selected', async () => {
      const user = userEvent.setup()
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      await user.click(enableRadio!)

      // Select Financial Crisis using radio button role
      const financialCrisisRadio = screen.getByRole('radio', { name: /Finanzkrise/ })
      await user.click(financialCrisisRadio)

      // Should show event details
      expect(screen.getByText(/📉 Ereignis-Details/)).toBeInTheDocument()
      expect(screen.getByText(/Globale Finanzkrise/)).toBeInTheDocument()
      expect(screen.getByText(/Kumulativer Verlust/)).toBeInTheDocument()
    })

    it('calls onEventChange when event is selected', async () => {
      const user = userEvent.setup()
      const onEventChange = vi.fn()
      render(<BlackSwanEventConfiguration {...defaultProps} onEventChange={onEventChange} />)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      await user.click(enableRadio!)

      // Select Dotcom Crash using radio button role
      const dotcomRadio = screen.getByRole('radio', { name: /Dotcom-Blase/ })
      await user.click(dotcomRadio)

      // Should be called with event returns
      expect(onEventChange).toHaveBeenCalled()
      const callArgs = onEventChange.mock.calls[onEventChange.mock.calls.length - 1][0]
      expect(callArgs).not.toBeNull()
      expect(typeof callArgs).toBe('object')
    })
  })

  describe('Event Year Selection', () => {
    it('displays year slider when enabled', async () => {
      const user = userEvent.setup()
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      await user.click(enableRadio!)

      expect(screen.getByText(/Jahr des Ereignisses:/)).toBeInTheDocument()
    })

    it('defaults to 5 years after simulation start', async () => {
      const user = userEvent.setup()
      render(<BlackSwanEventConfiguration {...defaultProps} simulationStartYear={2025} />)

      // Enable Black Swan
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      await user.click(enableRadio!)

      // Default year should be 2030 (2025 + 5)
      expect(screen.getByText(/Jahr des Ereignisses:/)).toHaveTextContent('2030')
    })
  })

  describe('Warning Messages', () => {
    it('displays important disclaimer', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      expect(screen.getByText(/⚠️ Wichtiger Hinweis/)).toBeInTheDocument()
      expect(screen.getByText(/Black Swan Ereignisse sind per Definition selten/)).toBeInTheDocument()
    })

    it('displays info about Black Swan events', () => {
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      expect(screen.getByText(/ℹ️ Was sind Black Swan Ereignisse?/)).toBeInTheDocument()
    })
  })

  describe('Integration with Event Data', () => {
    it('displays correct cumulative impact for financial crisis', async () => {
      const user = userEvent.setup()
      render(<BlackSwanEventConfiguration {...defaultProps} />)

      // Enable and select financial crisis
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      await user.click(enableRadio!)

      const financialCrisisRadio = screen.getByRole('radio', { name: /Finanzkrise/ })
      await user.click(financialCrisisRadio)

      // Should show -55.0% cumulative loss
      expect(screen.getByText(/-55\.0%/)).toBeInTheDocument()
    })

    it('displays year-by-year returns for selected event', async () => {
      const user = userEvent.setup()
      render(<BlackSwanEventConfiguration {...defaultProps} simulationStartYear={2025} />)

      // Enable and select financial crisis
      const enableRadio = screen.getByText('Aktiviert (Black Swan Szenario anwenden)').closest('label')
      await user.click(enableRadio!)

      const financialCrisisRadio = screen.getByRole('radio', { name: /Finanzkrise/ })
      await user.click(financialCrisisRadio)

      // Should show yearly returns (event starts in 2030 by default)
      expect(screen.getByText(/Jahr 2030/)).toBeInTheDocument()
      expect(screen.getByText(/Jahr 2031/)).toBeInTheDocument()
    })
  })
})
