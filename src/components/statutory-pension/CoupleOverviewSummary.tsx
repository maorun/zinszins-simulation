import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Info } from 'lucide-react'
import { PersonSummaryDisplay } from './PersonSummaryDisplay'

interface CoupleOverviewSummaryProps {
  person1: {
    enabled: boolean
    startYear: number
    monthlyAmount: number
  }
  person2: {
    enabled: boolean
    startYear: number
    monthlyAmount: number
  }
  birthYear?: number
  spouseBirthYear?: number
  nestingLevel: number
}

export function CoupleOverviewSummary({
  person1,
  person2,
  birthYear,
  spouseBirthYear,
  nestingLevel,
}: CoupleOverviewSummaryProps) {
  return (
    <Card nestingLevel={nestingLevel + 1}>
      <CardHeader nestingLevel={nestingLevel + 1}>
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          Renten-Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <PersonSummaryDisplay
            personName="Person 1"
            birthYear={birthYear}
            enabled={person1.enabled}
            startYear={person1.startYear}
            monthlyAmount={person1.monthlyAmount}
          />
          <PersonSummaryDisplay
            personName="Person 2"
            birthYear={spouseBirthYear}
            enabled={person2.enabled}
            startYear={person2.startYear}
            monthlyAmount={person2.monthlyAmount}
          />
        </div>
        {(!birthYear || !spouseBirthYear) && (
          <div className="mt-4 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
            Bitte Geburtsjahre in der Globalen Planung festlegen für automatische Rentenberechnung
          </div>
        )}
      </CardContent>
    </Card>
  )
}
