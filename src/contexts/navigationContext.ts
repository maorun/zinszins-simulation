import { createContext } from 'react'

export interface NavigationItem {
  id: string
  title: string
  icon?: string
  parentId?: string
  level: number
  element?: HTMLDivElement | null
}

export interface NavigationContextType {
  items: Map<string, NavigationItem>
  registerItem: (item: NavigationItem) => void
  unregisterItem: (id: string) => void
  expandItem: (id: string) => void
  scrollToItem: (id: string) => void
  getNavigationTree: () => NavigationItem[]
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined)
