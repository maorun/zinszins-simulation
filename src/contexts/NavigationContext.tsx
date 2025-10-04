import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface NavigationItem {
  id: string
  title: string
  icon?: string
  parentId?: string
  level: number
  element?: HTMLElement | null
}

interface NavigationContextType {
  items: Map<string, NavigationItem>
  registerItem: (item: NavigationItem) => void
  unregisterItem: (id: string) => void
  expandItem: (id: string) => void
  scrollToItem: (id: string) => void
  getNavigationTree: () => NavigationItem[]
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

interface NavigationProviderProps {
  children: ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [items, setItems] = useState<Map<string, NavigationItem>>(new Map())

  const registerItem = useCallback((item: NavigationItem) => {
    setItems(prev => {
      const newItems = new Map(prev)
      newItems.set(item.id, item)
      return newItems
    })
  }, [])

  const unregisterItem = useCallback((id: string) => {
    setItems(prev => {
      const newItems = new Map(prev)
      newItems.delete(id)
      return newItems
    })
  }, [])

  const expandItem = useCallback((id: string) => {
    const item = items.get(id)
    if (!item?.element) return

    // Find the collapsible component and expand it
    const collapsible = item.element.closest('[data-state]')
    if (collapsible) {
      const trigger = collapsible.querySelector('[data-state]')
      if (trigger && collapsible.getAttribute('data-state') === 'closed') {
        // Simulate click to expand
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        })
        trigger.dispatchEvent(clickEvent)
      }
    }

    // If this item has a parent, expand the parent first
    if (item.parentId) {
      expandItem(item.parentId)
    }
  }, [items])

  const scrollToItem = useCallback((id: string) => {
    const item = items.get(id)
    if (!item?.element) return

    // First expand the item and its parents
    expandItem(id)

    // Wait a bit for the expansion animation, then scroll
    setTimeout(() => {
      item.element?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })
    }, 200)
  }, [items, expandItem])

  const getNavigationTree = useCallback((): NavigationItem[] => {
    const itemsArray = Array.from(items.values())
    
    // Sort by level and then by order they were registered
    return itemsArray.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level
      return a.title.localeCompare(b.title)
    })
  }, [items])

  return (
    <NavigationContext.Provider
      value={{
        items,
        registerItem,
        unregisterItem,
        expandItem,
        scrollToItem,
        getNavigationTree,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}