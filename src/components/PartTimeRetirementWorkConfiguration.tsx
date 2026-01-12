import React, { useMemo, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { AlertCircle, Plus, Trash2, Briefcase } from 'lucide-react'
import { generateFormId } from '../utils/unique-id'
import {
  type PartTimeWorkPhase,
  type PartTimeRetirementWorkConfig,
  validatePartTimeWorkPhase,
} from '../../helpers/part-time-retirement-work'

interface PartTimeRetirementWorkConfigurationProps {
  config: PartTimeRetirementWorkConfig
  onConfigChange: (config: PartTimeRetirementWorkConfig) => void
  startYear: number
  endYear: number
}

interface WorkPhaseCardProps {
  phase: PartTimeWorkPhase
  index: number
  onUpdate: (index: number, phase: PartTimeWorkPhase) => void
  onDelete: (index: number) => void
}

function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null

  return (
    <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="space-y-1">
        {errors.map((error: string, i: number) => (
          <div key={i}>{error}</div>
        ))}
      </div>
    </div>
  )
}

function YearFields({
  phase,
  updatePhase,
  startYearId,
  endYearId,
}: {
  phase: PartTimeWorkPhase
  updatePhase: (updates: Partial<PartTimeWorkPhase>) => void
  startYearId: string
  endYearId: string
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={startYearId}>Startjahr</Label>
        <Input
          id={startYearId}
          type="number"
          value={phase.startYear}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase({ startYear: Number(e.target.value) || 2025 })}
          min={2020}
          max={2100}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={endYearId}>Endjahr</Label>
        <Input
          id={endYearId}
          type="number"
          value={phase.endYear}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase({ endYear: Number(e.target.value) || 2025 })}
          min={phase.startYear}
          max={2100}
        />
      </div>
    </div>
  )
}

function IncomeField({
  phase,
  updatePhase,
  monthlyIncomeId,
}: {
  phase: PartTimeWorkPhase
  updatePhase: (updates: Partial<PartTimeWorkPhase>) => void
  monthlyIncomeId: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={monthlyIncomeId}>Monatliches Bruttoeinkommen (€)</Label>
      <Input
        id={monthlyIncomeId}
        type="number"
        value={phase.monthlyGrossIncome}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase({ monthlyGrossIncome: Number(e.target.value) || 0 })}
        min={0}
        max={100000}
        step={100}
      />
      <p className="text-xs text-gray-600">Jährlich: {(phase.monthlyGrossIncome * 12).toLocaleString('de-DE')} €</p>
    </div>
  )
}

function WorkDetailsFields({
  phase,
  updatePhase,
  monthlyIncomeId,
  weeklyHoursId,
  descriptionId,
}: {
  phase: PartTimeWorkPhase
  updatePhase: (updates: Partial<PartTimeWorkPhase>) => void
  monthlyIncomeId: string
  weeklyHoursId: string
  descriptionId: string
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <IncomeField phase={phase} updatePhase={updatePhase} monthlyIncomeId={monthlyIncomeId} />
        <div className="space-y-2">
          <Label htmlFor={weeklyHoursId}>Wochenstunden</Label>
          <Input
            id={weeklyHoursId}
            type="number"
            value={phase.weeklyHours}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase({ weeklyHours: Number(e.target.value) || 0 })}
            min={0}
            max={40}
            step={1}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={descriptionId}>Beschreibung</Label>
        <Input
          id={descriptionId}
          type="text"
          value={phase.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePhase({ description: e.target.value })}
          placeholder="z.B. Beratungstätigkeit, Aushilfstätigkeit"
        />
      </div>
    </>
  )
}

function WorkPhaseCard({ phase, index, onUpdate, onDelete }: WorkPhaseCardProps) {
  const startYearId = useMemo(() => generateFormId('part-time-work', `start-year-${index}`), [index])
  const endYearId = useMemo(() => generateFormId('part-time-work', `end-year-${index}`), [index])
  const monthlyIncomeId = useMemo(() => generateFormId('part-time-work', `monthly-income-${index}`), [index])
  const weeklyHoursId = useMemo(() => generateFormId('part-time-work', `weekly-hours-${index}`), [index])
  const descriptionId = useMemo(() => generateFormId('part-time-work', `description-${index}`), [index])

  const validationErrors = validatePartTimeWorkPhase(phase)

  const updatePhase = useCallback(
    (updates: Partial<PartTimeWorkPhase>) => {
      onUpdate(index, { ...phase, ...updates })
    },
    [index, phase, onUpdate]
  )

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">
              Arbeitsphase {index + 1}
              {phase.description && `: ${phase.description}`}
            </CardTitle>
          </div>
          <Button variant="destructive" size="sm" onClick={() => onDelete(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {phase.startYear} - {phase.endYear} ({phase.endYear - phase.startYear + 1} Jahre)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ValidationErrors errors={validationErrors} />
        <YearFields phase={phase} updatePhase={updatePhase} startYearId={startYearId} endYearId={endYearId} />
        <WorkDetailsFields
          phase={phase}
          updatePhase={updatePhase}
          monthlyIncomeId={monthlyIncomeId}
          weeklyHoursId={weeklyHoursId}
          descriptionId={descriptionId}
        />
      </CardContent>
    </Card>
  )
}

function ConfigurationCard({
  config,
  onConfigChange,
  reduceWithdrawalsId,
  reductionPercentId,
  calculateSocialSecurityId,
}: {
  config: PartTimeRetirementWorkConfig
  onConfigChange: (config: PartTimeRetirementWorkConfig) => void
  reduceWithdrawalsId: string
  reductionPercentId: string
  calculateSocialSecurityId: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zeitweise Rückkehr in den Arbeitsmarkt</CardTitle>
        <CardDescription>
          Simulieren Sie Teilzeit-Arbeit im Ruhestand mit automatischer Berechnung von Steuern, Sozialversicherung und
          Portfolio-Entnahme-Anpassungen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <WithdrawalReductionSwitch config={config} onConfigChange={onConfigChange} id={reduceWithdrawalsId} />
        {config.reduceWithdrawals && <ReductionPercentSlider config={config} onConfigChange={onConfigChange} id={reductionPercentId} />}
        <SocialSecuritySwitch config={config} onConfigChange={onConfigChange} id={calculateSocialSecurityId} />
        <HintsSection />
      </CardContent>
    </Card>
  )
}

function WithdrawalReductionSwitch({
  config,
  onConfigChange,
  id,
}: {
  config: PartTimeRetirementWorkConfig
  onConfigChange: (config: PartTimeRetirementWorkConfig) => void
  id: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-base font-medium">
          Portfolio-Entnahmen reduzieren
        </Label>
        <p className="text-sm text-gray-600">Reduziere Portfolio-Entnahmen während Arbeitsphasen</p>
      </div>
      <Switch id={id} checked={config.reduceWithdrawals} onCheckedChange={(checked: boolean) => onConfigChange({ ...config, reduceWithdrawals: checked })} />
    </div>
  )
}

function ReductionPercentSlider({
  config,
  onConfigChange,
  id,
}: {
  config: PartTimeRetirementWorkConfig
  onConfigChange: (config: PartTimeRetirementWorkConfig) => void
  id: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Reduzierung der Entnahmen (%)</Label>
      <div className="flex items-center gap-4">
        <Input
          id={id}
          type="number"
          value={config.withdrawalReductionPercent}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onConfigChange({ ...config, withdrawalReductionPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
          }
          min={0}
          max={100}
          step={5}
          className="w-32"
        />
        <div className="flex-1">
          <input
            type="range"
            value={config.withdrawalReductionPercent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfigChange({ ...config, withdrawalReductionPercent: Number(e.target.value) })}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </div>
      <p className="text-xs text-gray-600">Während Arbeitsphasen werden {config.withdrawalReductionPercent}% der geplanten Entnahmen eingespart</p>
    </div>
  )
}

function SocialSecuritySwitch({
  config,
  onConfigChange,
  id,
}: {
  config: PartTimeRetirementWorkConfig
  onConfigChange: (config: PartTimeRetirementWorkConfig) => void
  id: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-base font-medium">
          Sozialversicherung berechnen
        </Label>
        <p className="text-sm text-gray-600">Automatische Berechnung von Kranken- und Pflegeversicherungsbeiträgen (ca. 10-11%)</p>
      </div>
      <Switch id={id} checked={config.calculateSocialSecurity} onCheckedChange={(checked: boolean) => onConfigChange({ ...config, calculateSocialSecurity: checked })} />
    </div>
  )
}

function HintsSection() {
  return (
    <div className="rounded-md bg-blue-50 p-4">
      <h4 className="mb-2 font-medium text-blue-900">💡 Hinweise</h4>
      <ul className="space-y-1 text-sm text-blue-800">
        <li>• Teilzeit-Einkommen wird zusammen mit Renten und Kapitalerträgen versteuert</li>
        <li>• Sozialversicherungsbeiträge: ~7,3% KV + ~3,05% PV (+ 0,6% Kinderlosenzuschlag)</li>
        <li>• Portfolio-Schonung verlängert die Lebensdauer Ihrer Investments</li>
        <li>• Mehrere Arbeitsphasen können flexibel konfiguriert werden</li>
      </ul>
    </div>
  )
}

function WorkPhasesList({
  config,
  updateWorkPhase,
  deleteWorkPhase,
  addWorkPhase,
}: {
  config: PartTimeRetirementWorkConfig
  updateWorkPhase: (index: number, phase: PartTimeWorkPhase) => void
  deleteWorkPhase: (index: number) => void
  addWorkPhase: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Arbeitsphasen ({config.workPhases.length})</h3>
        <Button onClick={addWorkPhase} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Arbeitsphase hinzufügen
        </Button>
      </div>

      {config.workPhases.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Keine Arbeitsphasen konfiguriert</p>
            <Button onClick={addWorkPhase} variant="outline" size="sm" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Erste Arbeitsphase hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}

      {config.workPhases.map((phase: PartTimeWorkPhase, index: number) => (
        <WorkPhaseCard key={index} phase={phase} index={index} onUpdate={updateWorkPhase} onDelete={deleteWorkPhase} />
      ))}
    </div>
  )
}
export function PartTimeRetirementWorkConfiguration({
  config,
  onConfigChange,
  startYear,
  endYear,
}: PartTimeRetirementWorkConfigurationProps) {
  const reduceWithdrawalsId = useMemo(() => generateFormId('part-time-work-config', 'reduce-withdrawals'), [])
  const reductionPercentId = useMemo(() => generateFormId('part-time-work-config', 'reduction-percent'), [])
  const calculateSocialSecurityId = useMemo(() => generateFormId('part-time-work-config', 'calculate-social-security'), [])

  const addWorkPhase = useCallback(() => {
    const newPhase: PartTimeWorkPhase = {
      startYear,
      endYear: Math.min(startYear + 2, endYear),
      monthlyGrossIncome: 1500,
      weeklyHours: 20,
      description: 'Teilzeit-Arbeit',
    }
    onConfigChange({ ...config, workPhases: [...config.workPhases, newPhase] })
  }, [config, onConfigChange, startYear, endYear])

  const updateWorkPhase = useCallback(
    (index: number, phase: PartTimeWorkPhase) => {
      const phases = [...config.workPhases]
      phases[index] = phase
      onConfigChange({ ...config, workPhases: phases })
    },
    [config, onConfigChange]
  )

  const deleteWorkPhase = useCallback(
    (index: number) => onConfigChange({ ...config, workPhases: config.workPhases.filter((_: PartTimeWorkPhase, i: number) => i !== index) }),
    [config, onConfigChange]
  )

  return (
    <div className="space-y-6">
      <ConfigurationCard
        config={config}
        onConfigChange={onConfigChange}
        reduceWithdrawalsId={reduceWithdrawalsId}
        reductionPercentId={reductionPercentId}
        calculateSocialSecurityId={calculateSocialSecurityId}
      />
      <WorkPhasesList
        config={config}
        updateWorkPhase={updateWorkPhase}
        deleteWorkPhase={deleteWorkPhase}
        addWorkPhase={addWorkPhase}
      />
    </div>
  )
}
