interface OtherIncomeEmptyStateProps {
  show: boolean
}

export function OtherIncomeEmptyState({ show }: OtherIncomeEmptyStateProps) {
  if (!show) {
    return null
  }

  return (
    <div className="text-center py-8 text-gray-500">
      <p>Noch keine Einkommensquellen konfiguriert.</p>
      <p className="text-sm">
        Klicken Sie oben auf "Neue Einkommensquelle hinzufügen" um zu beginnen.
      </p>
    </div>
  )
}
