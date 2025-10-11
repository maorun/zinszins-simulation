import { Label } from './ui/label'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'

interface GenderConfigurationProps {
  planningMode: 'individual' | 'couple'
  gender: 'male' | 'female' | undefined
  setGender: (gender?: 'male' | 'female') => void
  spouse: { gender: 'male' | 'female', birthYear?: number } | undefined
  setSpouse: (spouse?: { gender: 'male' | 'female', birthYear?: number }) => void
}

export function GenderConfiguration({
  planningMode,
  gender,
  setGender,
  spouse,
  setSpouse,
}: GenderConfigurationProps) {
  if (planningMode === 'individual') {
    return (
      <div className="space-y-2">
        <Label>Geschlecht für Lebenserwartung</Label>
        <RadioTileGroup
          value={gender || ''}
          onValueChange={(value: string) => setGender(value as 'male' | 'female' | undefined)}
        >
          <RadioTile value="male" label="Männlich">
            Verwende Lebenserwartung für Männer
          </RadioTile>
          <RadioTile value="female" label="Weiblich">
            Verwende Lebenserwartung für Frauen
          </RadioTile>
        </RadioTileGroup>
        {gender && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800 font-medium">
              ℹ️ Automatische Sterbetafel-Auswahl
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {gender === 'male'
                ? 'Es wird automatisch die deutsche Sterbetafel für Männer (2020-2022) verwendet. Die männliche Lebenserwartung liegt im Durchschnitt ca. 5 Jahre unter der weiblichen.'
                : 'Es wird automatisch die deutsche Sterbetafel für Frauen (2020-2022) verwendet. Die weibliche Lebenserwartung liegt im Durchschnitt ca. 5 Jahre über der männlichen.'}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="text-sm font-medium text-blue-900">Konfiguration für Ehepaar/Partner</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Person 1 - Geschlecht</Label>
          <RadioTileGroup
            value={gender || 'male'}
            onValueChange={(value: string) => setGender(value as 'male' | 'female')}
            idPrefix="person1"
          >
            <RadioTile value="male" label="Männlich">
              Verwende Lebenserwartung für Männer
            </RadioTile>
            <RadioTile value="female" label="Weiblich">
              Verwende Lebenserwartung für Frauen
            </RadioTile>
          </RadioTileGroup>
        </div>
        <div className="space-y-2">
          <Label>Person 2 - Geschlecht</Label>
          <RadioTileGroup
            value={spouse?.gender || 'female'}
            onValueChange={(value: string) => setSpouse({
              ...spouse,
              gender: value as 'male' | 'female',
            })}
            idPrefix="person2"
          >
            <RadioTile value="male" label="Männlich">
              Männlich
            </RadioTile>
            <RadioTile value="female" label="Weiblich">
              Weiblich
            </RadioTile>
          </RadioTileGroup>
        </div>
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800 font-medium">
          ℹ️ Automatische Sterbetafel-Auswahl für Paare
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Es werden automatisch geschlechtsspezifische deutsche Sterbetafeln (2020-2022) für
          beide Partner verwendet.
          Die gemeinsame Lebenserwartung wird nach aktuariellen Methoden als "Joint Life
          Expectancy" berechnet.
        </div>
      </div>
    </div>
  )
}
