import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown, Navigation, ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'
import { useNavigation } from '../contexts/NavigationContext'

export function CollapsibleNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { getNavigationTree, scrollToItem } = useNavigation()
  
  const navigationItems = getNavigationTree()

  const handleItemClick = (id: string) => {
    scrollToItem(id)
    // Close navigation after clicking an item on mobile
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  if (navigationItems.length === 0) {
    return null
  }

  return (
    <Card className="mb-4 sticky top-4 z-40 shadow-lg border-2 border-blue-200 bg-blue-50/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-blue-100/50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left flex items-center gap-2 text-blue-800">
                <Navigation className="h-5 w-5" />
                🧭 Navigation
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-600 hidden sm:inline">
                  {navigationItems.length} Bereiche
                </span>
                <ChevronDown className="h-5 w-5 text-blue-600 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-blue-700 mb-3">
                Klicke auf einen Bereich, um dorthin zu springen und ihn aufzuklappen:
              </p>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      'justify-start text-left h-auto py-2 px-3 hover:bg-blue-100 hover:text-blue-800 transition-colors group border border-transparent hover:border-blue-300 rounded-md',
                      item.level > 0 && 'ml-4 text-sm',
                      item.level > 1 && 'ml-8 text-xs'
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
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}