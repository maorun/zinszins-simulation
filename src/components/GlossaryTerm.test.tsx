import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { TooltipProvider } from './ui/tooltip'
import { GlossaryTerm } from './GlossaryTerm'

// Helper to render with TooltipProvider
function renderWithTooltip(ui: ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

describe('GlossaryTerm', () => {
  describe('rendering', () => {
    it('should render with term name from glossary', () => {
      renderWithTooltip(<GlossaryTerm term="vorabpauschale" />)
      expect(screen.getByText('Vorabpauschale')).toBeInTheDocument()
    })

    it('should render with custom children text', () => {
      renderWithTooltip(<GlossaryTerm term="vorabpauschale">Custom Text</GlossaryTerm>)
      expect(screen.getByText('Custom Text')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = renderWithTooltip(
        <GlossaryTerm term="vorabpauschale" className="custom-class" />,
      )
      const element = container.querySelector('.custom-class')
      expect(element).toBeInTheDocument()
    })

    it('should show help icon when showIcon is true', () => {
      renderWithTooltip(<GlossaryTerm term="vorabpauschale" showIcon />)
      const icon = screen.getByText('Vorabpauschale').closest('span')?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should not show help icon by default', () => {
      renderWithTooltip(<GlossaryTerm term="vorabpauschale" />)
      const icon = screen.getByText('Vorabpauschale').closest('span')?.querySelector('svg')
      expect(icon).not.toBeInTheDocument()
    })
  })

  describe('tooltip behavior', () => {
    it('should have cursor-help styling', () => {
      renderWithTooltip(<GlossaryTerm term="vorabpauschale" />)
      const element = screen.getByText('Vorabpauschale')
      expect(element).toHaveClass('cursor-help')
    })

    it('should have underline decoration', () => {
      renderWithTooltip(<GlossaryTerm term="vorabpauschale" />)
      const element = screen.getByText('Vorabpauschale')
      expect(element).toHaveClass('underline')
      expect(element).toHaveClass('decoration-dotted')
    })

    it('should be keyboard accessible with tabIndex', () => {
      renderWithTooltip(<GlossaryTerm term="vorabpauschale" />)
      const element = screen.getByText('Vorabpauschale')
      expect(element).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('tooltip content', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<GlossaryTerm term="vorabpauschale" />)

      const trigger = screen.getByText('Vorabpauschale')
      await user.hover(trigger)

      // Tooltip content should appear
      const shortDef = await screen.findByText(/Jährliche Besteuerung/i, {}, { timeout: 1000 })
      expect(shortDef).toBeInTheDocument()
    })

    it('should display term name in tooltip', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<GlossaryTerm term="kapitalertragsteuer" />)

      const trigger = screen.getByText('Kapitalertragsteuer')
      await user.hover(trigger)

      const tooltipTitle = await screen.findByText('Kapitalertragsteuer', { selector: 'div' })
      expect(tooltipTitle).toBeInTheDocument()
    })

    it('should display short definition', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<GlossaryTerm term="basiszins" />)

      const trigger = screen.getByText('Basiszins')
      await user.hover(trigger)

      const shortDef = await screen.findByText(/Referenzzinssatz/i)
      expect(shortDef).toBeInTheDocument()
    })

    it('should display detailed explanation', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<GlossaryTerm term="teilfreistellung" />)

      const trigger = screen.getByText('Teilfreistellung')
      await user.hover(trigger)

      const detailedExplanation = await screen.findByText(/Körperschaftsteuer/i)
      expect(detailedExplanation).toBeInTheDocument()
    })

    it('should display example when available', async () => {
      const user = userEvent.setup()
      renderWithTooltip(<GlossaryTerm term="sparerpauschbetrag" />)

      const trigger = screen.getByText('Sparerpauschbetrag')
      await user.hover(trigger)

      const exampleLabel = await screen.findByText(/Beispiel:/i)
      expect(exampleLabel).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should render plain text for unknown term', () => {
      renderWithTooltip(<GlossaryTerm term="nonexistent">Unknown Term</GlossaryTerm>)
      const element = screen.getByText('Unknown Term')
      expect(element).toBeInTheDocument()
      // Should not have tooltip styling
      expect(element).not.toHaveClass('underline')
    })

    it('should use term key as fallback when no children provided and term not found', () => {
      renderWithTooltip(<GlossaryTerm term="nonexistent" />)
      const element = screen.getByText('nonexistent')
      expect(element).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      renderWithTooltip(
        <div>
          <button type="button">Before</button>
          <GlossaryTerm term="vorabpauschale" />
          <button type="button">After</button>
        </div>,
      )

      // Tab to first button
      await user.tab()
      expect(screen.getByText('Before')).toHaveFocus()

      // Tab to glossary term
      await user.tab()
      expect(screen.getByText('Vorabpauschale')).toHaveFocus()

      // Tab to next button
      await user.tab()
      expect(screen.getByText('After')).toHaveFocus()
    })
  })

  describe('multiple terms', () => {
    it('should render multiple glossary terms correctly', async () => {
      const user = userEvent.setup()
      renderWithTooltip(
        <div>
          <GlossaryTerm term="vorabpauschale" />
          {' '}
          und
          {' '}
          <GlossaryTerm term="basiszins" />
        </div>,
      )

      expect(screen.getByText('Vorabpauschale')).toBeInTheDocument()
      expect(screen.getByText('Basiszins')).toBeInTheDocument()

      // Hover over first term
      await user.hover(screen.getByText('Vorabpauschale'))
      const firstTooltip = await screen.findByText(/thesaurierende/i)
      expect(firstTooltip).toBeInTheDocument()
    })
  })
})
