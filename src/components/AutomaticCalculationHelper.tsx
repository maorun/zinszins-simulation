import { Label } from './ui/label'
import { Input } from './ui/input'
import { calculateCurrentAge } from '../../helpers/life-expectancy'
import { calculateJointLifeExpectancy } from '../../helpers/rmd-tables'

interface AutomaticCalculationHelperProps {
  config: {
    planningMode: 'individual' | 'couple'
    birthYear: number | undefined
    expectedLifespan: number | undefined
    gender: 'male' | 'female' | undefined
    spouse: { gender: 'male' | 'female', birthYear?: number } | undefined
  }
  onChange: {
    expectedLifespan: (lifespan: number | undefined) => void
  }
}

export function AutomaticCalculationHelper({
  config,
  onChange,
}: AutomaticCalculationHelperProps) {
  const { planningMode, birthYear, expectedLifespan, gender, spouse } = config
  return (
    <div className="p-3 bg-blue-50 rounded-lg space-y-3">
      <div className="text-sm font-medium text-blue-900">Lebensende automatisch berechnen</div>

      {planningMode === 'individual' ? (
        // Individual Planning Mode
        <>
          <div className="space-y-2">
            <Label htmlFor="expected-lifespan" className="text-sm">Lebenserwartung (Alter)</Label>
            <Input
              id="expected-lifespan"
              type="number"
              value={expectedLifespan || 85}
              onChange={e => onChange.expectedLifespan(Number(e.target.value))}
              min={50}
              max={120}
              className="w-32"
            />
          </div>
          {birthYear && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                Aktuelles Alter:
                {' '}
                {calculateCurrentAge(birthYear)}
                {' '}
                Jahre
              </div>
              {gender && (
                <div>
                  Geschlechts-spezifische Lebenserwartung:
                  {gender === 'male' ? ' ♂ Männlich (ca. 78 Jahre)' : ' ♀ Weiblich (ca. 83 Jahre)'}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // Couple Planning Mode
        <>
          {birthYear && spouse?.birthYear && gender && spouse?.gender && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                Gemeinsame Lebenserwartung:
                {' '}
                {Math.round(calculateJointLifeExpectancy(
                  calculateCurrentAge(birthYear),
                  calculateCurrentAge(spouse.birthYear),
                  gender,
                  spouse.gender,
                ))}
                {' '}
                Jahre (längerer überlebender Partner)
              </div>
              <div>
                Dies entspricht der Wahrscheinlichkeit, dass mindestens eine Person noch am
                Leben ist.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
