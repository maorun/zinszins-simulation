interface PersonSummaryDisplayProps {
  personName: string
  birthYear: number | undefined
  enabled: boolean
  startYear: number
  monthlyAmount: number
}

function formatPensionValue(enabled: boolean, value: string | number): string {
  return enabled ? `${value}` : '—'
}

export function PersonSummaryDisplay({
  personName,
  birthYear,
  enabled,
  startYear,
  monthlyAmount,
}: PersonSummaryDisplayProps) {
  const birthYearDisplay = birthYear ? `${birthYear}` : 'Nicht festgelegt'
  const startYearDisplay = formatPensionValue(enabled, startYear)
  const amountDisplay = formatPensionValue(enabled, `${monthlyAmount.toLocaleString('de-DE')} €`)

  return (
    <div className="space-y-2">
      <div className="font-medium text-blue-900">{personName}</div>
      <div>
        <span className="text-gray-600">Geburtsjahr:</span>
        <span className="font-medium ml-1">{birthYearDisplay}</span>
      </div>
      <div>
        <span className="text-gray-600">Rentenbeginn:</span>
        <span className="font-medium ml-1">{startYearDisplay}</span>
      </div>
      <div>
        <span className="text-gray-600">Monatliche Rente:</span>
        <span className="font-medium ml-1">{amountDisplay}</span>
      </div>
    </div>
  )
}
