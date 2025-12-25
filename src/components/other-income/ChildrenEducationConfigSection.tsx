import { useMemo } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import type { OtherIncomeSource } from '../../../helpers/other-income'
import { generateFormId } from '../../utils/unique-id'
import {
  createStandardEducationPath,
  createVocationalEducationPath,
  getEducationPhaseDisplayName,
  type ChildrenEducationConfig,
} from '../../../helpers/children-education'

interface ChildrenEducationConfigSectionProps {
  editingSource: OtherIncomeSource
  currentYear: number
  onUpdate: (source: OtherIncomeSource) => void
}

function ChildBasicInfoFields({
  config,
  currentYear,
  onChildNameChange,
  onBirthYearChange,
}: {
  config: ChildrenEducationConfig
  currentYear: number
  onChildNameChange: (name: string) => void
  onBirthYearChange: (year: number) => void
}) {
  const childNameId = useMemo(() => generateFormId('children-education', 'child-name'), [])
  const birthYearId = useMemo(() => generateFormId('children-education', 'birth-year'), [])

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={childNameId}>Name des Kindes</Label>
        <Input
          id={childNameId}
          type="text"
          value={config.childName}
          onChange={(e) => onChildNameChange(e.target.value)}
          placeholder="z.B. Max Mustermann"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={birthYearId}>Geburtsjahr</Label>
        <Input
          id={birthYearId}
          type="number"
          value={config.birthYear}
          onChange={(e) => onBirthYearChange(Number(e.target.value) || currentYear - 5)}
          min={currentYear - 30}
          max={currentYear}
          step={1}
        />
        <p className="text-xs text-gray-600">
          Alter des Kindes im Jahr {currentYear}: {currentYear - config.birthYear} Jahre
        </p>
      </div>
    </>
  )
}

function EducationPathSelector({
  config,
  onEducationPathChange,
}: {
  config: ChildrenEducationConfig
  onEducationPathChange: (path: 'regelweg' | 'ausbildung') => void
}) {
  return (
    <div className="space-y-2">
      <Label>Bildungsweg</Label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEducationPathChange('regelweg')}
          className={`flex-1 px-3 py-2 text-sm rounded border ${
            config.educationPath === 'regelweg'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Regelweg (Studium)
        </button>
        <button
          type="button"
          onClick={() => onEducationPathChange('ausbildung')}
          className={`flex-1 px-3 py-2 text-sm rounded border ${
            config.educationPath === 'ausbildung'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Berufsausbildung
        </button>
      </div>
    </div>
  )
}

function PhasesOverviewCard({ config }: { config: ChildrenEducationConfig }) {
  const getTotalEstimatedCosts = (): number => {
    return config.phases.reduce((total, phase) => {
      const years = phase.endYear - phase.startYear + 1
      return total + phase.monthlyCost * 12 * years
    }, 0)
  }

  return (
    <Card className="p-3 bg-purple-100 border-purple-300">
      <h5 className="text-sm font-semibold text-purple-900 mb-2">📊 Bildungsphasen-Übersicht</h5>
      <div className="space-y-2">
        {config.phases.map((phase, index) => (
          <div key={index} className="flex justify-between text-xs text-purple-800">
            <span className="font-medium">{getEducationPhaseDisplayName(phase.phase)}:</span>
            <span>
              {phase.startYear} - {phase.endYear} ({phase.monthlyCost.toLocaleString('de-DE')} €/Monat)
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-purple-300">
        <div className="flex justify-between text-sm font-bold text-purple-900">
          <span>Geschätzte Gesamtkosten:</span>
          <span>{getTotalEstimatedCosts().toLocaleString('de-DE')} €</span>
        </div>
      </div>
    </Card>
  )
}

function BafoegInfoCard({ config }: { config: ChildrenEducationConfig }) {
  if (!config.bafoegConfig) return null

  return (
    <Card className="p-3 bg-blue-100 border-blue-300">
      <h5 className="text-sm font-semibold text-blue-900 mb-2">💰 BAföG-Information</h5>
      <div className="space-y-1 text-xs text-blue-800">
        <div className="flex justify-between">
          <span>BAföG-Zeitraum:</span>
          <span>
            {config.bafoegConfig.startYear} - {config.bafoegConfig.endYear}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Monatlicher Betrag:</span>
          <span>{config.bafoegConfig.monthlyAmount.toLocaleString('de-DE')} €</span>
        </div>
        <div className="flex justify-between">
          <span>Elterneinkommen:</span>
          <span>{config.bafoegConfig.parentalIncome.toLocaleString('de-DE')} €</span>
        </div>
        <p className="mt-2 text-xs text-blue-700 italic">
          ℹ️ BAföG reduziert die Netto-Bildungskosten. 50% ist Zuschuss, 50% zinsloses Darlehen.
        </p>
      </div>
    </Card>
  )
}

function InfoNotesCard() {
  return (
    <div className="p-3 bg-purple-50 rounded border border-purple-200">
      <p className="text-xs text-purple-800">
        <strong>💡 Hinweis:</strong> Bildungskosten werden als Ausgaben in der Simulation berücksichtigt und reduzieren
        das verfügbare Kapital. BAföG-Leistungen verringern die Netto-Kosten.
      </p>
      <p className="text-xs text-purple-700 mt-1">
        <strong>📚 Steuerlich absetzbar:</strong> Berufsausbildung und Studium können als Sonderausgaben geltend gemacht
        werden (max. 6.000 € pro Jahr nach § 10 Abs. 1 Nr. 7 EStG).
      </p>
    </div>
  )
}

export function ChildrenEducationConfigSection({
  editingSource,
  currentYear,
  onUpdate,
}: ChildrenEducationConfigSectionProps) {
  if (!editingSource.kinderBildungConfig) return null

  const config = editingSource.kinderBildungConfig

  const handleChildNameChange = (childName: string) => {
    onUpdate({ ...editingSource, kinderBildungConfig: { ...config, childName } })
  }

  const handleBirthYearChange = (birthYear: number) => {
    onUpdate({ ...editingSource, kinderBildungConfig: { ...config, birthYear } })
  }

  const handleEducationPathChange = (path: 'regelweg' | 'ausbildung') => {
    const newConfig =
      path === 'regelweg'
        ? createStandardEducationPath(config.childName, config.birthYear, currentYear)
        : createVocationalEducationPath(config.childName, config.birthYear, currentYear)

    onUpdate({
      ...editingSource,
      kinderBildungConfig: newConfig,
      startYear: Math.min(...newConfig.phases.map((p) => p.startYear)),
      endYear: Math.max(...newConfig.phases.map((p) => p.endYear)),
    })
  }

  return (
    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
        🎓 Kinder-Bildungskosten-Konfiguration
      </h4>

      <ChildBasicInfoFields
        config={config}
        currentYear={currentYear}
        onChildNameChange={handleChildNameChange}
        onBirthYearChange={handleBirthYearChange}
      />

      <EducationPathSelector config={config} onEducationPathChange={handleEducationPathChange} />
      <PhasesOverviewCard config={config} />
      <BafoegInfoCard config={config} />
      <InfoNotesCard />
    </div>
  )
}
