import { useCallback } from 'react'
import type { DashboardSectionId, SectionPreference } from '../../utils/dashboard-preferences'

export function useReordering(
  sortedPreferences: SectionPreference[],
  onOrderChange: (sectionIds: DashboardSectionId[]) => void,
) {
  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return
      const newOrder = [...sortedPreferences]
      ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
      const newSectionIds = newOrder.map((p) => p.id)
      onOrderChange(newSectionIds)
    },
    [sortedPreferences, onOrderChange],
  )

  const moveDown = useCallback(
    (index: number) => {
      if (index === sortedPreferences.length - 1) return
      const newOrder = [...sortedPreferences]
      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      const newSectionIds = newOrder.map((p) => p.id)
      onOrderChange(newSectionIds)
    },
    [sortedPreferences, onOrderChange],
  )

  return { moveUp, moveDown }
}
