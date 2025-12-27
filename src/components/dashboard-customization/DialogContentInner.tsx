import React from 'react'
import { Separator } from '../ui/separator'
import type { DashboardSectionId, SectionPreference } from '../../utils/dashboard-preferences'
import { DialogHeaderSection } from './DialogHeaderSection'
import { DialogFooterSection } from './DialogFooterSection'
import { SectionList } from './SectionList'

interface DialogContentInnerProps {
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
  onReset: () => void
  onClose: () => void
}

export function DialogContentInner({
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
  onReset,
  onClose,
}: DialogContentInnerProps) {
  return (
    <>
      {/* Header with title and description */}
      <DialogHeaderSection visibleCount={visibleCount} />

      {/* Main content area */}
      <div className="space-y-2">
        {/* Visibility counter */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {visibleCount} von {sortedPreferences.length} Bereichen sichtbar
          </span>
        </div>

        <Separator />

        {/* List of sections */}
        <SectionList
          sortedPreferences={sortedPreferences}
          visibleCount={visibleCount}
          draggedIndex={draggedIndex}
          draggedOverIndex={draggedOverIndex}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragLeave={onDragLeave}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onVisibilityChange={onVisibilityChange}
        />
      </div>

      {/* Footer with reset and close buttons */}
      <DialogFooterSection onReset={onReset} onClose={onClose} />
    </>
  )
}
