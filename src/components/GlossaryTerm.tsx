import { ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { getGlossaryTerm } from '../data/glossary'

interface GlossaryTermProps {
  term: string
  children?: ReactNode
  showIcon?: boolean
  className?: string
}

/**
 * GlossaryTerm component - Wraps text with a tooltip that displays the glossary definition
 *
 * Usage:
 * <GlossaryTerm term="vorabpauschale">Vorabpauschale</GlossaryTerm>
 * <GlossaryTerm term="basiszins" showIcon />
 */
export function GlossaryTerm({
  term,
  children,
  showIcon = false,
  className = '',
}: GlossaryTermProps) {
  const glossaryEntry = getGlossaryTerm(term)

  // If term not found in glossary, render children without tooltip
  if (!glossaryEntry) {
    return <span className={className}>{children || term}</span>
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 underline decoration-dotted underline-offset-2 cursor-help ${className}`}
          tabIndex={0}
        >
          {children || glossaryEntry.term}
          {showIcon && <HelpCircle className="inline-block w-3.5 h-3.5 opacity-60" />}
        </span>
      </TooltipTrigger>
      <TooltipContent
        className="max-w-sm p-4 bg-white border-2 border-blue-200 shadow-lg"
        side="top"
        sideOffset={8}
      >
        <div className="space-y-2">
          <div className="font-semibold text-blue-900 text-base border-b border-blue-200 pb-2">
            {glossaryEntry.term}
          </div>
          <div className="text-sm text-gray-700 font-medium">
            {glossaryEntry.shortDefinition}
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            {glossaryEntry.detailedExplanation}
          </div>
          {glossaryEntry.example && (
            <div className="text-xs bg-blue-50 border-l-4 border-blue-400 p-2 rounded">
              <span className="font-semibold text-blue-800">Beispiel:</span>
              {' '}
              <span className="text-gray-700">{glossaryEntry.example}</span>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
