import { Label } from './ui/label'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'

interface RMDLifeExpectancyTableConfigProps {
  value: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  onChange: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
  isFormMode?: boolean
}

export function RMDLifeExpectancyTableConfig({
  value,
  onChange,
  isFormMode = false,
}: RMDLifeExpectancyTableConfigProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue as 'german_2020_22' | 'custom')
  }

  return (
    <div className="space-y-2">
      <Label>{isFormMode ? 'Datengrundlage für Lebenserwartung' : 'Sterbetabelle'}</Label>
      <RadioTileGroup
        value={value}
        onValueChange={handleChange}
      >
        <RadioTile value="german_2020_22" label={isFormMode ? 'Deutsche Sterbetafel' : 'Deutsche Sterbetabelle 2020/22'}>
          {isFormMode
            ? 'Offizielle Sterbetafel 2020-2022 vom Statistischen Bundesamt'
            : 'Offizielle deutsche Sterbetabelle (aktuarisch)'}
        </RadioTile>
        <RadioTile value="custom" label="Benutzerdefiniert">
          {isFormMode
            ? 'Eigene Lebenserwartung festlegen'
            : 'Eigene Lebenserwartung festlegen'}
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}
