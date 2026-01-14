import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { useMemo } from 'react'
import { type MedicalCostConfig } from '../../../helpers/dynamic-spending'
import { generateFormId } from '../../utils/unique-id'

interface MedicalCostConfigurationProps {
  medicalCostConfig: MedicalCostConfig
  onChange: (config: MedicalCostConfig) => void
}

function MedicalCostHeader({ medicalEnabledId, enabled, onChange }: { medicalEnabledId: string; enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Medizinische Kosten-Progression</h3>
        <p className="text-sm text-muted-foreground">
          Berücksichtigt steigende Gesundheitsausgaben mit zunehmendem Alter
        </p>
      </div>
      <Switch id={medicalEnabledId} checked={enabled} onCheckedChange={onChange} />
    </div>
  )
}

function MedicalCostInputField({ id, label, value, onChange, min, max, step }: { id: string; label: string; value: number; onChange: (value: number) => void; min: number; max?: number; step?: number }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} />
    </div>
  )
}

function MedicalCostFields({ config, ids, onChange }: { config: MedicalCostConfig; ids: { base: string; inflation: string; age: string; rate: string }; onChange: (config: MedicalCostConfig) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MedicalCostInputField id={ids.base} label="Basis-Gesundheitskosten (€/Jahr)" value={config.baseMedicalCosts} onChange={(v) => onChange({ ...config, baseMedicalCosts: v })} min={0} step={100} />
      <MedicalCostInputField id={ids.inflation} label="Medizinische Inflationsrate (%)" value={config.medicalInflationRate * 100} onChange={(v) => onChange({ ...config, medicalInflationRate: v / 100 })} min={0} max={20} step={0.5} />
      <MedicalCostInputField id={ids.age} label="Beschleunigungsalter" value={config.accelerationAge} onChange={(v) => onChange({ ...config, accelerationAge: v })} min={60} max={100} />
      <MedicalCostInputField id={ids.rate} label="Beschleunigte Rate (%)" value={config.acceleratedRate * 100} onChange={(v) => onChange({ ...config, acceleratedRate: v / 100 })} min={0} max={20} step={0.5} />
    </div>
  )
}

export function MedicalCostConfiguration({ medicalCostConfig, onChange }: MedicalCostConfigurationProps) {
  const ids = {
    enabled: useMemo(() => generateFormId('dynamic-spending', 'medical-enabled'), []),
    base: useMemo(() => generateFormId('dynamic-spending', 'base-medical'), []),
    inflation: useMemo(() => generateFormId('dynamic-spending', 'medical-inflation'), []),
    age: useMemo(() => generateFormId('dynamic-spending', 'acceleration-age'), []),
    rate: useMemo(() => generateFormId('dynamic-spending', 'accelerated-rate'), []),
  }

  return (
    <div className="space-y-4">
      <MedicalCostHeader medicalEnabledId={ids.enabled} enabled={medicalCostConfig.enabled} onChange={(enabled) => onChange({ ...medicalCostConfig, enabled })} />
      {medicalCostConfig.enabled && <MedicalCostFields config={medicalCostConfig} ids={ids} onChange={onChange} />}
    </div>
  )
}
