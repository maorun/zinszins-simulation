import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import type { OtherIncomeSource, PflegezusatzversicherungConfig } from '../../../helpers/other-income'

interface PflegezusatzversicherungConfigSectionProps {
  editingSource: OtherIncomeSource
  currentYear: number
  onUpdate: (source: OtherIncomeSource) => void
}

interface CareStartYearFieldProps {
  careStartYear: number
  currentYear: number
  onChange: (year: number) => void
}

function CareStartYearField({ careStartYear, currentYear, onChange }: CareStartYearFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="care-start-year">Beginn der Pflegebedürftigkeit (Jahr)</Label>
      <Input
        id="care-start-year"
        type="number"
        value={careStartYear}
        onChange={e => onChange(Number(e.target.value) || currentYear)}
        min={currentYear}
        max={2100}
        step={1}
      />
      <p className="text-xs text-gray-600">Jahr, in dem die Pflegeleistungen beginnen</p>
    </div>
  )
}

interface CareEndYearFieldProps {
  careEndYear: number | null
  currentYear: number
  onChange: (year: number | null) => void
}

function CareEndYearField({ careEndYear, currentYear, onChange }: CareEndYearFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="care-end-year">Ende der Pflegebedürftigkeit (Jahr, leer = dauerhaft)</Label>
      <Input
        id="care-end-year"
        type="number"
        value={careEndYear ?? ''}
        onChange={e => {
          const value = e.target.value
          onChange(value === '' ? null : Number(value) || currentYear)
        }}
        min={currentYear}
        max={2100}
        step={1}
        placeholder="Dauerhaft (bis Lebensende)"
      />
      <p className="text-xs text-gray-600">Leer lassen für dauerhafte Pflegebedürftigkeit</p>
    </div>
  )
}

interface PflegegradFieldProps {
  pflegegrad: 1 | 2 | 3 | 4 | 5
  onChange: (pflegegrad: 1 | 2 | 3 | 4 | 5) => void
}

function PflegegradField({ pflegegrad, onChange }: PflegegradFieldProps) {
  const getPflegegradDescription = (grad: number): string => {
    switch (grad) {
      case 1:
        return 'Geringe Beeinträchtigung der Selbstständigkeit'
      case 2:
        return 'Erhebliche Beeinträchtigung der Selbstständigkeit'
      case 3:
        return 'Schwere Beeinträchtigung der Selbstständigkeit'
      case 4:
        return 'Schwerste Beeinträchtigung der Selbstständigkeit'
      case 5:
        return 'Schwerste Beeinträchtigung mit besonderen Anforderungen'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="pflegegrad">Pflegegrad (1-5)</Label>
      <Input
        id="pflegegrad"
        type="number"
        value={pflegegrad}
        onChange={e => {
          const value = Math.max(1, Math.min(5, Number(e.target.value) || 1))
          onChange(value as 1 | 2 | 3 | 4 | 5)
        }}
        min={1}
        max={5}
        step={1}
      />
      <p className="text-xs text-gray-600">
        Pflegegrad {pflegegrad}: {getPflegegradDescription(pflegegrad)}
      </p>
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
      <Label htmlFor="pflege-birth-year">Geburtsjahr des Versicherten</Label>
      <Input
        id="pflege-birth-year"
        type="number"
        value={birthYear}
        onChange={e => onChange(Number(e.target.value) || new Date().getFullYear() - 40)}
        min={1920}
        max={new Date().getFullYear()}
        step={1}
      />
      <p className="text-xs text-gray-600">Benötigt für die Berechnung des Alters bei Pflegebeginn</p>
    </div>
  )
}

interface MonthlyPremiumFieldProps {
  monthlyPremium: number
  onChange: (premium: number) => void
}

function MonthlyPremiumField({ monthlyPremium, onChange }: MonthlyPremiumFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="monthly-premium">Monatlicher Beitrag (€)</Label>
      <Input
        id="monthly-premium"
        type="number"
        value={monthlyPremium}
        onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
        min={0}
        step={10}
      />
      <p className="text-xs text-gray-600">Monatlich zu zahlender Versicherungsbeitrag</p>
    </div>
  )
}

interface PolicyStartYearFieldProps {
  policyStartYear: number
  onChange: (year: number) => void
}

function PolicyStartYearField({ policyStartYear, onChange }: PolicyStartYearFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="pflege-policy-start-year">Vertragsbeginn (Jahr)</Label>
      <Input
        id="pflege-policy-start-year"
        type="number"
        value={policyStartYear}
        onChange={e => onChange(Number(e.target.value) || new Date().getFullYear())}
        min={1950}
        max={new Date().getFullYear()}
        step={1}
      />
      <p className="text-xs text-gray-600">Jahr, in dem die Versicherung abgeschlossen wurde</p>
    </div>
  )
}

interface TaxBenefitsFieldProps {
  applyTaxBenefits: boolean
  maxAnnualTaxDeduction: number
  onChange: (apply: boolean) => void
}

function TaxBenefitsField({ applyTaxBenefits, maxAnnualTaxDeduction, onChange }: TaxBenefitsFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="tax-benefits" className="text-sm font-medium">
          Steuerliche Absetzbarkeit (§ 10 Abs. 1 Nr. 3 EStG)
        </Label>
        <Switch id="tax-benefits" checked={applyTaxBenefits} onCheckedChange={onChange} />
      </div>
      <p className="text-xs text-gray-600">
        {applyTaxBenefits
          ? `Aktiviert: Beiträge sind als Vorsorgeaufwendungen absetzbar (max. ${maxAnnualTaxDeduction.toLocaleString('de-DE')} € jährlich)`
          : 'Deaktiviert: Keine steuerliche Absetzbarkeit der Beiträge'}
      </p>
    </div>
  )
}

interface MaxAnnualTaxDeductionFieldProps {
  maxAnnualTaxDeduction: number
  applyTaxBenefits: boolean
  onChange: (amount: number) => void
}

function MaxAnnualTaxDeductionField({
  maxAnnualTaxDeduction,
  applyTaxBenefits,
  onChange,
}: MaxAnnualTaxDeductionFieldProps) {
  if (!applyTaxBenefits) return null

  return (
    <div className="space-y-2">
      <Label htmlFor="max-tax-deduction">Maximaler jährlicher Steuerabzug (€)</Label>
      <Input
        id="max-tax-deduction"
        type="number"
        value={maxAnnualTaxDeduction}
        onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
        min={0}
        step={100}
      />
      <p className="text-xs text-gray-600">
        Maximalbetrag der steuerlich absetzbaren Pflegeversicherungsbeiträge pro Jahr
      </p>
    </div>
  )
}

function PflegezusatzversicherungInfoBox({
  pflegegrad,
  monthlyBenefit,
  monthlyPremium,
}: {
  pflegegrad: 1 | 2 | 3 | 4 | 5
  monthlyBenefit: number
  monthlyPremium: number
}) {
  const annualBenefit = monthlyBenefit * 12
  const annualPremium = monthlyPremium * 12
  const netAnnualBenefit = annualBenefit - annualPremium

  const getBenefitInfo = (grad: 1 | 2 | 3 | 4 | 5): string => {
    const baseInfo = {
      1: 'Leichte Unterstützung im Alltag',
      2: 'Teilweise Unterstützung bei alltäglichen Verrichtungen',
      3: 'Umfassende Unterstützung bei den meisten Aktivitäten',
      4: 'Intensive Pflege und Betreuung erforderlich',
      5: 'Vollständige Pflege mit besonderen Anforderungen',
    }
    return baseInfo[grad]
  }

  return (
    <div className="p-3 bg-blue-50 rounded border border-blue-200">
      <p className="text-xs text-blue-800 mb-2">
        <strong>ℹ️ Pflegezusatzversicherung - Übersicht:</strong>
      </p>
      <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
        <li>
          Pflegegrad {pflegegrad}: {getBenefitInfo(pflegegrad)}
        </li>
        <li>Monatliche Leistung: {monthlyBenefit.toLocaleString('de-DE')} €</li>
        <li>Jährliche Leistung: {annualBenefit.toLocaleString('de-DE')} €</li>
        <li>Monatlicher Beitrag: {monthlyPremium.toLocaleString('de-DE')} €</li>
        <li>Jährlicher Beitrag: {annualPremium.toLocaleString('de-DE')} €</li>
        <li>Netto-Nutzen (Leistung - Beitrag): {netAnnualBenefit.toLocaleString('de-DE')} € jährlich</li>
        <li className="font-semibold mt-2">
          💡 Steuerhinweis: Pflegeleistungen sind in Deutschland steuerfrei nach § 3 Nr. 1a EStG
        </li>
      </ul>
    </div>
  )
}

function createPflegezusatzversicherungHandlers(
  editingSource: OtherIncomeSource,
  onUpdate: (source: OtherIncomeSource) => void,
) {
  // Helper to update config
  const updateConfig = (updates: Partial<PflegezusatzversicherungConfig>) => {
    onUpdate({
      ...editingSource,
      pflegezusatzversicherungConfig: {
        ...editingSource.pflegezusatzversicherungConfig!,
        ...updates,
      },
    })
  }

  return {
    handleCareStartYearChange: (careStartYear: number) => {
      onUpdate({
        ...editingSource,
        pflegezusatzversicherungConfig: {
          ...editingSource.pflegezusatzversicherungConfig!,
          careStartYear,
        },
        startYear: careStartYear, // Update income start year
      })
    },
    handleCareEndYearChange: (careEndYear: number | null) => {
      onUpdate({
        ...editingSource,
        pflegezusatzversicherungConfig: {
          ...editingSource.pflegezusatzversicherungConfig!,
          careEndYear,
        },
        endYear: careEndYear, // Update income end year
      })
    },
    handlePflegegradChange: (pflegegrad: 1 | 2 | 3 | 4 | 5) => updateConfig({ pflegegrad }),
    handleBirthYearChange: (birthYear: number) => updateConfig({ birthYear }),
    handleMonthlyPremiumChange: (monthlyPremium: number) => updateConfig({ monthlyPremium }),
    handlePolicyStartYearChange: (policyStartYear: number) => updateConfig({ policyStartYear }),
    handleTaxBenefitsChange: (applyTaxBenefits: boolean) => updateConfig({ applyTaxBenefits }),
    handleMaxAnnualTaxDeductionChange: (maxAnnualTaxDeduction: number) => updateConfig({ maxAnnualTaxDeduction }),
  }
}

// Component to render all form fields
function PflegezusatzversicherungFormFields({
  config,
  currentYear,
  handlers,
}: {
  config: PflegezusatzversicherungConfig
  currentYear: number
  handlers: ReturnType<typeof createPflegezusatzversicherungHandlers>
}) {
  return (
    <>
      <BirthYearField birthYear={config.birthYear} onChange={handlers.handleBirthYearChange} />

      <PolicyStartYearField policyStartYear={config.policyStartYear} onChange={handlers.handlePolicyStartYearChange} />

      <CareStartYearField
        careStartYear={config.careStartYear}
        currentYear={currentYear}
        onChange={handlers.handleCareStartYearChange}
      />

      <CareEndYearField
        careEndYear={config.careEndYear}
        currentYear={currentYear}
        onChange={handlers.handleCareEndYearChange}
      />

      <PflegegradField pflegegrad={config.pflegegrad} onChange={handlers.handlePflegegradChange} />

      <MonthlyPremiumField monthlyPremium={config.monthlyPremium} onChange={handlers.handleMonthlyPremiumChange} />

      <TaxBenefitsField
        applyTaxBenefits={config.applyTaxBenefits}
        maxAnnualTaxDeduction={config.maxAnnualTaxDeduction}
        onChange={handlers.handleTaxBenefitsChange}
      />

      <MaxAnnualTaxDeductionField
        maxAnnualTaxDeduction={config.maxAnnualTaxDeduction}
        applyTaxBenefits={config.applyTaxBenefits}
        onChange={handlers.handleMaxAnnualTaxDeductionChange}
      />
    </>
  )
}

export function PflegezusatzversicherungConfigSection({
  editingSource,
  currentYear,
  onUpdate,
}: PflegezusatzversicherungConfigSectionProps) {
  if (!editingSource.pflegezusatzversicherungConfig) {
    return null
  }

  const handlers = createPflegezusatzversicherungHandlers(editingSource, onUpdate)
  const config = editingSource.pflegezusatzversicherungConfig

  // The monthlyAmount in editingSource represents the monthly benefit
  const monthlyBenefit = editingSource.monthlyAmount

  return (
    <div className="space-y-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
      <h4 className="text-sm font-semibold text-cyan-800 flex items-center gap-2">
        🏥 Pflegezusatzversicherung-spezifische Einstellungen
      </h4>

      <PflegezusatzversicherungFormFields config={config} currentYear={currentYear} handlers={handlers} />

      <PflegezusatzversicherungInfoBox
        pflegegrad={config.pflegegrad}
        monthlyBenefit={monthlyBenefit}
        monthlyPremium={config.monthlyPremium}
      />
    </div>
  )
}
