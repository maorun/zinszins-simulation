import React from 'react'
import { Button } from '../ui/button'
import { Calculator } from 'lucide-react'

interface ActionButtonsSectionProps {
  isAddingNew: boolean
  onSave: () => void
  onCancel: () => void
}

export function ActionButtonsSection({ isAddingNew, onSave, onCancel }: ActionButtonsSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 pt-4">
      <Button onClick={onSave} size="lg" className="flex-1 w-full sm:w-auto">
        <Calculator className="h-4 w-4 mr-2" />
        {isAddingNew ? 'Hinzufügen' : 'Aktualisieren'}
      </Button>
      <Button onClick={onCancel} variant="outline" size="lg" className="w-full sm:w-auto">
        Abbrechen
      </Button>
    </div>
  )
}
