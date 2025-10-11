import { Label } from './ui/label'
import { Input } from './ui/input'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'

interface LifeExpectancyTableConfigurationProps {
  planningMode: 'individual' | 'couple'
  gender: 'male' | 'female' | undefined
  spouse: { gender: 'male' | 'female', birthYear?: number } | undefined
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  setLifeExpectancyTable: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
  customLifeExpectancy: number | undefined
  setCustomLifeExpectancy: (value: number | undefined) => void
}

export function LifeExpectancyTableConfiguration({
  planningMode,
  gender,
  spouse,
  lifeExpectancyTable,
  setLifeExpectancyTable,
  customLifeExpectancy,
  setCustomLifeExpectancy,
}: LifeExpectancyTableConfigurationProps) {
  const hasGenderInfo = (planningMode === 'individual' && gender)
    || (planningMode === 'couple' && gender && spouse?.gender)

  const handleTableChange = (value: string) => {
    if (value === 'custom') {
      setLifeExpectancyTable('custom')
    }
    else {
      // Auto-select based on context
      if (planningMode === 'couple') {
        setLifeExpectancyTable('german_2020_22')
      }
      else {
        setLifeExpectancyTable(gender === 'male' ? 'german_male_2020_22' : 'german_female_2020_22')
      }
    }
  }

  const getInfoMessage = () => {
    if (planningMode === 'couple') {
      return `Basierend auf den gewählten Geschlechtern (${gender === 'male' ? 'Männlich' : 'Weiblich'} und ${spouse?.gender === 'male' ? 'Männlich' : 'Weiblich'}) werden automatisch die entsprechenden deutschen Sterbetafeln (2020-2022) verwendet.`
    }
    return `Basierend auf dem gewählten Geschlecht (${gender === 'male' ? 'Männlich' : 'Weiblich'}) wird automatisch die entsprechende deutsche Sterbetafel (2020-2022) verwendet.`
  }

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
              {getInfoMessage()}
            </div>
          </div>
        </>
      ) : (
        // Manual mode: No gender specified
        <RadioTileGroup
          value={lifeExpectancyTable}
          onValueChange={(value: string) => setLifeExpectancyTable(value as 'german_2020_22' | 'custom')}
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
              setCustomLifeExpectancy(value)
            }}
            min={1}
            max={50}
          />
        </div>
      )}
    </div>
  )
}
