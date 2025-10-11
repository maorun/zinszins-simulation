import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioTileGroup, RadioTile } from '../ui/radio-tile'
import {
  type CareCostConfiguration,
  type CareLevel,
  DEFAULT_CARE_LEVELS,
} from '../../../helpers/care-cost-simulation'

interface CoupleCareCostConfigProps {
  values: CareCostConfiguration
  onChange: (config: CareCostConfiguration) => void
  currentYear: number
  nestingLevel: number
}

export function CoupleCareCostConfig({
  values,
  onChange,
  currentYear,
  nestingLevel,
}: CoupleCareCostConfigProps) {
  return (
    <Card nestingLevel={nestingLevel + 1} className="bg-blue-50 border-blue-200">
      <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          👫 Paar-Konfiguration
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1} className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={values.coupleConfig?.person2NeedsCare || false}
            onCheckedChange={person2NeedsCare => onChange({
              ...values,
              coupleConfig: {
                ...values.coupleConfig,
                person2NeedsCare,
                person2StartYear: person2NeedsCare
                  ? (values.coupleConfig?.person2StartYear || values.startYear + 2)
                  : undefined,
                person2CareLevel: person2NeedsCare
                  ? (values.coupleConfig?.person2CareLevel || values.careLevel)
                  : undefined,
              },
            })}
            id="person2-needs-care"
          />
          <Label htmlFor="person2-needs-care" className="text-sm">
            Auch Person 2 wird pflegebedürftig
          </Label>
        </div>

        {values.coupleConfig?.person2NeedsCare && (
          <div className="space-y-4 ml-6">
            <div className="space-y-2">
              <Label htmlFor="person2-start-year">
                Startjahr für Person 2
              </Label>
              <Input
                id="person2-start-year"
                type="number"
                value={values.coupleConfig?.person2StartYear || ''}
                onChange={e => onChange({
                  ...values,
                  coupleConfig: {
                    ...values.coupleConfig,
                    person2NeedsCare: true,
                    person2StartYear: Number(e.target.value),
                  },
                })}
                min={currentYear}
                max={currentYear + 50}
                step={1}
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label>Pflegegrad für Person 2</Label>
              <RadioTileGroup
                value={(values.coupleConfig?.person2CareLevel || values.careLevel).toString()}
                onValueChange={value => onChange({
                  ...values,
                  coupleConfig: {
                    ...values.coupleConfig,
                    person2NeedsCare: true,
                    person2CareLevel: Number(value) as CareLevel,
                  },
                })}
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <RadioTile
                    key={level}
                    value={level.toString()}
                    label={`Pflegegrad ${level}`}
                  >
                    <div className="text-xs text-muted-foreground">
                      {DEFAULT_CARE_LEVELS[level as CareLevel].description}
                    </div>
                  </RadioTile>
                ))}
              </RadioTileGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="person2-duration">
                Pflegedauer für Person 2 (Jahre, 0 = bis Lebensende)
              </Label>
              <Input
                id="person2-duration"
                type="number"
                value={values.coupleConfig?.person2CareDurationYears || 0}
                onChange={e => onChange({
                  ...values,
                  coupleConfig: {
                    ...values.coupleConfig,
                    person2NeedsCare: true,
                    person2CareDurationYears: Number(e.target.value),
                  },
                })}
                min={0}
                max={50}
                step={1}
                className="w-32"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
