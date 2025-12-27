import React from 'react'
import { Card, CardHeader } from '../ui/card'
import type { DashboardSectionId, SectionPreference } from '../../utils/dashboard-preferences'
import { DragHandle } from './DragHandle'
import { SectionInfo } from './SectionInfo'
import { VisibilityToggle } from './VisibilityToggle'

interface SectionItemProps {
  preference: SectionPreference
  index: number
  totalCount: number
  visibleCount: number
  isDragging: boolean
  isDraggedOver: boolean
  sectionLabel: string
  sectionDescription: string
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onDragLeave: () => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onVisibilityChange: (sectionId: DashboardSectionId, visible: boolean) => void
}

/**
 * Individual section item in the customization list
 */
export function SectionItem({
  preference,
  index,
  totalCount,
  visibleCount,
  isDragging,
  isDraggedOver,
  sectionLabel,
  sectionDescription,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragLeave,
  onMoveUp,
  onMoveDown,
  onVisibilityChange,
}: SectionItemProps) {
  // Determine if toggle can be disabled (last visible section)
  const canToggle = visibleCount > 1 || !preference.visible

  return (
    <Card
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDragLeave={onDragLeave}
      className={`
        transition-all duration-200 cursor-move
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isDraggedOver && !isDragging ? 'border-primary border-2' : ''}
        ${!preference.visible ? 'opacity-60' : ''}
      `}
    >
      <CardHeader className="p-4">
        <div className="flex items-start gap-3">
          <DragHandle index={index} totalCount={totalCount} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />

          <SectionInfo visible={preference.visible} label={sectionLabel} description={sectionDescription} />

          <VisibilityToggle
            sectionId={preference.id}
            visible={preference.visible}
            canToggle={canToggle}
            onVisibilityChange={onVisibilityChange}
          />
        </div>
      </CardHeader>
    </Card>
  )
}
