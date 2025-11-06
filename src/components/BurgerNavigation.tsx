import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Menu, ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'
import { useNavigationOptional } from '../hooks/useNavigation'
import type { NavigationItem } from '../contexts/navigationContext'

/**
 * Navigation trigger button with item count
 */
function NavigationTriggerButton({ itemCount }: { itemCount: number }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 hover:text-blue-800"
    >
      <Menu className="h-4 w-4" />
      <span className="hidden sm:inline">Navigation</span>
      <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">{itemCount}</span>
    </Button>
  )
}

/**
 * Single navigation item button
 */
function NavigationItemButton({ item, onClick }: { item: NavigationItem; onClick: (id: string) => void }) {
  return (
    <Button
      key={item.id}
      variant="ghost"
      size="sm"
      onClick={() => onClick(item.id)}
      className={cn(
        'justify-start text-left h-auto py-3 px-3 hover:bg-blue-100 hover:text-blue-800 transition-colors group border border-transparent hover:border-blue-300 rounded-md',
        item.level > 0 && 'ml-4 text-sm',
        item.level > 1 && 'ml-8 text-xs',
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <span className="truncate flex-1">
          {item.icon && <span className="mr-1">{item.icon}</span>}
          {item.title}
        </span>
        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    </Button>
  )
}

export function BurgerNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const navigation = useNavigationOptional()

  if (!navigation) {
    return null
  }

  const { getNavigationTree, scrollToItem } = navigation
  const navigationItems = getNavigationTree()

  const handleItemClick = (id: string) => {
    scrollToItem(id)
    setIsOpen(false)
  }

  if (navigationItems.length === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <NavigationTriggerButton itemCount={navigationItems.length} />
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-800">
            <Menu className="h-5 w-5" />
            🧭 Navigation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-blue-700 mb-4">
            Klicke auf einen Bereich, um dorthin zu springen und ihn aufzuklappen:
          </p>
          <div className="grid gap-1 max-h-[50vh] overflow-y-auto pr-2">
            {navigationItems.map(item => (
              <NavigationItemButton key={item.id} item={item} onClick={handleItemClick} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
