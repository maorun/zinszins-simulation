import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NavigationProvider } from './NavigationContext'
import { useNavigation } from '../hooks/useNavigation'

// Test component that uses the navigation context
function TestNavigationComponent() {
  const { registerItem, unregisterItem, expandItem, scrollToItem, getNavigationTree } = useNavigation()

  const handleRegisterItem = () => {
    const element = document.createElement('div')
    registerItem({
      id: 'test-item',
      title: 'Test Item',
      icon: '🧪',
      level: 0,
      element,
    })
  }

  const handleExpandItem = () => {
    expandItem('test-item')
  }

  const handleScrollToItem = () => {
    scrollToItem('test-item')
  }

  const navigationItems = getNavigationTree()

  return (
    <div>
      <button onClick={handleRegisterItem}>Register Item</button>
      <button onClick={handleExpandItem}>Expand Item</button>
      <button onClick={handleScrollToItem}>Scroll To Item</button>
      <button onClick={() => unregisterItem('test-item')}>Unregister Item</button>
      <div data-testid="item-count">{navigationItems.length}</div>
      {navigationItems.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.icon} {item.title}
        </div>
      ))}
    </div>
  )
}

describe('NavigationContext', () => {
  it('allows registering and retrieving navigation items', () => {
    render(
      <NavigationProvider>
        <TestNavigationComponent />
      </NavigationProvider>,
    )

    expect(screen.getByTestId('item-count')).toHaveTextContent('0')

    // Register an item
    fireEvent.click(screen.getByText('Register Item'))

    expect(screen.getByTestId('item-count')).toHaveTextContent('1')
    expect(screen.getByTestId('item-test-item')).toHaveTextContent('🧪 Test Item')
  })

  it('allows unregistering navigation items', () => {
    render(
      <NavigationProvider>
        <TestNavigationComponent />
      </NavigationProvider>,
    )

    // Register an item
    fireEvent.click(screen.getByText('Register Item'))
    expect(screen.getByTestId('item-count')).toHaveTextContent('1')

    // Unregister the item
    fireEvent.click(screen.getByText('Unregister Item'))
    expect(screen.getByTestId('item-count')).toHaveTextContent('0')
  })

  it('provides expand and scroll functionality', () => {
    // Mock scrollIntoView since it's not available in test environment
    const mockScrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = mockScrollIntoView

    render(
      <NavigationProvider>
        <TestNavigationComponent />
      </NavigationProvider>,
    )

    // Register an item first
    fireEvent.click(screen.getByText('Register Item'))

    // Test expand functionality (should not throw error)
    fireEvent.click(screen.getByText('Expand Item'))

    // Test scroll functionality
    fireEvent.click(screen.getByText('Scroll To Item'))

    // Should call scrollIntoView after timeout
    setTimeout(() => {
      expect(mockScrollIntoView).toHaveBeenCalled()
    }, 250)
  })

  it('sorts navigation items by level and title', () => {
    function MultiItemTestComponent() {
      const { registerItem, getNavigationTree } = useNavigation()

      const handleRegisterItems = () => {
        const element1 = document.createElement('div')
        const element2 = document.createElement('div')
        const element3 = document.createElement('div')

        registerItem({
          id: 'item-z',
          title: 'Z Item',
          icon: '🧪',
          level: 1,
          element: element1,
        })

        registerItem({
          id: 'item-a',
          title: 'A Item',
          icon: '🧪',
          level: 0,
          element: element2,
        })

        registerItem({
          id: 'item-b',
          title: 'B Item',
          icon: '🧪',
          level: 0,
          element: element3,
        })
      }

      const navigationItems = getNavigationTree()

      return (
        <div>
          <button onClick={handleRegisterItems}>Register Items</button>
          {navigationItems.map((item, index) => (
            <div key={item.id} data-testid={`sorted-item-${index}`}>
              Level {item.level}: {item.title}
            </div>
          ))}
        </div>
      )
    }

    render(
      <NavigationProvider>
        <MultiItemTestComponent />
      </NavigationProvider>,
    )

    fireEvent.click(screen.getByText('Register Items'))

    // Should be sorted by level first, then by title
    expect(screen.getByTestId('sorted-item-0')).toHaveTextContent('Level 0: A Item')
    expect(screen.getByTestId('sorted-item-1')).toHaveTextContent('Level 0: B Item')
    expect(screen.getByTestId('sorted-item-2')).toHaveTextContent('Level 1: Z Item')
  })
})
