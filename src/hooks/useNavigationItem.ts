import { useEffect, useRef } from 'react'
import { useNavigation } from '../contexts/NavigationContext'

interface UseNavigationItemProps {
  id: string
  title: string
  icon?: string
  parentId?: string
  level?: number
}

export function useNavigationItem({
  id,
  title,
  icon,
  parentId,
  level = 0,
}: UseNavigationItemProps) {
  const elementRef = useRef<HTMLElement>(null)
  const { registerItem, unregisterItem } = useNavigation()

  useEffect(() => {
    if (elementRef.current) {
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
      unregisterItem(id)
    }
  }, [id, title, icon, parentId, level, registerItem, unregisterItem])

  return elementRef
}