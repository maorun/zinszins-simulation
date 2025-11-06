import { Label } from '../ui/label'

interface RetirementStartYearDisplayProps {
  planningMode: 'individual' | 'couple'
  birthYear?: number
  spouseBirthYear?: number
  retirementStartYear: number
}

/**
 * Warning message when birth years are missing
 */
function MissingBirthYearWarning({
  planningMode,
  birthYear,
  spouseBirthYear,
}: {
  planningMode: 'individual' | 'couple'
  birthYear?: number
  spouseBirthYear?: number
}) {
  if (!birthYear || (planningMode === 'couple' && !spouseBirthYear)) {
    return (
      <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200 mt-2">
        Bitte Geburtsjahr(e) in der Globalen Planung festlegen
      </div>
    )
  }
  return null
}

export function RetirementStartYearDisplay({
  planningMode,
  birthYear,
  spouseBirthYear,
  retirementStartYear,
}: RetirementStartYearDisplayProps) {
  return (
    <div className="space-y-2">
      <Label>Rentenbeginn (automatisch berechnet)</Label>
      <div className="p-3 border rounded-lg bg-green-50">
        {planningMode === 'individual' ? (
          <IndividualRetirementDisplay birthYear={birthYear} retirementStartYear={retirementStartYear} />
        ) : (
          <CoupleRetirementDisplay
            birthYear={birthYear}
            spouseBirthYear={spouseBirthYear}
            retirementStartYear={retirementStartYear}
          />
        )}
        <div className="text-xs text-muted-foreground mt-2">
          Jahr ab dem die Rentnerregelungen gelten (berechnet mit Renteneintrittsalter 67)
        </div>
        <MissingBirthYearWarning planningMode={planningMode} birthYear={birthYear} spouseBirthYear={spouseBirthYear} />
      </div>
    </div>
  )
}

function IndividualRetirementDisplay({
  birthYear,
  retirementStartYear,
}: {
  birthYear?: number
  retirementStartYear: number
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm">
        <span className="text-gray-600">Basierend auf Geburtsjahr aus Globaler Planung:</span>
        <div className="font-medium">{birthYear || 'Nicht festgelegt'}</div>
      </div>
      <div className="text-lg font-bold text-green-800">Rentenbeginn: {birthYear ? retirementStartYear : '—'}</div>
    </div>
  )
}

function CoupleRetirementDisplay({
  birthYear,
  spouseBirthYear,
  retirementStartYear,
}: {
  birthYear?: number
  spouseBirthYear?: number
  retirementStartYear: number
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Person 1:</span>
          <div className="font-medium">{birthYear || 'Nicht festgelegt'}</div>
        </div>
        <div>
          <span className="text-gray-600">Person 2:</span>
          <div className="font-medium">{spouseBirthYear || 'Nicht festgelegt'}</div>
        </div>
      </div>
      <div className="text-lg font-bold text-green-800">
        Rentenbeginn (frühester): {birthYear && spouseBirthYear ? retirementStartYear : '—'}
      </div>
    </div>
  )
}
