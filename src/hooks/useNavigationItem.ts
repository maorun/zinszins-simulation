import { useEffect, useRef } from 'react'
import { useNavigationOptional } from './useNavigation'

interface UseNavigationItemProps {
  id: string
  title: string
  icon?: string
  parentId?: string
  level?: number
}

export function useNavigationItem({ id, title, icon, parentId, level = 0 }: UseNavigationItemProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  // Only use navigation if it's available (optional)
  const navigation = useNavigationOptional()
  const registerItem = navigation?.registerItem
  const unregisterItem = navigation?.unregisterItem

  useEffect(() => {
    if (elementRef.current && registerItem && id) {
      registerItem({
        id,
        title,
        icon,
        parentId,
        level,
        element: elementRef.current,
      })
    }

    return () => {
      if (unregisterItem && id) {
        unregisterItem(id)
      }
    }
  }, [id, title, icon, parentId, level, registerItem, unregisterItem])

  return elementRef
}
