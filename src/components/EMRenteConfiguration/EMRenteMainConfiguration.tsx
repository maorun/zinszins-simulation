import type { ChangeEvent } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'
import type { EMRenteConfig } from '../../../helpers/em-rente'

interface EMRenteMainConfigurationProps {
  config: EMRenteConfig
  onUpdate: (updates: Partial<EMRenteConfig>) => void
  currentYear: number
  disabilityStartYearId: string
  birthYearId: string
  pensionPointsId: string
  contributionYearsId: string
}

export function EMRenteMainConfiguration(props: EMRenteMainConfigurationProps) {
  const { config, onUpdate, currentYear, disabilityStartYearId, birthYearId, pensionPointsId, contributionYearsId } = props

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Rentenart</Label>
        <RadioTileGroup value={config.type} onValueChange={(value: string) => onUpdate({ type: value as 'volle' | 'teilweise' })}>
          <RadioTile value="volle" label="Volle EM-Rente">Weniger als 3 Stunden täglich arbeitsfähig</RadioTile>
          <RadioTile value="teilweise" label="Teilweise EM-Rente">3-6 Stunden täglich arbeitsfähig (50% der vollen Rente)</RadioTile>
        </RadioTileGroup>
      </div>
      <div className="space-y-2">
        <Label>Region</Label>
        <RadioTileGroup value={config.region} onValueChange={(value: string) => onUpdate({ region: value as 'west' | 'east' })}>
          <RadioTile value="west" label="West">Westdeutschland</RadioTile>
          <RadioTile value="east" label="Ost">Ostdeutschland (seit 2024 gleicher Rentenwert)</RadioTile>
        </RadioTileGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor={disabilityStartYearId}>Beginn der Erwerbsminderung (Jahr)</Label>
        <Input id={disabilityStartYearId} type="number" value={config.disabilityStartYear} onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ disabilityStartYear: Number(e.target.value) || currentYear })} min={currentYear} max={2100} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={birthYearId}>Geburtsjahr</Label>
        <Input id={birthYearId} type="number" value={config.birthYear} onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ birthYear: Number(e.target.value) || 1980 })} min={1940} max={currentYear - 18} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={pensionPointsId}>Rentenpunkte (Entgeltpunkte)</Label>
        <Input id={pensionPointsId} type="number" step="0.1" value={config.accumulatedPensionPoints} onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ accumulatedPensionPoints: Number(e.target.value) || 0 })} min={0} />
        <p className="text-xs text-muted-foreground">Erworbene Rentenpunkte zum Zeitpunkt der Erwerbsminderung</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={contributionYearsId}>Beitragsjahre</Label>
        <Input id={contributionYearsId} type="number" value={config.contributionYears} onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ contributionYears: Number(e.target.value) || 0 })} min={0} max={50} />
      </div>
    </div>
  )
}

