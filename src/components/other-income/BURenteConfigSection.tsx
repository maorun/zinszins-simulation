import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface BURenteConfigSectionProps {
  editingSource: OtherIncomeSource
  currentYear: number
  onUpdate: (source: OtherIncomeSource) => void
}

interface DisabilityStartYearFieldProps {
  disabilityStartYear: number
  currentYear: number
  onChange: (year: number) => void
}

function DisabilityStartYearField({ disabilityStartYear, currentYear, onChange }: DisabilityStartYearFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="disability-start-year">Beginn der Berufsunfähigkeit (Jahr)</Label>
      <Input
        id="disability-start-year"
        type="number"
        value={disabilityStartYear}
        onChange={e => onChange(Number(e.target.value) || currentYear)}
        min={1950}
        max={2100}
        step={1}
      />
      <p className="text-xs text-gray-600">Jahr, in dem die BU-Leistungen beginnen</p>
    </div>
  )
}

interface DisabilityEndYearFieldProps {
  disabilityEndYear: number | null
  currentYear: number
  onChange: (year: number | null) => void
}

function DisabilityEndYearField({ disabilityEndYear, currentYear, onChange }: DisabilityEndYearFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="disability-end-year">Ende der Berufsunfähigkeit (Jahr, leer = dauerhaft)</Label>
      <Input
        id="disability-end-year"
        type="number"
        value={disabilityEndYear ?? ''}
        onChange={e => {
          const value = e.target.value
          onChange(value === '' ? null : Number(value) || currentYear)
        }}
        min={1950}
        max={2100}
        step={1}
        placeholder="Dauerhaft (bis Lebensende)"
      />
      <p className="text-xs text-gray-600">Leer lassen für dauerhafte Berufsunfähigkeit</p>
    </div>
  )
}

interface BirthYearFieldProps {
  birthYear: number
  onChange: (year: number) => void
}

function BirthYearField({ birthYear, onChange }: BirthYearFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="birth-year">Geburtsjahr des Versicherten</Label>
      <Input
        id="birth-year"
        type="number"
        value={birthYear}
        onChange={e => onChange(Number(e.target.value) || new Date().getFullYear() - 40)}
        min={1920}
        max={new Date().getFullYear()}
        step={1}
      />
      <p className="text-xs text-gray-600">
        Benötigt für die Berechnung des Alters bei Beginn der Berufsunfähigkeit
      </p>
    </div>
  )
}

interface DisabilityDegreeFieldProps {
  disabilityDegree: number
  onChange: (degree: number) => void
}

function DisabilityDegreeField({ disabilityDegree, onChange }: DisabilityDegreeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="disability-degree">Grad der Berufsunfähigkeit (%)</Label>
      <Input
        id="disability-degree"
        type="number"
        value={disabilityDegree}
        onChange={e => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
        min={0}
        max={100}
        step={10}
      />
      <p className="text-xs text-gray-600">
        0-100% (dient zur Dokumentation, beeinflusst nicht die Berechnung)
      </p>
    </div>
  )
}

interface LeibrentenBesteuerungFieldProps {
  applyLeibrentenBesteuerung: boolean
  ageAtDisabilityStart: number
  onChange: (apply: boolean) => void
}

function LeibrentenBesteuerungField({
  applyLeibrentenBesteuerung,
  ageAtDisabilityStart,
  onChange,
}: LeibrentenBesteuerungFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="leibrenten-besteuerung" className="text-sm font-medium">
          Leibrenten-Besteuerung anwenden (§ 22 EStG)
        </Label>
        <Switch id="leibrenten-besteuerung" checked={applyLeibrentenBesteuerung} onCheckedChange={onChange} />
      </div>
      <p className="text-xs text-gray-600">
        {applyLeibrentenBesteuerung
          ? `Aktiviert: Nur der Ertragsanteil ist steuerpflichtig (Alter bei BU-Beginn: ${ageAtDisabilityStart} Jahre)`
          : 'Deaktiviert: Die gesamte BU-Rente ist steuerpflichtig'}
      </p>
    </div>
  )
}

function BURenteInfoBox({ ageAtDisabilityStart }: { ageAtDisabilityStart: number }) {
  // Calculate Ertragsanteil based on age
  const getErtragsanteil = (age: number): number => {
    if (age <= 0) return 59
    if (age <= 1) return 59
    if (age <= 17) return 59 - age
    if (age <= 27) return 42
    if (age <= 31) return 40
    if (age <= 36) return 38
    if (age <= 41) return 36
    if (age <= 46) return 34
    if (age <= 51) return 32
    if (age <= 56) return 30
    if (age <= 61) return 28
    if (age <= 63) return 26
    if (age <= 64) return 25
    if (age <= 65) return 24
    if (age <= 66) return 23
    if (age <= 67) return 22
    return 21
  }

  const ertragsanteil = getErtragsanteil(ageAtDisabilityStart)

  return (
    <div className="p-3 bg-blue-50 rounded border border-blue-200">
      <p className="text-xs text-blue-800">
        <strong>ℹ️ Hinweis zur Leibrenten-Besteuerung:</strong> Bei BU-Renten nach § 22 EStG ist nur der
        Ertragsanteil steuerpflichtig. Bei einem Alter von {ageAtDisabilityStart} Jahren beträgt der Ertragsanteil{' '}
        {ertragsanteil}%. Dies bedeutet, dass {100 - ertragsanteil}% der BU-Rente steuerfrei sind.
      </p>
    </div>
  )
}

function createBURenteHandlers(
  editingSource: OtherIncomeSource,
  currentYear: number,
  onUpdate: (source: OtherIncomeSource) => void,
) {
  const calculateAgeAtDisabilityStart = (birthYear: number, disabilityStartYear: number) => {
    return disabilityStartYear - birthYear
  }

  const handleDisabilityStartYearChange = (disabilityStartYear: number) => {
    const ageAtDisabilityStart = calculateAgeAtDisabilityStart(
      editingSource.buRenteConfig!.birthYear,
      disabilityStartYear,
    )
    onUpdate({
      ...editingSource,
      buRenteConfig: {
        ...editingSource.buRenteConfig!,
        disabilityStartYear,
        ageAtDisabilityStart,
      },
      startYear: disabilityStartYear, // Update income start year
    })
  }

  const handleDisabilityEndYearChange = (disabilityEndYear: number | null) => {
    onUpdate({
      ...editingSource,
      buRenteConfig: {
        ...editingSource.buRenteConfig!,
        disabilityEndYear,
      },
      endYear: disabilityEndYear, // Update income end year
    })
  }

  const handleBirthYearChange = (birthYear: number) => {
    const ageAtDisabilityStart = calculateAgeAtDisabilityStart(
      birthYear,
      editingSource.buRenteConfig!.disabilityStartYear,
    )
    onUpdate({
      ...editingSource,
      buRenteConfig: {
        ...editingSource.buRenteConfig!,
        birthYear,
        ageAtDisabilityStart,
      },
    })
  }

  const handleDisabilityDegreeChange = (disabilityDegree: number) => {
    onUpdate({
      ...editingSource,
      buRenteConfig: {
        ...editingSource.buRenteConfig!,
        disabilityDegree,
      },
    })
  }

  const handleLeibrentenBesteuerungChange = (applyLeibrentenBesteuerung: boolean) => {
    onUpdate({
      ...editingSource,
      buRenteConfig: {
        ...editingSource.buRenteConfig!,
        applyLeibrentenBesteuerung,
      },
    })
  }

  return {
    handleDisabilityStartYearChange,
    handleDisabilityEndYearChange,
    handleBirthYearChange,
    handleDisabilityDegreeChange,
    handleLeibrentenBesteuerungChange,
  }
}

export function BURenteConfigSection({ editingSource, currentYear, onUpdate }: BURenteConfigSectionProps) {
  if (!editingSource.buRenteConfig) {
    return null
  }

  const {
    handleDisabilityStartYearChange,
    handleDisabilityEndYearChange,
    handleBirthYearChange,
    handleDisabilityDegreeChange,
    handleLeibrentenBesteuerungChange,
  } = createBURenteHandlers(editingSource, currentYear, onUpdate)

  return (
    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
        🏥 BU-Renten-spezifische Einstellungen
      </h4>

      <BirthYearField birthYear={editingSource.buRenteConfig.birthYear} onChange={handleBirthYearChange} />

      <DisabilityStartYearField
        disabilityStartYear={editingSource.buRenteConfig.disabilityStartYear}
        currentYear={currentYear}
        onChange={handleDisabilityStartYearChange}
      />

      <DisabilityEndYearField
        disabilityEndYear={editingSource.buRenteConfig.disabilityEndYear}
        currentYear={currentYear}
        onChange={handleDisabilityEndYearChange}
      />

      <DisabilityDegreeField
        disabilityDegree={editingSource.buRenteConfig.disabilityDegree}
        onChange={handleDisabilityDegreeChange}
      />

      <LeibrentenBesteuerungField
        applyLeibrentenBesteuerung={editingSource.buRenteConfig.applyLeibrentenBesteuerung}
        ageAtDisabilityStart={editingSource.buRenteConfig.ageAtDisabilityStart}
        onChange={handleLeibrentenBesteuerungChange}
      />

      <BURenteInfoBox ageAtDisabilityStart={editingSource.buRenteConfig.ageAtDisabilityStart} />
    </div>
  )
}
