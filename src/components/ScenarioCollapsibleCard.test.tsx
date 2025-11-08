import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ScenarioCollapsibleCard } from './ScenarioCollapsibleCard'
import React from 'react'

// Mock the collapsible component to be always open for testing purposes.
vi.mock('./ui/collapsible', () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-collapsible-trigger="true">{children}</div>
  ),
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock ScenarioSelectorContent
vi.mock('./ScenarioSelectorContent', () => ({
  ScenarioSelectorContent: ({ searchQuery }: { searchQuery: string }) => (
    <div data-testid="scenario-selector-content">Search: {searchQuery}</div>
  ),
}))

describe('ScenarioCollapsibleCard', () => {
  const mockRef = { current: null }
  const mockOnSearchChange = vi.fn()
  const mockOnClearSearch = vi.fn()
  const mockOnScenarioClick = vi.fn()

  const defaultProps = {
    navigationRef: mockRef,
    searchQuery: '',
    onSearchChange: mockOnSearchChange,
    onClearSearch: mockOnClearSearch,
    onScenarioClick: mockOnScenarioClick,
  }

  it('renders the card title correctly', () => {
    render(<ScenarioCollapsibleCard {...defaultProps} />)

    // Check that the title is rendered with correct text
    expect(screen.getByText(/Was-wäre-wenn Szenario/i)).toBeInTheDocument()
  })

  it('renders help icon in the title', () => {
    const { container } = render(<ScenarioCollapsibleCard {...defaultProps} />)

    // Check that HelpCircle icon is rendered (it has specific classes)
    const helpIcon = container.querySelector('.inline-block.w-4.h-4.opacity-60')
    expect(helpIcon).toBeInTheDocument()
  })

  it('renders chevron icon for collapse/expand', () => {
    const { container } = render(<ScenarioCollapsibleCard {...defaultProps} />)

    // Check that ChevronDown icon is rendered
    const chevronIcon = container.querySelector('.h-5.w-5')
    expect(chevronIcon).toBeInTheDocument()
  })

  it('renders ScenarioSelectorContent with correct props', () => {
    render(<ScenarioCollapsibleCard {...defaultProps} searchQuery="test query" />)

    // Check that the content component is rendered with search query
    expect(screen.getByTestId('scenario-selector-content')).toBeInTheDocument()
    expect(screen.getByText('Search: test query')).toBeInTheDocument()
  })

  it('does not cause infinite re-renders when clicked', () => {
    // This test verifies that the fix for the nested interactive elements is working
    const { container } = render(<ScenarioCollapsibleCard {...defaultProps} />)

    // Get the button element
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()

    // Click the button multiple times - should not cause errors
    if (button) {
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)
    }

    // Component should still be rendered without errors
    expect(screen.getByText(/Was-wäre-wenn Szenario/i)).toBeInTheDocument()
  })

  it('passes search query to child component', () => {
    const testQuery = 'retirement planning'
    render(<ScenarioCollapsibleCard {...defaultProps} searchQuery={testQuery} />)

    expect(screen.getByText(`Search: ${testQuery}`)).toBeInTheDocument()
  })
})
