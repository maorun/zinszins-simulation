interface SummaryInfoProps {
  currentYear: number
}

/**
 * Renders the summary information and tips
 */
export function SummaryInfo({ currentYear }: SummaryInfoProps) {
  return (
    <div className="text-sm text-muted-foreground">
      <p>
        💡
        {' '}
        <strong>Tipp:</strong>
        {' '}
        Historische Daten (vor
        {' '}
        {currentYear}
        ) können nicht gelöscht werden.
        Zukünftige Raten können manuell hinzugefügt oder über die Bundesbank-API aktualisiert werden.
      </p>
    </div>
  )
}
