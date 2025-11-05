import { GERMAN_TAX_CONSTANTS } from '../../../helpers/steuer'

interface GrundfreibetragInfoProps {
  recommendedGrundfreibetrag: number
  planningModeLabel: string
}

export function GrundfreibetragInfo({
  recommendedGrundfreibetrag,
  planningModeLabel,
}: GrundfreibetragInfoProps) {
  return (
    <div className="text-sm text-muted-foreground">
      <p>
        Aktueller Grundfreibetrag 2024: €
        {GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_2024.toLocaleString()}
        {' '}
        pro Person | Empfohlener Wert für
        {' '}
        {planningModeLabel}
        : €
        {recommendedGrundfreibetrag.toLocaleString()}
      </p>
      <p>
        Der Grundfreibetrag wird automatisch basierend auf dem Planungsmodus
        (Einzelperson/Ehepaar) gesetzt. Er wird sowohl für einheitliche Strategien
        als auch für geteilte Entsparphasen berücksichtigt.
      </p>
    </div>
  )
}
