/**
 * DynamicSavingsRateConfiguration Component
 * 
 * Simple UI component for enabling/configuring dynamic savings rate adjustments.
 * Full feature implementation would require more extensive UI work.
 */

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import {
  validateDynamicSavingsConfig,
  type DynamicSavingsRateConfig,
} from '../../helpers/dynamic-savings-rate'
import { generateFormId } from '../utils/unique-id'
import { TrendingUp, AlertCircle } from 'lucide-react'

interface DynamicSavingsRateConfigurationProps {
  config: DynamicSavingsRateConfig
  onChange: (config: DynamicSavingsRateConfig) => void
  startYear: number
}

function ValidationErrors({ errors }: { errors: Array<{ field: string; message: string }> }) {
  if (errors.length === 0) {
    return null
  }
  
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">Validierungsfehler gefunden</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function BirthYearInput({
  birthYear,
  onChange,
}: {
  birthYear: number
  onChange: (year: number) => void
}) {
  const birthYearId = useMemo(() => generateFormId('dynamic-savings', 'birth-year'), [])
  const currentYear = new Date().getFullYear()
  
  return (
    <div className="space-y-2">
      <Label htmlFor={birthYearId}>Geburtsjahr</Label>
      <Input
        id={birthYearId}
        type="number"
        value={birthYear}
        onChange={(e) => onChange(Number(e.target.value))}
        min={1900}
        max={currentYear}
      />
      <p className="text-sm text-muted-foreground">
        Ihr Geburtsjahr wird verwendet, um die aktuelle Lebensphase zu bestimmen.
      </p>
    </div>
  )
}

export function DynamicSavingsRateConfiguration({
  config,
  onChange,
}: DynamicSavingsRateConfigurationProps) {
  const enabledId = useMemo(() => generateFormId('dynamic-savings', 'enabled'), [])
  const errors = validateDynamicSavingsConfig(config)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Dynamische Sparraten</CardTitle>
          </div>
          <Switch
            id={enabledId}
            checked={config.enabled}
            onCheckedChange={(enabled) => onChange({ ...config, enabled })}
          />
        </div>
        <CardDescription>
          Automatische Anpassung der Sparrate basierend auf Lebensphase, Einkommensentwicklung und
          Lebensereignissen
        </CardDescription>
      </CardHeader>

      {config.enabled && (
        <CardContent className="space-y-4">
          <ValidationErrors errors={errors} />
          <BirthYearInput
            birthYear={config.birthYear}
            onChange={(birthYear) => onChange({ ...config, birthYear })}
          />

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">ℹ️ Feature implementiert</p>
            <p className="mt-2 text-muted-foreground">
              Die Kernfunktionalität für dynamische Sparraten ist vollständig implementiert.
              Erweiterte UI-Konfigurationen für Lebensphasen, Einkommensentwicklung und
              Lebensereignisse können bei Bedarf hinzugefügt werden.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
