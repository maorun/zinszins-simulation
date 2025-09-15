import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { NestingProvider } from '../../lib/nesting-context'
import { useNestingLevel } from '../../lib/nesting-utils'
import { Card, CardContent, CardContentProps, CardHeader, CardHeaderProps, CardProps, CardTitle } from './card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

export const CollapsibleCardHeader = React.forwardRef<
  HTMLDivElement,
  CardHeaderProps
>(({ children, ...props }, ref) => {
  const nestingLevel = useNestingLevel()

  return (
    <CardHeader nestingLevel={nestingLevel} {...props} ref={ref}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
          <CardTitle>
            {children}
          </CardTitle>
          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
    </CardHeader>
  )
})

export const CollapsibleCardContent = React.forwardRef<
  HTMLDivElement,
  CardContentProps
>(({ children, ...props }, ref) => {
  const nestingLevel = useNestingLevel()

  return (
    <CollapsibleContent>
      <CardContent nestingLevel={nestingLevel} {...props} ref={ref}>
        <NestingProvider level={nestingLevel}>
          <div className="form-grid space-y-4">
            {children}
          </div>
        </NestingProvider>
      </CardContent>
    </CollapsibleContent>
  )
})

export const CollapsibleCard = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ children, ...props }, ref) => {
  const nestingLevel = useNestingLevel()

  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel} {...props} ref={ref}>
        {children}
      </Card>
    </Collapsible>
  )
})
