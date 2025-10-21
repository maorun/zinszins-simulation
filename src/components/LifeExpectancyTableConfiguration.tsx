import { Label } from './ui/label'
import { Input } from './ui/input'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'

interface LifeExpectancyTableConfigurationProps {
  config: {
    planningMode: 'individual' | 'couple'
    gender: 'male' | 'female' | undefined
    spouse: { gender: 'male' | 'female', birthYear?: number } | undefined
    lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
    customLifeExpectancy: number | undefined
  }
  onChange: {
    lifeExpectancyTable: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
    customLifeExpectancy: (value: number | undefined) => void
  }
}

function hasCompleteGenderInfo(
  planningMode: 'individual' | 'couple',
  gender: 'male' | 'female' | undefined,
  spouse: { gender: 'male' | 'female', birthYear?: number } | undefined,
): boolean {
  return (planningMode === 'individual' && !!gender)
    || (planningMode === 'couple' && !!gender && !!spouse?.gender)
}

function getGenderInfoMessage(
  planningMode: 'individual' | 'couple',
  gender: 'male' | 'female' | undefined,
  spouse: { gender: 'male' | 'female', birthYear?: number } | undefined,
): string {
  if (planningMode === 'couple') {
    const person1Gender = gender === 'male' ? 'Männlich' : 'Weiblich'
    const person2Gender = spouse?.gender === 'male' ? 'Männlich' : 'Weiblich'
    return `Basierend auf den gewählten Geschlechtern (${person1Gender} und ${person2Gender}) werden automatisch die entsprechenden deutschen Sterbetafeln (2020-2022) verwendet.`
  }
  const genderLabel = gender === 'male' ? 'Männlich' : 'Weiblich'
  return `Basierend auf dem gewählten Geschlecht (${genderLabel}) wird automatisch die entsprechende deutsche Sterbetafel (2020-2022) verwendet.`
}

function createTableChangeHandler(
  planningMode: 'individual' | 'couple',
  gender: 'male' | 'female' | undefined,
  onChange: LifeExpectancyTableConfigurationProps['onChange'],
) {
  return (value: string) => {
    if (value === 'custom') {
      onChange.lifeExpectancyTable('custom')
    }
    else {
      // Auto-select based on context
      if (planningMode === 'couple') {
        onChange.lifeExpectancyTable('german_2020_22')
      }
      else {
        onChange.lifeExpectancyTable(gender === 'male' ? 'german_male_2020_22' : 'german_female_2020_22')
      }
    }
  }
}

export function LifeExpectancyTableConfiguration({
  config,
  onChange,
}: LifeExpectancyTableConfigurationProps) {
  const { planningMode, gender, spouse, lifeExpectancyTable, customLifeExpectancy } = config
  const hasGenderInfo = hasCompleteGenderInfo(planningMode, gender, spouse)

  const handleTableChange = createTableChangeHandler(planningMode, gender, onChange)
  const infoMessage = getGenderInfoMessage(planningMode, gender, spouse)

  return (
    <div className="space-y-2">
      <Label>Datengrundlage für Lebenserwartung</Label>
      {hasGenderInfo ? (
        // Smart mode: Gender is specified
        <>
          <RadioTileGroup
            value={lifeExpectancyTable === 'custom' ? 'custom' : 'auto'}
            onValueChange={handleTableChange}
          >
            <RadioTile value="auto" label="Automatische Auswahl">
              {planningMode === 'couple'
                ? 'Geschlechtsspezifische Sterbetafeln für beide Partner'
                : `Deutsche Sterbetafel für ${gender === 'male' ? 'Männer' : 'Frauen'}`}
            </RadioTile>
            <RadioTile value="custom" label="Benutzerdefiniert">
              Eigene Lebenserwartung eingeben
            </RadioTile>
          </RadioTileGroup>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800 font-medium">
              ℹ️ Automatische Sterbetafel-Auswahl
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {infoMessage}
            </div>
          </div>
        </>
      ) : (
        // Manual mode: No gender specified
        <RadioTileGroup
          value={lifeExpectancyTable}
          onValueChange={(value: string) => onChange.lifeExpectancyTable(value as 'german_2020_22' | 'custom')}
        >
          <RadioTile value="german_2020_22" label="Deutsche Sterbetafel (Durchschnitt)">
            Offizielle Sterbetafel 2020-2022 vom Statistischen Bundesamt (geschlechtsneutral)
          </RadioTile>
          <RadioTile value="custom" label="Benutzerdefiniert">
            Eigene Lebenserwartung eingeben
          </RadioTile>
        </RadioTileGroup>
      )}

      {lifeExpectancyTable === 'custom' && (
        <div className="space-y-2 mt-2">
          <Label>Lebenserwartung (Jahre)</Label>
          <Input
            type="number"
            value={customLifeExpectancy || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined
              onChange.customLifeExpectancy(value)
            }}
            min={1}
            max={50}
          />
        </div>
      )}
    </div>
  )
}
