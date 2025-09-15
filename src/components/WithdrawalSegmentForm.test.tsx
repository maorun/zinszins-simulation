import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WithdrawalSegmentForm } from './WithdrawalSegmentForm'
import { createDefaultWithdrawalSegment } from '../utils/segmented-withdrawal'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'

describe('WithdrawalSegmentForm', () => {
  const defaultSegments: WithdrawalSegment[] = [
    createDefaultWithdrawalSegment('test-1', 'Hauptphase', 2041, 2080),
  ]

  const defaultProps = {
    segments: defaultSegments,
    onSegmentsChange: vi.fn(),
    withdrawalStartYear: 2041,
    withdrawalEndYear: 2080,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Collapsible Functionality', () => {
    it('renders the main configuration card as collapsed by default', () => {
      render(<WithdrawalSegmentForm {...defaultProps} />)

      // The main card title should be visible
      expect(screen.getByText('Entnahme-Phasen konfigurieren')).toBeInTheDocument()

      // The description and button should not be visible initially (collapsed)
      expect(screen.queryByText(/Teile die Entnahme-Phase in verschiedene Zeiträume/)).not.toBeInTheDocument()
      expect(screen.queryByText('Phase hinzufügen')).not.toBeInTheDocument()
    })

    it('expands the main configuration card when clicked', () => {
      render(<WithdrawalSegmentForm {...defaultProps} />)

      // Click on the collapsible trigger
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      expect(mainCardHeader).toBeInTheDocument()

      fireEvent.click(mainCardHeader!)

      // Now the content should be visible
      expect(screen.getByText(/Teile die Entnahme-Phase in verschiedene Zeiträume/)).toBeInTheDocument()
      expect(screen.getByText('Phase hinzufügen')).toBeInTheDocument()
    })

    it('renders individual phase cards as collapsed by default', () => {
      render(<WithdrawalSegmentForm {...defaultProps} />)

      // First expand the main card to see the individual phases
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // The individual phase header should be visible
      expect(screen.getByText('Hauptphase (2041 - 2080)')).toBeInTheDocument()

      // The phase configuration should not be visible initially (collapsed)
      expect(screen.queryByText('Name der Phase')).not.toBeInTheDocument()
      expect(screen.queryByText('Entnahme-Strategie')).not.toBeInTheDocument()
    })

    it('expands individual phase cards when clicked', () => {
      render(<WithdrawalSegmentForm {...defaultProps} />)

      // First expand the main card
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // Click on the individual phase header
      const phaseHeader = screen.getByText('Hauptphase (2041 - 2080)').closest('div')
      expect(phaseHeader).toBeInTheDocument()

      fireEvent.click(phaseHeader!)

      // Now the phase configuration should be visible
      expect(screen.getByText('Name der Phase')).toBeInTheDocument()
      expect(screen.getByText('Entnahme-Strategie')).toBeInTheDocument()
      expect(screen.getByText('Rendite-Modus')).toBeInTheDocument()
    })

    it('includes chevron icons in collapsible headers', () => {
      render(<WithdrawalSegmentForm {...defaultProps} />)

      // Check for chevron icons by looking for the SVG elements with the specific classes
      const chevronIcons = document.querySelectorAll('svg.lucide-chevron-down')
      expect(chevronIcons.length).toBeGreaterThan(0)
    })

    it('allows collapsing and expanding sections multiple times', () => {
      render(<WithdrawalSegmentForm {...defaultProps} />)

      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')

      // Initially collapsed
      expect(screen.queryByText('Phase hinzufügen')).not.toBeInTheDocument()

      // Expand
      fireEvent.click(mainCardHeader!)
      expect(screen.getByText('Phase hinzufügen')).toBeInTheDocument()

      // Collapse again
      fireEvent.click(mainCardHeader!)
      expect(screen.queryByText('Phase hinzufügen')).not.toBeInTheDocument()

      // Expand again
      fireEvent.click(mainCardHeader!)
      expect(screen.getByText('Phase hinzufügen')).toBeInTheDocument()
    })
  })

  describe('Delete Functionality with Collapsible', () => {
    it('preserves delete functionality for individual phases', () => {
      const onSegmentsChangeMock = vi.fn()
      const multipleSegments = [
        createDefaultWithdrawalSegment('test-1', 'Phase 1', 2041, 2050),
        createDefaultWithdrawalSegment('test-2', 'Phase 2', 2051, 2080),
      ]

      render(
        <WithdrawalSegmentForm
          {...defaultProps}
          segments={multipleSegments}
          onSegmentsChange={onSegmentsChangeMock}
        />,
      )

      // Expand main card
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // Expand first phase to see delete button
      const phase1Header = screen.getByText('Phase 1 (2041 - 2050)').closest('div')
      fireEvent.click(phase1Header!)

      // Find and click delete button for first phase
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(button =>
        button.querySelector('svg') && button.className.includes('text-destructive'),
      )

      expect(deleteButton).toBeInTheDocument()

      fireEvent.click(deleteButton!)

      // Verify that onSegmentsChange was called (indicating delete worked)
      expect(onSegmentsChangeMock).toHaveBeenCalled()
    })
  })

  describe('Functional Integration', () => {
    it('maintains all form functionality when sections are expanded', () => {
      const onSegmentsChangeMock = vi.fn()

      render(
        <WithdrawalSegmentForm
          {...defaultProps}
          onSegmentsChange={onSegmentsChangeMock}
        />,
      )

      // Expand main card
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // Expand individual phase
      const phaseHeader = screen.getByText('Hauptphase (2041 - 2080)').closest('div')
      fireEvent.click(phaseHeader!)

      // Test that form inputs are functional
      const nameInput = screen.getByDisplayValue('Hauptphase')
      expect(nameInput).toBeInTheDocument()

      fireEvent.change(nameInput, { target: { value: 'Updated Phase Name' } })

      // Verify that the change was propagated
      expect(onSegmentsChangeMock).toHaveBeenCalled()
    })

    it('shows appropriate content in collapsed vs expanded states', () => {
      render(<WithdrawalSegmentForm {...defaultProps} />)

      // Main card collapsed - only title visible
      expect(screen.getByText('Entnahme-Phasen konfigurieren')).toBeInTheDocument()
      expect(screen.queryByText('Phase hinzufügen')).not.toBeInTheDocument()

      // Expand main card
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // Main card expanded - description and button visible
      expect(screen.getByText(/Teile die Entnahme-Phase in verschiedene Zeiträume/)).toBeInTheDocument()
      expect(screen.getByText('Phase hinzufügen')).toBeInTheDocument()

      // Individual phase collapsed - only title visible
      expect(screen.getByText('Hauptphase (2041 - 2080)')).toBeInTheDocument()
      expect(screen.queryByText('Name der Phase')).not.toBeInTheDocument()

      // Expand individual phase
      const phaseHeader = screen.getByText('Hauptphase (2041 - 2080)').closest('div')
      fireEvent.click(phaseHeader!)

      // Individual phase expanded - all form fields visible
      expect(screen.getByText('Name der Phase')).toBeInTheDocument()
      expect(screen.getByText('Entnahme-Strategie')).toBeInTheDocument()
      expect(screen.getByText('Rendite-Modus')).toBeInTheDocument()
    })
  })
})
