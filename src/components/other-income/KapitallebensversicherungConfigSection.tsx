import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import type { OtherIncomeSource, KapitallebensversicherungConfig } from '../../../helpers/other-income'

interface KapitallebensversicherungConfigSectionProps {
  editingSource: OtherIncomeSource
  currentYear: number
  onUpdate: (source: OtherIncomeSource) => void
}

interface PolicyStartYearFieldProps {
  policyStartYear: number
  onChange: (year: number) => void
}

function PolicyStartYearField({ policyStartYear, onChange }: PolicyStartYearFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="policy-start-year">Vertragsbeginn (Jahr)</Label>
      <Input
        id="policy-start-year"
        type="number"
        value={policyStartYear}
        onChange={e => onChange(Number(e.target.value) || new Date().getFullYear() - 10)}
        min={1950}
        max={new Date().getFullYear()}
        step={1}
      />
      <p className="text-xs text-gray-600">Jahr, in dem die Versicherung abgeschlossen wurde</p>
    </div>
  )
}

interface PolicyMaturityYearFieldProps {
  policyMaturityYear: number
  currentYear: number
  onChange: (year: number) => void
}

function PolicyMaturityYearField({ policyMaturityYear, currentYear, onChange }: PolicyMaturityYearFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="policy-maturity-year">Fälligkeit (Jahr)</Label>
      <Input
        id="policy-maturity-year"
        type="number"
        value={policyMaturityYear}
        onChange={e => onChange(Number(e.target.value) || currentYear)}
        min={currentYear}
        max={2100}
        step={1}
      />
      <p className="text-xs text-gray-600">Jahr, in dem die Auszahlung erfolgt</p>
    </div>
  )
}

interface TotalPayoutAmountFieldProps {
  totalPayoutAmount: number
  onChange: (amount: number) => void
}

function TotalPayoutAmountField({ totalPayoutAmount, onChange }: TotalPayoutAmountFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="total-payout-amount">Auszahlungsbetrag (€)</Label>
      <Input
        id="total-payout-amount"
        type="number"
        value={totalPayoutAmount}
        onChange={e => onChange(Number(e.target.value) || 0)}
        min={0}
        step={1000}
      />
      <p className="text-xs text-gray-600">Gesamtbetrag der Einmalzahlung bei Fälligkeit</p>
    </div>
  )
}

interface TotalPremiumsPaidFieldProps {
  totalPremiumsPaid: number
  onChange: (amount: number) => void
}

function TotalPremiumsPaidField({ totalPremiumsPaid, onChange }: TotalPremiumsPaidFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="total-premiums-paid">Gezahlte Beiträge (€)</Label>
      <Input
        id="total-premiums-paid"
        type="number"
        value={totalPremiumsPaid}
        onChange={e => onChange(Number(e.target.value) || 0)}
        min={0}
        step={1000}
      />
      <p className="text-xs text-gray-600">Summe aller eingezahlten Versicherungsbeiträge</p>
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
      <Label htmlFor="klv-birth-year">Geburtsjahr des Versicherten</Label>
      <Input
        id="klv-birth-year"
        type="number"
        value={birthYear}
        onChange={e => onChange(Number(e.target.value) || new Date().getFullYear() - 40)}
        min={1920}
        max={new Date().getFullYear()}
        step={1}
      />
      <p className="text-xs text-gray-600">Benötigt für die Berechnung des Alters bei Auszahlung</p>
    </div>
  )
}

interface HalbeinkuenfteFieldProps {
  qualifiesForHalbeinkuenfte: boolean
  onChange: (applies: boolean) => void
}

function HalbeinkuenfteField({ qualifiesForHalbeinkuenfte, onChange }: HalbeinkuenfteFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="halbeinkuenfte" className="text-sm font-medium">
          Halbeinkünfteverfahren (ältere Verträge)
        </Label>
        <Switch id="halbeinkuenfte" checked={qualifiesForHalbeinkuenfte} onCheckedChange={onChange} />
      </div>
      <p className="text-xs text-gray-600">
        {qualifiesForHalbeinkuenfte
          ? 'Aktiviert: 50% der Erträge sind steuerfrei (alte Verträge)'
          : 'Deaktiviert: Moderne Besteuerungsregeln gelten'}
      </p>
    </div>
  )
}

interface TaxFreePortionFieldProps {
  applyTaxFreePortionAfter12Years: boolean
  onChange: (apply: boolean) => void
}

function TaxFreePortionField({ applyTaxFreePortionAfter12Years, onChange }: TaxFreePortionFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="tax-free-portion" className="text-sm font-medium">
          Steuerfreiheit nach 12 Jahren prüfen (§ 20 Abs. 1 Nr. 6 EStG)
        </Label>
        <Switch id="tax-free-portion" checked={applyTaxFreePortionAfter12Years} onCheckedChange={onChange} />
      </div>
      <p className="text-xs text-gray-600">
        {applyTaxFreePortionAfter12Years
          ? 'Aktiviert: Prüfung auf Steuerfreiheit bei 12+ Jahren Laufzeit und Auszahlung ab Alter 60'
          : 'Deaktiviert: Keine Steuerfreiheit, volle Besteuerung der Erträge'}
      </p>
    </div>
  )
}

// Helper: Calculate tax treatment information
function getTaxTreatmentInfo(
  applyTaxFreePortionAfter12Years: boolean,
  meetsDurationCriteria: boolean,
  meetsAgeCriteria: boolean,
  qualifiesForHalbeinkuenfte: boolean,
): { taxInfo: string; taxExemption: number } {
  if (applyTaxFreePortionAfter12Years && meetsDurationCriteria && meetsAgeCriteria) {
    return {
      taxInfo:
        'Die Auszahlung ist vollständig steuerfrei (12+ Jahre Laufzeit und Auszahlung nach Alter 60 gemäß § 20 Abs. 1 Nr. 6 EStG).',
      taxExemption: 100,
    }
  }

  if (qualifiesForHalbeinkuenfte) {
    return {
      taxInfo: 'Es gilt das Halbeinkünfteverfahren: 50% der Erträge sind steuerfrei.',
      taxExemption: 50,
    }
  }

  return {
    taxInfo: 'Die Erträge werden vollständig mit der Kapitalertragsteuer (Abgeltungsteuer) besteuert.',
    taxExemption: 0,
  }
}

function KapitallebensversicherungInfoBox({
  policyDuration,
  ageAtPayout,
  investmentGains,
  applyTaxFreePortionAfter12Years,
  qualifiesForHalbeinkuenfte,
}: {
  policyDuration: number
  ageAtPayout: number
  investmentGains: number
  applyTaxFreePortionAfter12Years: boolean
  qualifiesForHalbeinkuenfte: boolean
}) {
  const meetsAgeCriteria = ageAtPayout >= 60
  const meetsDurationCriteria = policyDuration >= 12

  const { taxInfo, taxExemption } = getTaxTreatmentInfo(
    applyTaxFreePortionAfter12Years,
    meetsDurationCriteria,
    meetsAgeCriteria,
    qualifiesForHalbeinkuenfte,
  )

  const taxableGains = investmentGains * (1 - taxExemption / 100)

  return (
    <div className="p-3 bg-blue-50 rounded border border-blue-200">
      <p className="text-xs text-blue-800 mb-2">
        <strong>ℹ️ Steuerliche Behandlung:</strong>
      </p>
      <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
        <li>Vertragslaufzeit: {policyDuration} Jahre</li>
        <li>Alter bei Auszahlung: {ageAtPayout} Jahre</li>
        <li>Erträge: {investmentGains.toLocaleString('de-DE')} € (Auszahlung - gezahlte Beiträge)</li>
        <li>{taxInfo}</li>
        {taxExemption > 0 && (
          <li>
            Steuerpflichtige Erträge: {taxableGains.toLocaleString('de-DE')} € ({100 - taxExemption}% von{' '}
            {investmentGains.toLocaleString('de-DE')} €)
          </li>
        )}
      </ul>
    </div>
  )
}

function createKapitallebensversicherungHandlers(
  editingSource: OtherIncomeSource,
  onUpdate: (source: OtherIncomeSource) => void,
) {
  // Helper to update config
  const updateConfig = (updates: Partial<KapitallebensversicherungConfig>) => {
    onUpdate({
      ...editingSource,
      kapitallebensversicherungConfig: {
        ...editingSource.kapitallebensversicherungConfig!,
        ...updates,
      },
    })
  }

  return {
    handlePolicyStartYearChange: (policyStartYear: number) => updateConfig({ policyStartYear }),
    handlePolicyMaturityYearChange: (policyMaturityYear: number) => {
      onUpdate({
        ...editingSource,
        kapitallebensversicherungConfig: {
          ...editingSource.kapitallebensversicherungConfig!,
          policyMaturityYear,
        },
        endYear: policyMaturityYear,
      })
    },
    handleTotalPayoutAmountChange: (totalPayoutAmount: number) => updateConfig({ totalPayoutAmount }),
    handleTotalPremiumsPaidChange: (totalPremiumsPaid: number) => updateConfig({ totalPremiumsPaid }),
    handleBirthYearChange: (birthYear: number) => updateConfig({ birthYear }),
    handleHalbeinkuenfteChange: (qualifiesForHalbeinkuenfte: boolean) => updateConfig({ qualifiesForHalbeinkuenfte }),
    handleTaxFreePortionChange: (applyTaxFreePortionAfter12Years: boolean) =>
      updateConfig({ applyTaxFreePortionAfter12Years }),
  }
}

// Component to render all form fields
function KapitallebensversicherungFormFields({
  config,
  currentYear,
  handlers,
}: {
  config: KapitallebensversicherungConfig
  currentYear: number
  handlers: ReturnType<typeof createKapitallebensversicherungHandlers>
}) {
  return (
    <>
      <BirthYearField birthYear={config.birthYear} onChange={handlers.handleBirthYearChange} />

      <PolicyStartYearField policyStartYear={config.policyStartYear} onChange={handlers.handlePolicyStartYearChange} />

      <PolicyMaturityYearField
        policyMaturityYear={config.policyMaturityYear}
        currentYear={currentYear}
        onChange={handlers.handlePolicyMaturityYearChange}
      />

      <TotalPayoutAmountField
        totalPayoutAmount={config.totalPayoutAmount}
        onChange={handlers.handleTotalPayoutAmountChange}
      />

      <TotalPremiumsPaidField
        totalPremiumsPaid={config.totalPremiumsPaid}
        onChange={handlers.handleTotalPremiumsPaidChange}
      />

      <HalbeinkuenfteField
        qualifiesForHalbeinkuenfte={config.qualifiesForHalbeinkuenfte}
        onChange={handlers.handleHalbeinkuenfteChange}
      />

      <TaxFreePortionField
        applyTaxFreePortionAfter12Years={config.applyTaxFreePortionAfter12Years}
        onChange={handlers.handleTaxFreePortionChange}
      />
    </>
  )
}

export function KapitallebensversicherungConfigSection({
  editingSource,
  currentYear,
  onUpdate,
}: KapitallebensversicherungConfigSectionProps) {
  if (!editingSource.kapitallebensversicherungConfig) {
    return null
  }

  const handlers = createKapitallebensversicherungHandlers(editingSource, onUpdate)

  const config = editingSource.kapitallebensversicherungConfig
  const policyDuration = config.policyMaturityYear - config.policyStartYear
  const ageAtPayout = config.policyMaturityYear - config.birthYear
  const investmentGains = config.totalPayoutAmount - config.totalPremiumsPaid

  return (
    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
      <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
        🏦 Kapitallebensversicherung-spezifische Einstellungen
      </h4>

      <KapitallebensversicherungFormFields config={config} currentYear={currentYear} handlers={handlers} />

      <KapitallebensversicherungInfoBox
        policyDuration={policyDuration}
        ageAtPayout={ageAtPayout}
        investmentGains={investmentGains}
        applyTaxFreePortionAfter12Years={config.applyTaxFreePortionAfter12Years}
        qualifiesForHalbeinkuenfte={config.qualifiesForHalbeinkuenfte}
      />
    </div>
  )
}
