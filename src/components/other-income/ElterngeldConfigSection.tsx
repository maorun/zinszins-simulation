import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import type { OtherIncomeSource, ElterngeldConfig } from '../../../helpers/other-income'
import { useFormId } from '../../utils/unique-id'

interface ElterngeldConfigSectionProps {
  editingSource: OtherIncomeSource
  currentYear: number
  onUpdate: (source: OtherIncomeSource) => void
}

interface UpdateConfigFn {
  <K extends keyof ElterngeldConfig>(key: K, value: ElterngeldConfig[K]): void
}

function PreviousIncomeField({ config, updateConfig }: { config: ElterngeldConfig; updateConfig: UpdateConfigFn }) {
  const previousIncomeId = useFormId('elterngeld-config', 'previous-income')
  return (
    <div className="space-y-2">
      <Label htmlFor={previousIncomeId}>Vorheriges monatliches Nettoeinkommen</Label>
      <Input
        id={previousIncomeId}
        type="number"
        value={config.previousMonthlyNetIncome}
        onChange={e => updateConfig('previousMonthlyNetIncome', Number(e.target.value) || 0)}
        min={0}
        max={10000}
        step={100}
      />
      <p className="text-xs text-gray-600">
        Grundlage für Elterngeld-Berechnung (65-67% des Nettoeinkommens, min. 300€, max. 1.800€/Monat)
      </p>
    </div>
  )
}

function ChildBirthFields({
  config,
  currentYear,
  updateConfig,
}: {
  config: ElterngeldConfig
  currentYear: number
  updateConfig: UpdateConfigFn
}) {
  const childBirthYearId = useFormId('elterngeld-config', 'child-birth-year')
  const childBirthMonthId = useFormId('elterngeld-config', 'child-birth-month')

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={childBirthYearId}>Geburtsjahr</Label>
        <Input
          id={childBirthYearId}
          type="number"
          value={config.childBirthYear}
          onChange={e => updateConfig('childBirthYear', Number(e.target.value) || currentYear)}
          min={currentYear - 2}
          max={currentYear + 2}
          step={1}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={childBirthMonthId}>Geburtsmonat</Label>
        <Input
          id={childBirthMonthId}
          type="number"
          value={config.childBirthMonth}
          onChange={e => updateConfig('childBirthMonth', Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
          min={1}
          max={12}
          step={1}
        />
      </div>
    </div>
  )
}

function DurationField({ config, updateConfig }: { config: ElterngeldConfig; updateConfig: UpdateConfigFn }) {
  const durationId = useFormId('elterngeld-config', 'duration')
  return (
    <div className="space-y-2">
      <Label htmlFor={durationId}>Bezugsdauer (Monate)</Label>
      <Input
        id={durationId}
        type="number"
        value={config.durationMonths}
        onChange={e => updateConfig('durationMonths', Number(e.target.value) || 12)}
        min={1}
        max={config.useElterngeldPlus ? 28 : 14}
        step={1}
      />
      <p className="text-xs text-gray-600">Basiselterngeld: max. 12-14 Monate, ElterngeldPlus: max. 24-28 Monate</p>
    </div>
  )
}

function ElterngeldPlusSwitch({ config, updateConfig }: { config: ElterngeldConfig; updateConfig: UpdateConfigFn }) {
  const elterngeldPlusId = useFormId('elterngeld-config', 'elterngeld-plus')
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={elterngeldPlusId} className="text-sm font-medium">
          ElterngeldPlus nutzen
        </Label>
        <Switch
          id={elterngeldPlusId}
          checked={config.useElterngeldPlus}
          onCheckedChange={val => updateConfig('useElterngeldPlus', val)}
        />
      </div>
      <p className="text-xs text-gray-600">
        ElterngeldPlus: Halber Betrag, doppelte Bezugsdauer (besonders bei Teilzeitarbeit)
      </p>
    </div>
  )
}

function PartnerParticipationSwitch({
  config,
  updateConfig,
}: {
  config: ElterngeldConfig
  updateConfig: UpdateConfigFn
}) {
  const partnerParticipationId = useFormId('elterngeld-config', 'partner-participation')
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={partnerParticipationId} className="text-sm font-medium">
          Partner nimmt auch Elterngeld
        </Label>
        <Switch
          id={partnerParticipationId}
          checked={config.partnerParticipation}
          onCheckedChange={val => updateConfig('partnerParticipation', val)}
        />
      </div>
      <p className="text-xs text-gray-600">
        Partnerschaftsbonus möglich: +2-4 Monate bei paralleler Teilzeit (25-32h/Woche)
      </p>
    </div>
  )
}

function InfoBox() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
      <p className="font-medium text-blue-900">💡 Hinweis:</p>
      <p className="text-blue-800 mt-1">
        Elterngeld ist steuerfrei, unterliegt aber dem Progressionsvorbehalt. Die Berechnung erfolgt automatisch
        basierend auf Ihrem vorherigen Einkommen und den gewählten Optionen.
      </p>
    </div>
  )
}

export function ElterngeldConfigSection({ editingSource, currentYear, onUpdate }: ElterngeldConfigSectionProps) {
  const config = editingSource.elterngeldConfig

  if (!config) return null

  const updateConfig: UpdateConfigFn = (key, value) => {
    onUpdate({
      ...editingSource,
      elterngeldConfig: { ...config, [key]: value },
    })
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-medium text-sm">Elterngeld-Konfiguration</h3>
      <PreviousIncomeField config={config} updateConfig={updateConfig} />
      <ChildBirthFields config={config} currentYear={currentYear} updateConfig={updateConfig} />
      <DurationField config={config} updateConfig={updateConfig} />
      <ElterngeldPlusSwitch config={config} updateConfig={updateConfig} />
      <PartnerParticipationSwitch config={config} updateConfig={updateConfig} />
      <InfoBox />
    </div>
  )
}
