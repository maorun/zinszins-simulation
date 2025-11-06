import { CollapsibleCardHeader } from './ui/collapsible-card'

/**
 * Collapsible header for SavedSparplansList
 * Displays title with expand/collapse trigger
 */
export function SavedSparplansListHeader() {
  return (
    <CollapsibleCardHeader
      className="pb-4"
      titleClassName="text-left text-lg"
      iconClassName="h-5 w-5"
      simplifiedPadding
    >
      📋 Gespeicherte Sparpläne & Einmalzahlungen
    </CollapsibleCardHeader>
  )
}
