import { Settings } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import type { DashboardSectionId, SectionPreference } from '../utils/dashboard-preferences'
import { DialogContentInner } from './dashboard-customization/DialogContentInner'
import { useDashboardCustomization } from './dashboard-customization/useDashboardCustomization'

interface DashboardCustomizationProps {
  preferences: SectionPreference[]
  onVisibilityChange: (sectionId: DashboardSectionId, visible: boolean) => void
  onOrderChange: (sectionIds: DashboardSectionId[]) => void
  onReset: () => void
}

export function DashboardCustomization({
  preferences,
  onVisibilityChange,
  onOrderChange,
  onReset,
}: DashboardCustomizationProps) {
  const {
    isOpen,
    setIsOpen,
    sortedPreferences,
    visibleCount,
    draggedIndex,
    draggedOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragLeave,
    moveUp,
    moveDown,
  } = useDashboardCustomization(preferences, onOrderChange)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Dashboard anpassen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogContentInner
          sortedPreferences={sortedPreferences}
          visibleCount={visibleCount}
          draggedIndex={draggedIndex}
          draggedOverIndex={draggedOverIndex}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onVisibilityChange={onVisibilityChange}
          onReset={onReset}
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
