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
      <p className="text-xs text-gray-600">Benötigt für die Berechnung des Alters bei Beginn der Berufsunfähigkeit</p>
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
      <p className="text-xs text-gray-600">0-100% (dient zur Dokumentation, beeinflusst nicht die Berechnung)</p>
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

// Ertragsanteil table according to § 22 Nr. 1 Satz 3 Buchstabe a Doppelbuchstabe bb EStG
// Maps age ranges to their taxable percentage
const ERTRAGSANTEIL_TABLE: Array<{ maxAge: number; percentage: number }> = [
  { maxAge: 1, percentage: 59 },
  { maxAge: 17, percentage: 43 }, // Special case: 59 - age for ages 2-17
  { maxAge: 27, percentage: 42 },
  { maxAge: 31, percentage: 40 },
  { maxAge: 36, percentage: 38 },
  { maxAge: 41, percentage: 36 },
  { maxAge: 46, percentage: 34 },
  { maxAge: 51, percentage: 32 },
  { maxAge: 56, percentage: 30 },
  { maxAge: 61, percentage: 28 },
  { maxAge: 63, percentage: 26 },
  { maxAge: 64, percentage: 25 },
  { maxAge: 65, percentage: 24 },
  { maxAge: 66, percentage: 23 },
  { maxAge: 67, percentage: 22 },
  { maxAge: Infinity, percentage: 21 },
]

function BURenteInfoBox({ ageAtDisabilityStart }: { ageAtDisabilityStart: number }) {
  const getErtragsanteil = (age: number): number => {
    // Handle ages 2-17: 59 - age
    if (age >= 2 && age <= 17) {
      return 59 - age
    }

    // Use lookup table for other ages
    const entry = ERTRAGSANTEIL_TABLE.find(item => age <= item.maxAge)
    return entry?.percentage ?? 21
  }

  const ertragsanteil = getErtragsanteil(ageAtDisabilityStart)

  return (
    <div className="p-3 bg-blue-50 rounded border border-blue-200">
      <p className="text-xs text-blue-800">
        <strong>ℹ️ Hinweis zur Leibrenten-Besteuerung:</strong> Bei BU-Renten nach § 22 EStG ist nur der Ertragsanteil
        steuerpflichtig. Bei einem Alter von {ageAtDisabilityStart} Jahren beträgt der Ertragsanteil {ertragsanteil}%.
        Dies bedeutet, dass {100 - ertragsanteil}% der BU-Rente steuerfrei sind.
      </p>
    </div>
  )
}

function calculateAgeAtDisabilityStart(birthYear: number, disabilityStartYear: number): number {
  return disabilityStartYear - birthYear
}

function createHandleDisabilityStartYearChange(
  editingSource: OtherIncomeSource,
  onUpdate: (source: OtherIncomeSource) => void,
) {
  return (disabilityStartYear: number) => {
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
}

function createHandleDisabilityEndYearChange(
  editingSource: OtherIncomeSource,
  onUpdate: (source: OtherIncomeSource) => void,
) {
  return (disabilityEndYear: number | null) => {
    onUpdate({
      ...editingSource,
      buRenteConfig: {
        ...editingSource.buRenteConfig!,
        disabilityEndYear,
      },
      endYear: disabilityEndYear, // Update income end year
    })
  }
}

function createHandleBirthYearChange(editingSource: OtherIncomeSource, onUpdate: (source: OtherIncomeSource) => void) {
  return (birthYear: number) => {
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
}

function createHandleDisabilityDegreeChange(
  editingSource: OtherIncomeSource,
  onUpdate: (source: OtherIncomeSource) => void,
) {
  return (disabilityDegree: number) => {
    onUpdate({
      ...editingSource,
      buRenteConfig: {
        ...editingSource.buRenteConfig!,
        disabilityDegree,
      },
    })
  }
}

function createHandleLeibrentenBesteuerungChange(
  editingSource: OtherIncomeSource,
  onUpdate: (source: OtherIncomeSource) => void,
) {
  return (applyLeibrentenBesteuerung: boolean) => {
    onUpdate({
      ...editingSource,
      buRenteConfig: {
        ...editingSource.buRenteConfig!,
        applyLeibrentenBesteuerung,
      },
    })
  }
}

function createBURenteHandlers(editingSource: OtherIncomeSource, onUpdate: (source: OtherIncomeSource) => void) {
  return {
    handleDisabilityStartYearChange: createHandleDisabilityStartYearChange(editingSource, onUpdate),
    handleDisabilityEndYearChange: createHandleDisabilityEndYearChange(editingSource, onUpdate),
    handleBirthYearChange: createHandleBirthYearChange(editingSource, onUpdate),
    handleDisabilityDegreeChange: createHandleDisabilityDegreeChange(editingSource, onUpdate),
    handleLeibrentenBesteuerungChange: createHandleLeibrentenBesteuerungChange(editingSource, onUpdate),
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
  } = createBURenteHandlers(editingSource, onUpdate)

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
