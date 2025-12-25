import { useMemo } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type {
  OtherIncomeSource,
  RisikolebensversicherungConfig,
} from '../../../helpers/other-income'
import { generateFormId } from '../../utils/unique-id'

interface RisikolebensversicherungConfigSectionProps {
  editingSource: OtherIncomeSource
  currentYear: number
  onUpdate: (source: OtherIncomeSource) => void
}

// Helper to update config
function createConfigUpdater(
  editingSource: OtherIncomeSource,
  onUpdate: (source: OtherIncomeSource) => void,
) {
  return (updates: Partial<RisikolebensversicherungConfig>) => {
    onUpdate({
      ...editingSource,
      risikolebensversicherungConfig: {
        ...editingSource.risikolebensversicherungConfig!,
        ...updates,
      },
    })
  }
}

interface CoverageAmountFieldProps {
  coverageAmount: number
  onChange: (amount: number) => void
}

function CoverageAmountField({ coverageAmount, onChange }: CoverageAmountFieldProps) {
  const id = useMemo(() => generateFormId('rlv', 'coverage-amount'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Versicherungssumme (€)</Label>
      <Input
        id={id}
        type="number"
        value={coverageAmount}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        min={0}
        step={10000}
      />
      <p className="text-xs text-gray-600">
        Todesfallleistung für Hinterbliebene (steuerfrei)
      </p>
    </div>
  )
}

interface CoverageTypeFieldProps {
  coverageType: 'level' | 'decreasing'
  onChange: (type: 'level' | 'decreasing') => void
}

function CoverageTypeField({ coverageType, onChange }: CoverageTypeFieldProps) {
  const id = useMemo(() => generateFormId('rlv', 'coverage-type'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Deckungsart</Label>
      <select
        id={id}
        value={coverageType}
        onChange={(e) => onChange(e.target.value as 'level' | 'decreasing')}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="level">Konstante Deckung</option>
        <option value="decreasing">Fallende Deckung</option>
      </select>
      <p className="text-xs text-gray-600">
        {coverageType === 'level'
          ? 'Versicherungssumme bleibt konstant'
          : 'Versicherungssumme sinkt jährlich (günstiger)'}
      </p>
    </div>
  )
}

interface DecreaseRateFieldProps {
  annualDecreasePercent: number
  onChange: (percent: number) => void
  isVisible: boolean
}

function DecreaseRateField({
  annualDecreasePercent,
  onChange,
  isVisible,
}: DecreaseRateFieldProps) {
  const id = useMemo(() => generateFormId('rlv', 'decrease-rate'), [])

  if (!isVisible) return null

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Jährliche Reduktion (%)</Label>
      <Input
        id={id}
        type="number"
        value={annualDecreasePercent}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        min={0}
        max={20}
        step={0.5}
      />
      <p className="text-xs text-gray-600">
        Prozentsatz der jährlichen Verringerung der Versicherungssumme
      </p>
    </div>
  )
}

interface BirthYearFieldProps {
  birthYear: number
  onChange: (year: number) => void
}

function BirthYearField({ birthYear, onChange }: BirthYearFieldProps) {
  const id = useMemo(() => generateFormId('rlv', 'birth-year'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Geburtsjahr des Versicherten</Label>
      <Input
        id={id}
        type="number"
        value={birthYear}
        onChange={(e) => onChange(Number(e.target.value) || new Date().getFullYear() - 35)}
        min={1920}
        max={new Date().getFullYear()}
        step={1}
      />
      <p className="text-xs text-gray-600">Benötigt für altersabhängige Prämienberechnung</p>
    </div>
  )
}

interface GenderFieldProps {
  gender: 'male' | 'female'
  onChange: (gender: 'male' | 'female') => void
}

function GenderField({ gender, onChange }: GenderFieldProps) {
  const id = useMemo(() => generateFormId('rlv', 'gender'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Geschlecht</Label>
      <select
        id={id}
        value={gender}
        onChange={(e) => onChange(e.target.value as 'male' | 'female')}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="male">Männlich</option>
        <option value="female">Weiblich</option>
      </select>
      <p className="text-xs text-gray-600">
        {gender === 'female' ? 'Günstigere Prämien (höhere Lebenserwartung)' : 'Standard-Prämien'}
      </p>
    </div>
  )
}

interface HealthStatusFieldProps {
  healthStatus: 'excellent' | 'good' | 'average' | 'fair' | 'poor'
  onChange: (status: 'excellent' | 'good' | 'average' | 'fair' | 'poor') => void
}

function HealthStatusField({ healthStatus, onChange }: HealthStatusFieldProps) {
  const id = useMemo(() => generateFormId('rlv', 'health-status'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Gesundheitszustand</Label>
      <select
        id={id}
        value={healthStatus}
        onChange={(e) =>
          onChange(e.target.value as 'excellent' | 'good' | 'average' | 'fair' | 'poor')
        }
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="excellent">Ausgezeichnet (-15%)</option>
        <option value="good">Gut (Standard)</option>
        <option value="average">Durchschnittlich (+15%)</option>
        <option value="fair">Mäßig (+35%)</option>
        <option value="poor">Schlecht (+70%)</option>
      </select>
      <p className="text-xs text-gray-600">
        Gesundheitszustand beeinflusst die Prämie erheblich
      </p>
    </div>
  )
}

interface SmokingStatusFieldProps {
  smokingStatus: 'non-smoker' | 'smoker' | 'former-smoker'
  onChange: (status: 'non-smoker' | 'smoker' | 'former-smoker') => void
}

function SmokingStatusField({ smokingStatus, onChange }: SmokingStatusFieldProps) {
  const id = useMemo(() => generateFormId('rlv', 'smoking-status'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Raucherstatus</Label>
      <select
        id={id}
        value={smokingStatus}
        onChange={(e) => onChange(e.target.value as 'non-smoker' | 'smoker' | 'former-smoker')}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="non-smoker">Nichtraucher (Standard)</option>
        <option value="former-smoker">Ehemaliger Raucher (+25%)</option>
        <option value="smoker">Raucher (+80%)</option>
      </select>
      <p className="text-xs text-gray-600">
        {smokingStatus === 'smoker'
          ? 'Deutlich höhere Prämien wegen erhöhtem Risiko'
          : smokingStatus === 'former-smoker'
            ? 'Moderat höhere Prämien'
            : 'Günstigste Prämien'}
      </p>
    </div>
  )
}

function RisikolebensversicherungInfoBox({
  config,
  currentYear,
}: {
  config: RisikolebensversicherungConfig
  currentYear: number
}) {
  const age = currentYear - config.birthYear

  return (
    <div className="p-3 bg-blue-50 rounded border border-blue-200">
      <p className="text-xs text-blue-800 mb-2">
        <strong>ℹ️ Risikolebensversicherung-Details:</strong>
      </p>
      <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
        <li>Aktuelles Alter: {age} Jahre</li>
        <li>
          Deckungsart: {config.coverageType === 'level' ? 'Konstante Deckung' : 'Fallende Deckung'}
        </li>
        {config.coverageType === 'decreasing' && (
          <li>Jährliche Reduktion: {config.annualDecreasePercent}%</li>
        )}
        <li>
          Versicherungssumme: {config.coverageAmount.toLocaleString('de-DE')} € (steuerfrei bei Tod)
        </li>
        <li>Gesundheit: {getHealthStatusLabel(config.healthStatus)}</li>
        <li>Raucherstatus: {getSmokingStatusLabel(config.smokingStatus)}</li>
        <li className="font-semibold">
          💡 Reine Risikoabsicherung - keine Kapitalbildung, daher günstiger als
          Kapitallebensversicherung
        </li>
      </ul>
    </div>
  )
}

function getHealthStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    excellent: 'Ausgezeichnet',
    good: 'Gut',
    average: 'Durchschnittlich',
    fair: 'Mäßig',
    poor: 'Schlecht',
  }
  return labels[status] || status
}

function getSmokingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'non-smoker': 'Nichtraucher',
    'former-smoker': 'Ehemaliger Raucher',
    smoker: 'Raucher',
  }
  return labels[status] || status
}

export function RisikolebensversicherungConfigSection({
  editingSource,
  currentYear,
  onUpdate,
}: RisikolebensversicherungConfigSectionProps) {
  if (!editingSource.risikolebensversicherungConfig) {
    return null
  }

  const config = editingSource.risikolebensversicherungConfig
  const updateConfig = createConfigUpdater(editingSource, onUpdate)

  return (
    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
        🛡️ Risikolebensversicherung-spezifische Einstellungen
      </h4>

      <CoverageAmountField
        coverageAmount={config.coverageAmount}
        onChange={(amount) => updateConfig({ coverageAmount: amount })}
      />

      <CoverageTypeField
        coverageType={config.coverageType}
        onChange={(type) => updateConfig({ coverageType: type })}
      />

      <DecreaseRateField
        annualDecreasePercent={config.annualDecreasePercent}
        onChange={(percent) => updateConfig({ annualDecreasePercent: percent })}
        isVisible={config.coverageType === 'decreasing'}
      />

      <BirthYearField
        birthYear={config.birthYear}
        onChange={(year) => updateConfig({ birthYear: year })}
      />

      <GenderField gender={config.gender} onChange={(gender) => updateConfig({ gender })} />

      <HealthStatusField
        healthStatus={config.healthStatus}
        onChange={(status) => updateConfig({ healthStatus: status })}
      />

      <SmokingStatusField
        smokingStatus={config.smokingStatus}
        onChange={(status) => updateConfig({ smokingStatus: status })}
      />

      <RisikolebensversicherungInfoBox config={config} currentYear={currentYear} />
    </div>
  )
}
