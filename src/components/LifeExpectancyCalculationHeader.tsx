import { CollapsibleCardHeader } from './ui/collapsible-card'

export function LifeExpectancyCalculationHeader() {
  return (
    <CollapsibleCardHeader
      titleClassName="text-base font-semibold text-green-800"
      iconClassName="h-4 w-4"
      simplifiedPadding
    >
      🕰️ Lebensende Berechnung
    </CollapsibleCardHeader>
  )
}
