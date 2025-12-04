import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { RadioTile, RadioTileGroup } from './ui/radio-tile'
import { Info } from 'lucide-react'
import { useNestingLevel } from '../lib/nesting-utils'
import { useFormId } from '../utils/unique-id'
import {
  createDefaultEMRenteConfig,
  estimatePensionPointsFromMonthlyPension,
  type EMRenteConfig,
} from '../../helpers/em-rente'

interface EMRenteConfigurationProps {
  config: EMRenteConfig | null
  onChange: (config: EMRenteConfig | null) => void
  currentYear?: number
  birthYear?: number
}

export function EMRenteConfiguration({
  config,
  onChange,
  currentYear = new Date().getFullYear(),
  birthYear,
}: EMRenteConfigurationProps) {
  const nestingLevel = useNestingLevel()

  // Generate unique IDs
  const enabledSwitchId = useFormId('em-rente', 'enabled')
  const disabilityStartYearId = useFormId('em-rente', 'disability-start-year')
  const birthYearId = useFormId('em-rente', 'birth-year')
  const pensionPointsId = useFormId('em-rente', 'pension-points')
  const contributionYearsId = useFormId('em-rente', 'contribution-years')
  const annualIncreaseRateId = useFormId('em-rente', 'annual-increase-rate')
  const zurechnungszeitenSwitchId = useFormId('em-rente', 'zurechnungszeiten')
  const abschlaegeSwitchId = useFormId('em-rente', 'abschlaege')
  const taxablePercentageId = useFormId('em-rente', 'taxable-percentage')
  const monthlyAdditionalIncomeId = useFormId('em-rente', 'monthly-additional-income')
  const estimateMonthlyPensionId = useFormId('em-rente', 'estimate-monthly-pension')

  // Initialize config if it doesn't exist
  const currentConfig = config || createDefaultEMRenteConfig()

  const handleToggleEnabled = (enabled: boolean) => {
    if (enabled) {
      const newConfig = createDefaultEMRenteConfig()
      newConfig.enabled = true
      if (birthYear) {
        newConfig.birthYear = birthYear
      }
      newConfig.disabilityStartYear = currentYear
      onChange(newConfig)
    } else {
      onChange(null)
    }
  }

  const handleUpdate = (updates: Partial<EMRenteConfig>) => {
    onChange({ ...currentConfig, ...updates })
  }

  const handleEstimateFromMonthlyPension = (monthlyPension: number) => {
    if (monthlyPension > 0) {
      const estimatedPoints = estimatePensionPointsFromMonthlyPension(
        monthlyPension,
        currentConfig.region,
        currentConfig.type,
        currentConfig.customPensionValue
      )
      handleUpdate({ accumulatedPensionPoints: Math.round(estimatedPoints * 100) / 100 })
    }
  }

  if (!config?.enabled) {
    return (
      <Card nestingLevel={nestingLevel}>
        <CardHeader nestingLevel={nestingLevel} className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              EM-Rente (Erwerbsminderungsrente)
            </span>
            <Switch checked={false} onCheckedChange={handleToggleEnabled} id={enabledSwitchId} />
          </CardTitle>
        </CardHeader>
        <CardContent nestingLevel={nestingLevel}>
          <p className="text-sm text-muted-foreground">
            Aktivieren Sie die EM-Rente-Berechnung, um die gesetzliche Erwerbsminderungsrente in Ihre Planung
            einzubeziehen.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card nestingLevel={nestingLevel}>
      <CardHeader nestingLevel={nestingLevel} className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            EM-Rente (Erwerbsminderungsrente)
          </span>
          <Switch checked={true} onCheckedChange={handleToggleEnabled} id={enabledSwitchId} />
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel}>
        <div className="space-y-6">
          {/* Info Card */}
          <Card nestingLevel={nestingLevel + 1}>
            <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent nestingLevel={nestingLevel + 1}>
              <div className="text-sm space-y-2">
                <p>
                  Die <strong>Erwerbsminderungsrente (EM-Rente)</strong> ist eine gesetzliche Rente bei dauerhafter
                  Erwerbsminderung:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>Volle EM-Rente:</strong> Weniger als 3 Stunden täglich arbeitsfähig
                  </li>
                  <li>
                    <strong>Teilweise EM-Rente:</strong> 3-6 Stunden täglich arbeitsfähig (50% der vollen EM-Rente)
                  </li>
                  <li>
                    <strong>Zurechnungszeiten:</strong> Fiktive Beitragszeiten bis zum 67. Lebensjahr
                  </li>
                  <li>
                    <strong>Abschläge:</strong> 0,3% pro Monat vor Regelaltersgrenze (max. 10,8%)
                  </li>
                  <li>
                    <strong>Hinzuverdienstgrenzen:</strong> Zulässige Nebeneinkünfte werden automatisch berücksichtigt
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Main Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pension Type */}
            <div className="space-y-2">
              <Label>Rentenart</Label>
              <RadioTileGroup value={currentConfig.type} onValueChange={(value: string) => handleUpdate({ type: value as 'volle' | 'teilweise' })}>
                <RadioTile value="volle" label="Volle EM-Rente">
                  Weniger als 3 Stunden täglich arbeitsfähig
                </RadioTile>
                <RadioTile value="teilweise" label="Teilweise EM-Rente">
                  3-6 Stunden täglich arbeitsfähig (50% der vollen Rente)
                </RadioTile>
              </RadioTileGroup>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <Label>Region</Label>
              <RadioTileGroup value={currentConfig.region} onValueChange={(value: string) => handleUpdate({ region: value as 'west' | 'east' })}>
                <RadioTile value="west" label="West">
                  Westdeutschland
                </RadioTile>
                <RadioTile value="east" label="Ost">
                  Ostdeutschland (seit 2024 gleicher Rentenwert)
                </RadioTile>
              </RadioTileGroup>
            </div>

            {/* Disability Start Year */}
            <div className="space-y-2">
              <Label htmlFor={disabilityStartYearId}>Beginn der Erwerbsminderung (Jahr)</Label>
              <Input
                id={disabilityStartYearId}
                type="number"
                value={currentConfig.disabilityStartYear}
                onChange={e => handleUpdate({ disabilityStartYear: parseInt(e.target.value) || currentYear })}
                min={currentYear}
                max={2100}
              />
            </div>

            {/* Birth Year */}
            <div className="space-y-2">
              <Label htmlFor={birthYearId}>Geburtsjahr</Label>
              <Input
                id={birthYearId}
                type="number"
                value={currentConfig.birthYear}
                onChange={e => handleUpdate({ birthYear: parseInt(e.target.value) || 1980 })}
                min={1940}
                max={currentYear - 18}
              />
            </div>

            {/* Pension Points */}
            <div className="space-y-2">
              <Label htmlFor={pensionPointsId}>Rentenpunkte (Entgeltpunkte)</Label>
              <Input
                id={pensionPointsId}
                type="number"
                step="0.1"
                value={currentConfig.accumulatedPensionPoints}
                onChange={e => handleUpdate({ accumulatedPensionPoints: parseFloat(e.target.value) || 0 })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Erworbene Rentenpunkte zum Zeitpunkt der Erwerbsminderung
              </p>
            </div>

            {/* Contribution Years */}
            <div className="space-y-2">
              <Label htmlFor={contributionYearsId}>Beitragsjahre</Label>
              <Input
                id={contributionYearsId}
                type="number"
                value={currentConfig.contributionYears}
                onChange={e => handleUpdate({ contributionYears: parseInt(e.target.value) || 0 })}
                min={0}
                max={50}
              />
            </div>
          </div>

          {/* Estimate from Monthly Pension */}
          <Card nestingLevel={nestingLevel + 1}>
            <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
              <CardTitle className="text-sm">Rentenpunkte schätzen</CardTitle>
            </CardHeader>
            <CardContent nestingLevel={nestingLevel + 1}>
              <div className="space-y-2">
                <Label htmlFor={estimateMonthlyPensionId}>Bekannte monatliche Rente (€)</Label>
                <div className="flex gap-2">
                  <Input
                    id={estimateMonthlyPensionId}
                    type="number"
                    step="10"
                    placeholder="z.B. 1500"
                    onBlur={e => {
                      const value = parseFloat(e.target.value)
                      if (value > 0) {
                        handleEstimateFromMonthlyPension(value)
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Geben Sie eine bekannte Rentenhöhe ein, um die Rentenpunkte automatisch zu schätzen
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Annual Increase Rate */}
            <div className="space-y-2">
              <Label htmlFor={annualIncreaseRateId}>Jährliche Rentenanpassung (%)</Label>
              <Input
                id={annualIncreaseRateId}
                type="number"
                step="0.1"
                value={currentConfig.annualIncreaseRate}
                onChange={e => handleUpdate({ annualIncreaseRate: parseFloat(e.target.value) || 1.0 })}
                min={0}
                max={10}
              />
            </div>

            {/* Taxable Percentage */}
            <div className="space-y-2">
              <Label htmlFor={taxablePercentageId}>Steuerpflichtiger Anteil (%)</Label>
              <Input
                id={taxablePercentageId}
                type="number"
                value={currentConfig.taxablePercentage}
                onChange={e => handleUpdate({ taxablePercentage: parseFloat(e.target.value) || 80 })}
                min={0}
                max={100}
              />
            </div>

            {/* Monthly Additional Income */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={monthlyAdditionalIncomeId}>Monatlicher Hinzuverdienst (€)</Label>
              <Input
                id={monthlyAdditionalIncomeId}
                type="number"
                value={currentConfig.monthlyAdditionalIncome || 0}
                onChange={e => handleUpdate({ monthlyAdditionalIncome: parseFloat(e.target.value) || 0 })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Zusätzliches Einkommen neben der EM-Rente (Hinzuverdienstgrenzen werden automatisch berücksichtigt)
              </p>
            </div>
          </div>

          {/* Zurechnungszeiten and Abschläge Switches */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentConfig.applyZurechnungszeiten}
                onCheckedChange={checked => handleUpdate({ applyZurechnungszeiten: checked })}
                id={zurechnungszeitenSwitchId}
              />
              <Label htmlFor={zurechnungszeitenSwitchId} className="cursor-pointer">
                Zurechnungszeiten berücksichtigen (bis 67. Lebensjahr)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={currentConfig.applyAbschlaege}
                onCheckedChange={checked => handleUpdate({ applyAbschlaege: checked })}
                id={abschlaegeSwitchId}
              />
              <Label htmlFor={abschlaegeSwitchId} className="cursor-pointer">
                Abschläge anwenden (0,3% pro Monat, max. 10,8%)
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
