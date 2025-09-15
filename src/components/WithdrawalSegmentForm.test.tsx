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

  describe('Phase Reordering Functionality', () => {
    const multipleSegments: WithdrawalSegment[] = [
      createDefaultWithdrawalSegment('segment1', 'Phase 1', 2041, 2050),
      createDefaultWithdrawalSegment('segment2', 'Phase 2', 2051, 2060),
      createDefaultWithdrawalSegment('segment3', 'Phase 3', 2061, 2070),
    ]

    const propsWithMultipleSegments = {
      ...defaultProps,
      segments: multipleSegments,
    }

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('shows reordering buttons for phases that can be moved', () => {
      render(<WithdrawalSegmentForm {...propsWithMultipleSegments} />)

      // First expand the main card to see the phases
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // Check that reordering buttons are present
      // Insert before buttons should be available for all phases
      expect(screen.getAllByLabelText('Phase davor einfügen')).toHaveLength(3)

      // Move up buttons should be available for all phases except the first
      expect(screen.getAllByLabelText('Phase nach oben verschieben')).toHaveLength(2)

      // Move down buttons should be available for all phases except the last
      expect(screen.getAllByLabelText('Phase nach unten verschieben')).toHaveLength(2)
    })

    it('calls onSegmentsChange when move up button is clicked', () => {
      const onSegmentsChangeMock = vi.fn()
      const propsWithMock = {
        ...propsWithMultipleSegments,
        onSegmentsChange: onSegmentsChangeMock,
      }

      render(<WithdrawalSegmentForm {...propsWithMock} />)

      // Expand main card
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // Click the move up button for the second phase
      const moveUpButtons = screen.getAllByLabelText('Phase nach oben verschieben')
      fireEvent.click(moveUpButtons[0]) // First move up button (for second phase)

      expect(onSegmentsChangeMock).toHaveBeenCalled()
      expect(onSegmentsChangeMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'segment1' }),
          expect.objectContaining({ id: 'segment2' }),
          expect.objectContaining({ id: 'segment3' }),
        ]),
      )
    })

    it('calls onSegmentsChange when move down button is clicked', () => {
      const onSegmentsChangeMock = vi.fn()
      const propsWithMock = {
        ...propsWithMultipleSegments,
        onSegmentsChange: onSegmentsChangeMock,
      }

      render(<WithdrawalSegmentForm {...propsWithMock} />)

      // Expand main card
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // Click the move down button for the first phase
      const moveDownButtons = screen.getAllByLabelText('Phase nach unten verschieben')
      fireEvent.click(moveDownButtons[0]) // First move down button (for first phase)

      expect(onSegmentsChangeMock).toHaveBeenCalled()
    })

    it('calls onSegmentsChange when insert before button is clicked', () => {
      const onSegmentsChangeMock = vi.fn()
      const propsWithMock = {
        ...propsWithMultipleSegments,
        onSegmentsChange: onSegmentsChangeMock,
      }

      render(<WithdrawalSegmentForm {...propsWithMock} />)

      // Expand main card
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // Click the insert before button for the second phase
      const insertBeforeButtons = screen.getAllByLabelText('Phase davor einfügen')
      fireEvent.click(insertBeforeButtons[1]) // Insert before second phase

      expect(onSegmentsChangeMock).toHaveBeenCalled()
      const callArgs = onSegmentsChangeMock.mock.calls[0][0]
      expect(callArgs).toHaveLength(4) // Should have 4 segments now (3 + 1 inserted)
    })

    it('prevents event propagation when reordering buttons are clicked', () => {
      const onSegmentsChangeMock = vi.fn()
      const propsWithMock = {
        ...propsWithMultipleSegments,
        onSegmentsChange: onSegmentsChangeMock,
      }

      render(<WithdrawalSegmentForm {...propsWithMock} />)

      // Expand main card
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // The individual phase cards should still be collapsed after clicking buttons
      // Click a move up button
      const moveUpButtons = screen.getAllByLabelText('Phase nach oben verschieben')
      fireEvent.click(moveUpButtons[0])

      // Phase content should still not be visible (card should remain collapsed)
      expect(screen.queryByText('Name der Phase')).not.toBeInTheDocument()
    })

    it('shows different colored buttons for different actions', () => {
      render(<WithdrawalSegmentForm {...propsWithMultipleSegments} />)

      // Expand main card
      const mainCardHeader = screen.getByText('Entnahme-Phasen konfigurieren').closest('div')
      fireEvent.click(mainCardHeader!)

      // Check that buttons have appropriate colors
      const insertButtons = screen.getAllByLabelText('Phase davor einfügen')
      const moveUpButtons = screen.getAllByLabelText('Phase nach oben verschieben')
      const moveDownButtons = screen.getAllByLabelText('Phase nach unten verschieben')
      const deleteButtons = screen.getAllByLabelText('Phase löschen')

      // Insert buttons should have blue styling
      expect(insertButtons[0]).toHaveClass('text-blue-600')

      // Move buttons should have green styling
      expect(moveUpButtons[0]).toHaveClass('text-green-600')
      expect(moveDownButtons[0]).toHaveClass('text-green-600')

      // Delete buttons should have destructive styling
      expect(deleteButtons[0]).toHaveClass('text-destructive')
    })
  })
})
