import { Keyboard } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import { formatShortcut, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onClose: () => void
  shortcuts: KeyboardShortcut[]
}

/**
 * Component that displays a help dialog with all available keyboard shortcuts
 * Shortcuts are organized by category (navigation, actions, help)
 */
export function KeyboardShortcutsHelp({ open, onClose, shortcuts }: KeyboardShortcutsHelpProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Tastaturkürzel
          </AlertDialogTitle>
          <AlertDialogDescription>
            Verwenden Sie diese Tastaturkürzel für eine schnellere Navigation und effizienteres
            Arbeiten.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          <ShortcutsSection shortcuts={shortcuts} category="navigation" title="Navigation" />
          <ShortcutsSection shortcuts={shortcuts} category="actions" title="Aktionen" />
          <ShortcutsSection shortcuts={shortcuts} category="help" title="Hilfe" />
        </div>

        <AlertDialogFooter>
          <Button onClick={onClose} variant="outline">
            Schließen
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Component that displays a section of shortcuts for a specific category
 */
function ShortcutsSection({
  shortcuts,
  category,
  title,
}: {
  shortcuts: KeyboardShortcut[]
  category: 'navigation' | 'actions' | 'help'
  title: string
}) {
  const filteredShortcuts = shortcuts.filter(s => s.category === category)

  if (filteredShortcuts.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {filteredShortcuts.map((shortcut, index) => (
          <ShortcutRow key={index} shortcut={shortcut} />
        ))}
      </div>
    </div>
  )
}

/**
 * Component that displays a single shortcut row with key combination and description
 */
function ShortcutRow({ shortcut }: { shortcut: KeyboardShortcut }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50">
      <span className="text-sm text-gray-700">{shortcut.description}</span>
      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
        {formatShortcut(shortcut)}
      </kbd>
    </div>
  )
}
