import { ReactNode, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { NestingProvider } from '../../lib/nesting-context'

interface CollapsibleCategoryProps {
  title: string
  icon?: string
  children: ReactNode
  defaultOpen?: boolean
  nestingLevel?: number
}

/**
 * CollapsibleCategory - A collapsible container for grouping related configuration sections
 * Used to organize complex configuration areas into logical categories
 */
export function CollapsibleCategory({
  title,
  icon,
  children,
  defaultOpen = false,
  nestingLevel = 0,
}: CollapsibleCategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader nestingLevel={nestingLevel}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">
                {icon && `${icon} `}
                {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <NestingProvider level={nestingLevel + 1}>
              <div className="space-y-4">{children}</div>
            </NestingProvider>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
