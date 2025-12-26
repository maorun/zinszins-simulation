import React from 'react'
import type { DashboardSectionId, SectionPreference } from '../../utils/dashboard-preferences'
import { SectionItem } from './SectionItem'
import { SECTION_LABELS, SECTION_DESCRIPTIONS } from './section-labels'

interface SectionListProps {
  sortedPreferences: SectionPreference[]
  visibleCount: number
  draggedIndex: number | null
  draggedOverIndex: number | null
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onDragLeave: () => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onVisibilityChange: (sectionId: DashboardSectionId, visible: boolean) => void
}

export function SectionList({
  sortedPreferences,
  visibleCount,
  draggedIndex,
  draggedOverIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragLeave,
  onMoveUp,
  onMoveDown,
  onVisibilityChange,
}: SectionListProps) {
  return (
    <div className="space-y-2">
      {sortedPreferences.map((preference, index) => (
        <SectionItem
          key={preference.id}
          preference={preference}
          index={index}
          totalCount={sortedPreferences.length}
          visibleCount={visibleCount}
          isDragging={draggedIndex === index}
          isDraggedOver={draggedOverIndex === index}
          sectionLabel={SECTION_LABELS[preference.id]}
          sectionDescription={SECTION_DESCRIPTIONS[preference.id]}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragLeave={onDragLeave}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onVisibilityChange={onVisibilityChange}
        />
      ))}
    </div>
  )
}
