import { useState, useCallback } from 'react'
import type { DashboardSectionId, SectionPreference } from '../../utils/dashboard-preferences'

export function useDragAndDrop(
  sortedPreferences: SectionPreference[],
  onOrderChange: (sectionIds: DashboardSectionId[]) => void,
) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  const handleDragOver = useCallback((e: unknown, index: number) => {
    const event = e as { preventDefault: () => void }
    event.preventDefault()
    setDraggedOverIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (draggedIndex !== null && draggedOverIndex !== null && draggedIndex !== draggedOverIndex) {
      const newOrder = [...sortedPreferences]
      const [removed] = newOrder.splice(draggedIndex, 1)
      newOrder.splice(draggedOverIndex, 0, removed)

      const newSectionIds = newOrder.map((p) => p.id)
      onOrderChange(newSectionIds)
    }
    setDraggedIndex(null)
    setDraggedOverIndex(null)
  }, [draggedIndex, draggedOverIndex, sortedPreferences, onOrderChange])

  const handleDragLeave = useCallback(() => {
    setDraggedOverIndex(null)
  }, [])

  return {
    draggedIndex,
    draggedOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragLeave,
  }
}
