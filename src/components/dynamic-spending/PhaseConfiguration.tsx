import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { type ReactNode, useMemo } from 'react'
import { type RetirementPhaseConfig, getPhaseNameGerman, getPhaseDescriptionGerman } from '../../../helpers/dynamic-spending'
import { generateFormId } from '../../utils/unique-id'

interface PhaseConfigurationProps {
  phaseConfig: RetirementPhaseConfig
  onChange: (config: RetirementPhaseConfig) => void
  phaseIcon: ReactNode
  phaseName: 'go-go' | 'slow-go' | 'no-go'
  badgeVariant: 'default' | 'secondary' | 'outline'
  badgeText: string
}

function getPhaseKey(phaseName: string, suffix: 'StartAge' | 'Multiplier'): keyof RetirementPhaseConfig {
  const prefix = phaseName === 'go-go' ? 'goGo' : phaseName === 'slow-go' ? 'slowGo' : 'noGo'
  return `${prefix}${suffix}` as keyof RetirementPhaseConfig
}

function getMinMax(phaseName: string, type: 'age' | 'multiplier'): [number, number] {
  if (type === 'age') {
    return phaseName === 'go-go' ? [50, 80] : phaseName === 'slow-go' ? [60, 90] : [70, 100]
  }
  return phaseName === 'go-go' ? [50, 200] : phaseName === 'slow-go' ? [30, 150] : [20, 120]
}

function PhaseHeader({ phaseIcon, phaseName, badgeVariant, badgeText }: Pick<PhaseConfigurationProps, 'phaseIcon' | 'phaseName' | 'badgeVariant' | 'badgeText'>) {
  return (
    <div className="flex items-center gap-2">
      {phaseIcon}
      <h4 className="font-medium">{getPhaseNameGerman(phaseName)}</h4>
      <Badge variant={badgeVariant}>{badgeText}</Badge>
    </div>
  )
}

export function PhaseConfiguration(props: PhaseConfigurationProps) {
  const { phaseConfig, onChange, phaseName } = props
  const startAgeId = useMemo(() => generateFormId('dynamic-spending', `${phaseName}-start`), [phaseName])
  const multiplierId = useMemo(() => generateFormId('dynamic-spending', `${phaseName}-multiplier`), [phaseName])

  const startAgeKey = getPhaseKey(phaseName, 'StartAge')
  const multiplierKey = getPhaseKey(phaseName, 'Multiplier')
  const [ageMin, ageMax] = getMinMax(phaseName, 'age')
  const [multMin, multMax] = getMinMax(phaseName, 'multiplier')

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <PhaseHeader {...props} />
      <p className="text-sm text-muted-foreground">{getPhaseDescriptionGerman(phaseName)}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={startAgeId}>Startalter</Label>
          <Input id={startAgeId} type="number" value={phaseConfig[startAgeKey] as number} onChange={(e) => onChange({ ...phaseConfig, [startAgeKey]: Number(e.target.value) })} min={ageMin} max={ageMax} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={multiplierId}>Ausgaben-Multiplikator (%)</Label>
          <Input id={multiplierId} type="number" value={(phaseConfig[multiplierKey] as number) * 100} onChange={(e) => onChange({ ...phaseConfig, [multiplierKey]: Number(e.target.value) / 100 })} min={multMin} max={multMax} step={5} />
        </div>
      </div>
    </div>
  )
}
