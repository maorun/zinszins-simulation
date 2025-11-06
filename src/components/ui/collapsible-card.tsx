import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { NestingProvider } from '../../lib/nesting-context'
import { useNestingLevel } from '../../lib/nesting-utils'
import { Card, CardContent, CardContentProps, CardHeader, CardHeaderProps, CardProps, CardTitle } from './card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { useNavigationItem } from '../../hooks/useNavigationItem'

export interface CollapsibleCardHeaderProps extends CardHeaderProps {
  /** Custom className for the CardTitle */
  titleClassName?: string
  /** Custom className for the ChevronDown icon */
  iconClassName?: string
  /** Whether to use simplified padding (p-2 -m-2 instead of responsive) */
  simplifiedPadding?: boolean
}

export const CollapsibleCardHeader = React.forwardRef<
  HTMLDivElement,
  CollapsibleCardHeaderProps
>(({ children, titleClassName, iconClassName, simplifiedPadding, ...props }, ref) => {
  const nestingLevel = useNestingLevel()

  const paddingClasses = simplifiedPadding
    ? 'p-2 -m-2'
    : 'p-3 -m-3 sm:p-2 sm:-m-2 min-h-[44px] sm:min-h-[36px] active:bg-gray-100 mobile-interactive'

  const defaultIconClasses = simplifiedPadding
    ? 'h-5 w-5'
    : 'h-5 w-5 sm:h-4 sm:w-4'

  return (
    <CardHeader nestingLevel={nestingLevel} {...props} ref={ref}>
      <CollapsibleTrigger asChild>
        <div className={`flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md transition-colors group ${paddingClasses}`}>
          <CardTitle className={titleClassName}>
            {children}
          </CardTitle>
          <ChevronDown className={`${iconClassName || defaultIconClasses} text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180`} />
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
  CardProps & {
    navigationId?: string
    navigationTitle?: string
    navigationIcon?: string
    navigationParentId?: string
  }
>(({ children, navigationId, navigationTitle, navigationIcon, navigationParentId, ...props }, ref) => {
  const nestingLevel = useNestingLevel()
  const navigationRef = useNavigationItem({
    id: navigationId || '',
    title: navigationTitle || '',
    icon: navigationIcon,
    parentId: navigationParentId,
    level: nestingLevel,
  })

  return (
    <Collapsible defaultOpen={false}>
      <Card
        nestingLevel={nestingLevel}
        {...props}
        ref={navigationId ? navigationRef : ref}
      >
        {children}
      </Card>
    </Collapsible>
  )
})
