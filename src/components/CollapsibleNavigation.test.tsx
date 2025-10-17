import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CollapsibleNavigation } from './CollapsibleNavigation'
import { NavigationProvider } from '../contexts/NavigationContext'

// Mock the useNavigation hook for testing
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

  it('is collapsed by default', () => {
    render(
      <NavigationProvider>
        <CollapsibleNavigation />
      </NavigationProvider>,
    )

    // Navigation items should not be visible initially
    expect(screen.queryByText('Test Section 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Test Section 2')).not.toBeInTheDocument()
  })

  it('expands when clicked and shows navigation items', async () => {
    render(
      <NavigationProvider>
        <CollapsibleNavigation />
      </NavigationProvider>,
    )

    // Click the navigation header to expand
    const navigationHeader = screen.getByText('🧭 Navigation')
    fireEvent.click(navigationHeader)

    // Navigation items should now be visible (wait for collapsible to open)
    await waitFor(() => {
      expect(screen.getByText('Test Section 1')).toBeInTheDocument()
    })
    expect(screen.getByText('Test Section 2')).toBeInTheDocument()
    expect(screen.getByText('Klicke auf einen Bereich, um dorthin zu springen und ihn aufzuklappen:')).toBeInTheDocument()
  })

  it('calls scrollToItem when navigation item is clicked', async () => {
    render(
      <NavigationProvider>
        <CollapsibleNavigation />
      </NavigationProvider>,
    )

    // Expand navigation
    const navigationHeader = screen.getByText('🧭 Navigation')
    fireEvent.click(navigationHeader)

    // Click on a navigation item (icon and text are in separate spans) - wait for it to appear
    await waitFor(() => {
      expect(screen.getByText('Test Section 1')).toBeInTheDocument()
    })
    
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
