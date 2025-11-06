import { useState, useCallback, ReactNode } from 'react'
import { NavigationContext, type NavigationItem } from './navigationContext'

interface NavigationProviderProps {
  children: ReactNode
}

function expandCollapsible(element: HTMLElement) {
  const collapsible = element.closest('[data-state]')
  if (!collapsible) return

  const trigger = collapsible.querySelector('[data-state]')
  if (trigger && collapsible.getAttribute('data-state') === 'closed') {
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    trigger.dispatchEvent(clickEvent)
  }
}

function sortNavigationItems(itemsArray: NavigationItem[]): NavigationItem[] {
  return itemsArray.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    return a.title.localeCompare(b.title)
  })
}

function useNavigationItems() {
  const [items, setItems] = useState<Map<string, NavigationItem>>(new Map())

  const registerItem = useCallback((item: NavigationItem) => {
    setItems((prev) => new Map(prev).set(item.id, item))
  }, [])

  const unregisterItem = useCallback((id: string) => {
    setItems((prev) => {
      const newItems = new Map(prev)
      newItems.delete(id)
      return newItems
    })
  }, [])

  return { items, registerItem, unregisterItem }
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const { items, registerItem, unregisterItem } = useNavigationItems()

  const expandItem = useCallback(
    (id: string) => {
      const item = items.get(id)
      if (!item?.element) return

      expandCollapsible(item.element)

      if (item.parentId) {
        expandItem(item.parentId)
      }
    },
    [items],
  )

  const scrollToItem = useCallback(
    (id: string) => {
      const item = items.get(id)
      if (!item?.element) return

      expandItem(id)

      setTimeout(() => {
        item.element?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        })
      }, 200)
    },
    [items, expandItem],
  )

  const getNavigationTree = useCallback((): NavigationItem[] => {
    const itemsArray = Array.from(items.values())
    return sortNavigationItems(itemsArray)
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
