import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CollapsibleNavigation } from './CollapsibleNavigation'
import { NavigationProvider } from '../contexts/NavigationContext'
import React from 'react'

// Mock the collapsible component to be always open for testing purposes.
vi.mock('./ui/collapsible', () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockNavigationItems = [
  {
    id: 'test-section-1',
    title: 'Test Section 1',
    icon: '⚙️',
    level: 0,
    element: document.createElement('div'),
  },
  {
    id: 'test-section-2',
    title: 'Test Section 2',
    icon: '📊',
    level: 0,
    element: document.createElement('div'),
  },
]

const mockScrollToItem = vi.fn()

vi.mock('../hooks/useNavigation', () => ({
  useNavigation: () => ({
    getNavigationTree: () => mockNavigationItems,
    scrollToItem: mockScrollToItem,
  }),
}))

describe('CollapsibleNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navigation with correct title and item count', () => {
    render(
      <NavigationProvider>
        <CollapsibleNavigation />
      </NavigationProvider>,
    )

    expect(screen.getByText('🧭 Navigation')).toBeInTheDocument()
    expect(screen.getByText('2 Bereiche')).toBeInTheDocument()
  })

  it('is expanded and shows navigation items', () => {
    render(
      <NavigationProvider>
        <CollapsibleNavigation />
      </NavigationProvider>,
    )

    // Navigation items should be visible
    expect(screen.getByText('Test Section 1')).toBeInTheDocument()
    expect(screen.getByText('Test Section 2')).toBeInTheDocument()
  })

  it('calls scrollToItem when navigation item is clicked', () => {
    render(
      <NavigationProvider>
        <CollapsibleNavigation />
      </NavigationProvider>,
    )

    const navigationItem = screen.getByText('Test Section 1')
    fireEvent.click(navigationItem)

    // Should call scrollToItem with correct id
    expect(mockScrollToItem).toHaveBeenCalledWith('test-section-1')
  })

  it('shows correct item count', () => {
    render(
      <NavigationProvider>
        <CollapsibleNavigation />
      </NavigationProvider>,
    )

    // Should show navigation
    expect(screen.getByText('🧭 Navigation')).toBeInTheDocument()
    // Should show item count (from mocked data)
    expect(screen.getByText(/\d+ Bereiche/)).toBeInTheDocument()
  })

  it('displays correct styling for navigation card', () => {
    render(
      <NavigationProvider>
        <CollapsibleNavigation />
      </NavigationProvider>,
    )

    const navigationCard = screen.getByText('🧭 Navigation').closest('.border-blue-200')
    expect(navigationCard).toBeInTheDocument()
    expect(navigationCard).toHaveClass('bg-blue-50/50')
    expect(navigationCard).toHaveClass('sticky')
    expect(navigationCard).toHaveClass('top-4')
  })
})
