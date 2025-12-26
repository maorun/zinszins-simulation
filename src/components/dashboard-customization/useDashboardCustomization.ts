import { useState, useMemo } from 'react'
import type { DashboardSectionId, SectionPreference } from '../../utils/dashboard-preferences'
import { useDragAndDrop } from './useDragAndDrop'
import { useReordering } from './useReordering'

export function useDashboardCustomization(
  preferences: SectionPreference[],
  onOrderChange: (sectionIds: DashboardSectionId[]) => void,
) {
  const [isOpen, setIsOpen] = useState(false)

  // Sort preferences by order
  const sortedPreferences = useMemo(() => {
    return [...preferences].sort((a, b) => a.order - b.order)
  }, [preferences])

  // Count visible sections
  const visibleCount = useMemo(() => {
    return preferences.filter((p) => p.visible).length
  }, [preferences])

  // Drag and drop handlers
  const dragAndDrop = useDragAndDrop(sortedPreferences, onOrderChange)

  // Reordering handlers
  const reordering = useReordering(sortedPreferences, onOrderChange)

  return {
    isOpen,
    setIsOpen,
    sortedPreferences,
    visibleCount,
    ...dragAndDrop,
    ...reordering,
  }
}
