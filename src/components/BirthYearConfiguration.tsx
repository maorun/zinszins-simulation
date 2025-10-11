import { Label } from './ui/label'
import { Input } from './ui/input'
import { calculateCurrentAge, getDefaultLifeExpectancy } from '../../helpers/life-expectancy'

interface BirthYearConfigurationProps {
  config: {
    planningMode: 'individual' | 'couple'
    gender: 'male' | 'female' | undefined
    birthYear: number | undefined
    expectedLifespan: number | undefined
    spouse: { gender: 'male' | 'female', birthYear?: number } | undefined
  }
  onChange: {
    birthYear: (year: number | undefined) => void
    expectedLifespan: (lifespan: number | undefined) => void
    spouse: (spouse?: { gender: 'male' | 'female', birthYear?: number }) => void
  }
}

export function BirthYearConfiguration({
  config,
  onChange,
}: BirthYearConfigurationProps) {
  const { planningMode, gender, birthYear, expectedLifespan, spouse } = config
  if (planningMode === 'individual') {
    return (
      <div className="space-y-2">
        <Label>Geburtsjahr Konfiguration</Label>
        <div className="p-3 border rounded-lg bg-white">
          <div className="space-y-2">
            <Label htmlFor="birth-year-main" className="text-sm font-medium">Geburtsjahr</Label>
            <Input
              id="birth-year-main"
              type="number"
              value={birthYear || ''}
              onChange={(e) => {
                const year = e.target.value ? Number(e.target.value) : undefined
                onChange.birthYear(year)
                // Auto-suggest life expectancy based on current age and gender
                if (year) {
                  const currentAge = calculateCurrentAge(year)
                  const suggestedLifespan = getDefaultLifeExpectancy(currentAge, gender)
                  if (!expectedLifespan) {
                    onChange.expectedLifespan(suggestedLifespan)
                  }
                }
              }}
              placeholder="1974"
              min={1930}
              max={new Date().getFullYear() - 18}
              className="w-40"
            />
            {birthYear && (
              <div className="text-sm text-muted-foreground">
                Aktuelles Alter:
                {' '}
                {calculateCurrentAge(birthYear)}
                {' '}
                Jahre
                {gender && (
                  <span className="ml-2">
                    (
                    {gender === 'male' ? '♂ Männlich' : '♀ Weiblich'}
                    )
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Geburtsjahr Konfiguration</Label>
      <div className="p-3 border rounded-lg bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birth-year-person1-main" className="text-sm font-medium">
              Person 1 Geburtsjahr (
              {gender === 'male' ? '♂ Männlich' : '♀ Weiblich'}
              )
            </Label>
            <Input
              id="birth-year-person1-main"
              type="number"
              value={birthYear || ''}
              onChange={(e) => {
                const year = e.target.value ? Number(e.target.value) : undefined
                onChange.birthYear(year)
              }}
              placeholder="1974"
              min={1930}
              max={new Date().getFullYear() - 18}
              className="w-40"
            />
            {birthYear && (
              <div className="text-sm text-muted-foreground">
                Alter:
                {' '}
                {calculateCurrentAge(birthYear)}
                {' '}
                Jahre
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth-year-person2-main" className="text-sm font-medium">
              Person 2 Geburtsjahr (
              {spouse?.gender === 'male' ? '♂ Männlich' : '♀ Weiblich'}
              )
            </Label>
            <Input
              id="birth-year-person2-main"
              type="number"
              value={spouse?.birthYear || ''}
              onChange={(e) => {
                const year = e.target.value ? Number(e.target.value) : undefined
                onChange.spouse({
                  ...spouse,
                  gender: spouse?.gender || 'female',
                  birthYear: year,
                })
              }}
              placeholder="1976"
              min={1930}
              max={new Date().getFullYear() - 18}
              className="w-40"
            />
            {spouse?.birthYear && (
              <div className="text-sm text-muted-foreground">
                Alter:
                {' '}
                {calculateCurrentAge(spouse.birthYear)}
                {' '}
                Jahre
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
