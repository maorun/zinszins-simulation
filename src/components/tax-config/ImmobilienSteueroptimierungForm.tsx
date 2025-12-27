import { useMemo } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { generateFormId } from '../../utils/unique-id'
import type { RentalPropertyConfig } from '../../../helpers/immobilien-steueroptimierung'

interface ImmobilienSteueroptimierungFormProps {
  config: RentalPropertyConfig
  personalTaxRate: number
  useAutomaticExpenses: boolean
  automaticExpenses: {
    maintenanceCosts: number
    managementCosts: number
    propertyTax: number
    buildingInsurance: number
  }
  validationErrors: string[]
  guenstigerPruefungAktiv: boolean
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
  onPersonalTaxRateChange: (rate: number) => void
  onUseAutomaticExpensesChange: (use: boolean) => void
}

function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="font-medium text-red-900 mb-2">⚠️ Validierungsfehler:</p>
      <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  )
}

function BuildingValueInputs({
  config,
  onConfigChange,
}: {
  config: RentalPropertyConfig
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
}) {
  const buildingValueId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'building-value'), [])
  const landValueId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'land-value'), [])

  return (
    <>
      <div>
        <Label htmlFor={buildingValueId}>Gebäudewert (ohne Grundstück) *</Label>
        <Input
          id={buildingValueId}
          type="number"
          value={config.buildingValue}
          onChange={(e) => onConfigChange({ buildingValue: Number(e.target.value) })}
          min={0}
          step={1000}
        />
        <p className="text-xs text-slate-600 mt-1">Nur der Gebäudewert kann abgeschrieben werden</p>
      </div>
      <div>
        <Label htmlFor={landValueId}>Grundstückswert</Label>
        <Input
          id={landValueId}
          type="number"
          value={config.landValue}
          onChange={(e) => onConfigChange({ landValue: Number(e.target.value) })}
          min={0}
          step={1000}
        />
        <p className="text-xs text-slate-600 mt-1">Land kann nicht abgeschrieben werden</p>
      </div>
    </>
  )
}

function RentAndTaxInputs({
  config,
  personalTaxRate,
  guenstigerPruefungAktiv,
  onConfigChange,
  onPersonalTaxRateChange,
}: {
  config: RentalPropertyConfig
  personalTaxRate: number
  guenstigerPruefungAktiv: boolean
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
  onPersonalTaxRateChange: (rate: number) => void
}) {
  const annualRentId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'annual-rent'), [])
  const taxRateId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'personal-tax-rate'), [])

  return (
    <>
      <div>
        <Label htmlFor={annualRentId}>Jährliche Mieteinnahmen *</Label>
        <Input
          id={annualRentId}
          type="number"
          value={config.annualRent}
          onChange={(e) => onConfigChange({ annualRent: Number(e.target.value) })}
          min={0}
          step={100}
        />
      </div>
      <div>
        <Label htmlFor={taxRateId}>
          Persönlicher Steuersatz {guenstigerPruefungAktiv ? '(wird durch Günstigerprüfung ggf. verwendet)' : ''}
        </Label>
        <Input
          id={taxRateId}
          type="number"
          value={personalTaxRate * 100}
          onChange={(e) => onPersonalTaxRateChange(Number(e.target.value) / 100)}
          min={0}
          max={100}
          step={1}
        />
        <p className="text-xs text-slate-600 mt-1">In Prozent (z.B. 42 für 42%)</p>
      </div>
    </>
  )
}

function YearInputs({
  config,
  onConfigChange,
}: {
  config: RentalPropertyConfig
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
}) {
  const purchaseYearId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'purchase-year'), [])
  const buildingYearId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'building-year'), [])
  const currentYear = new Date().getFullYear()

  return (
    <>
      <div>
        <Label htmlFor={purchaseYearId}>Kaufjahr *</Label>
        <Input
          id={purchaseYearId}
          type="number"
          value={config.purchaseYear}
          onChange={(e) => onConfigChange({ purchaseYear: Number(e.target.value) })}
          min={1900}
          max={currentYear + 1}
        />
      </div>
      <div>
        <Label htmlFor={buildingYearId}>Baujahr (für AfA-Satz)</Label>
        <Input
          id={buildingYearId}
          type="number"
          value={config.buildingYear || ''}
          onChange={(e) => onConfigChange({ buildingYear: e.target.value ? Number(e.target.value) : undefined })}
          min={1800}
          max={currentYear + 5}
          placeholder="Optional"
        />
        <p className="text-xs text-slate-600 mt-1">&lt; 1925: 2,5% | 1925-2022: 2% | ≥ 2023: 3%</p>
      </div>
    </>
  )
}

function PropertyBasicData({
  config,
  personalTaxRate,
  guenstigerPruefungAktiv,
  onConfigChange,
  onPersonalTaxRateChange,
}: {
  config: RentalPropertyConfig
  personalTaxRate: number
  guenstigerPruefungAktiv: boolean
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
  onPersonalTaxRateChange: (rate: number) => void
}) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
      <h4 className="font-medium text-slate-900 mb-3">🏢 Immobilien-Grunddaten</h4>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <BuildingValueInputs config={config} onConfigChange={onConfigChange} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <RentAndTaxInputs
            config={config}
            personalTaxRate={personalTaxRate}
            guenstigerPruefungAktiv={guenstigerPruefungAktiv}
            onConfigChange={onConfigChange}
            onPersonalTaxRateChange={onPersonalTaxRateChange}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <YearInputs config={config} onConfigChange={onConfigChange} />
        </div>
      </div>
    </div>
  )
}

function MaintenanceInputs({
  config,
  useAutomaticExpenses,
  automaticExpenses,
  onConfigChange,
}: {
  config: RentalPropertyConfig
  useAutomaticExpenses: boolean
  automaticExpenses: { maintenanceCosts: number; managementCosts: number }
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
}) {
  const maintenanceId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'maintenance-costs'), [])
  const managementId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'management-costs'), [])

  return (
    <>
      <div>
        <Label htmlFor={maintenanceId}>Instandhaltungskosten</Label>
        <Input
          id={maintenanceId}
          type="number"
          value={useAutomaticExpenses ? automaticExpenses.maintenanceCosts : config.maintenanceCosts || 0}
          onChange={(e) => onConfigChange({ maintenanceCosts: Number(e.target.value) })}
          min={0}
          step={100}
          disabled={useAutomaticExpenses}
        />
      </div>
      <div>
        <Label htmlFor={managementId}>Verwaltungskosten</Label>
        <Input
          id={managementId}
          type="number"
          value={useAutomaticExpenses ? automaticExpenses.managementCosts : config.managementCosts || 0}
          onChange={(e) => onConfigChange({ managementCosts: Number(e.target.value) })}
          min={0}
          step={100}
          disabled={useAutomaticExpenses}
        />
      </div>
    </>
  )
}

function TaxAndInterestInputs({
  config,
  useAutomaticExpenses,
  automaticExpenses,
  onConfigChange,
}: {
  config: RentalPropertyConfig
  useAutomaticExpenses: boolean
  automaticExpenses: { propertyTax: number }
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
}) {
  const mortgageId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'mortgage-interest'), [])
  const propertyTaxId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'property-tax'), [])

  return (
    <>
      <div>
        <Label htmlFor={mortgageId}>Darlehenszinsen (pro Jahr)</Label>
        <Input
          id={mortgageId}
          type="number"
          value={config.mortgageInterest || 0}
          onChange={(e) => onConfigChange({ mortgageInterest: Number(e.target.value) })}
          min={0}
          step={100}
        />
        <p className="text-xs text-amber-800 mt-1">Nur Zinsen, nicht die Tilgung</p>
      </div>
      <div>
        <Label htmlFor={propertyTaxId}>Grundsteuer</Label>
        <Input
          id={propertyTaxId}
          type="number"
          value={useAutomaticExpenses ? automaticExpenses.propertyTax : config.propertyTax || 0}
          onChange={(e) => onConfigChange({ propertyTax: Number(e.target.value) })}
          min={0}
          step={10}
          disabled={useAutomaticExpenses}
        />
      </div>
    </>
  )
}

function InsuranceAndOtherInputs({
  config,
  useAutomaticExpenses,
  automaticExpenses,
  onConfigChange,
}: {
  config: RentalPropertyConfig
  useAutomaticExpenses: boolean
  automaticExpenses: { buildingInsurance: number }
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
}) {
  const insuranceId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'building-insurance'), [])
  const otherId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'other-expenses'), [])

  return (
    <>
      <div>
        <Label htmlFor={insuranceId}>Gebäudeversicherung</Label>
        <Input
          id={insuranceId}
          type="number"
          value={useAutomaticExpenses ? automaticExpenses.buildingInsurance : config.buildingInsurance || 0}
          onChange={(e) => onConfigChange({ buildingInsurance: Number(e.target.value) })}
          min={0}
          step={10}
          disabled={useAutomaticExpenses}
        />
      </div>
      <div>
        <Label htmlFor={otherId}>Sonstige Ausgaben</Label>
        <Input
          id={otherId}
          type="number"
          value={config.otherExpenses || 0}
          onChange={(e) => onConfigChange({ otherExpenses: Number(e.target.value) })}
          min={0}
          step={10}
        />
        <p className="text-xs text-amber-800 mt-1">Z.B. Hausmeister, Schornsteinfeger</p>
      </div>
    </>
  )
}

function AutomaticExpenseInfo({ automaticExpenses }: { automaticExpenses: { maintenanceCosts: number; managementCosts: number; propertyTax: number; buildingInsurance: number } }) {
  return (
    <div className="mb-3 p-3 bg-amber-100 border border-amber-300 rounded text-xs text-amber-900">
      <p className="font-medium mb-1">💡 Automatische Schätzung basierend auf Marktdaten:</p>
      <ul className="space-y-1 ml-4 list-disc">
        <li>Instandhaltung: ~10% der Miete ({automaticExpenses.maintenanceCosts.toFixed(0)} €)</li>
        <li>Verwaltung: ~15% der Miete ({automaticExpenses.managementCosts.toFixed(0)} €)</li>
        <li>Grundsteuer: ~20% der Miete ({automaticExpenses.propertyTax.toFixed(0)} €)</li>
        <li>Versicherung: ~8% der Miete ({automaticExpenses.buildingInsurance.toFixed(0)} €)</li>
      </ul>
    </div>
  )
}

function ExpenseInputGrids({
  config,
  useAutomaticExpenses,
  automaticExpenses,
  onConfigChange,
}: {
  config: RentalPropertyConfig
  useAutomaticExpenses: boolean
  automaticExpenses: { maintenanceCosts: number; managementCosts: number; propertyTax: number; buildingInsurance: number }
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <MaintenanceInputs
          config={config}
          useAutomaticExpenses={useAutomaticExpenses}
          automaticExpenses={automaticExpenses}
          onConfigChange={onConfigChange}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TaxAndInterestInputs
          config={config}
          useAutomaticExpenses={useAutomaticExpenses}
          automaticExpenses={automaticExpenses}
          onConfigChange={onConfigChange}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <InsuranceAndOtherInputs
          config={config}
          useAutomaticExpenses={useAutomaticExpenses}
          automaticExpenses={automaticExpenses}
          onConfigChange={onConfigChange}
        />
      </div>
    </div>
  )
}

function WerbungskostenSection({
  config,
  useAutomaticExpenses,
  automaticExpenses,
  onConfigChange,
  onUseAutomaticExpensesChange,
}: {
  config: RentalPropertyConfig
  useAutomaticExpenses: boolean
  automaticExpenses: { maintenanceCosts: number; managementCosts: number; propertyTax: number; buildingInsurance: number }
  onConfigChange: (updates: Partial<RentalPropertyConfig>) => void
  onUseAutomaticExpensesChange: (use: boolean) => void
}) {
  const autoExpensesId = useMemo(() => generateFormId('immobilien-steueroptimierung', 'automatic-expenses'), [])

  return (
    <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-amber-900">📋 Werbungskosten (Jährlich)</h4>
        <div className="flex items-center gap-2">
          <Switch id={autoExpensesId} checked={useAutomaticExpenses} onCheckedChange={onUseAutomaticExpensesChange} />
          <Label htmlFor={autoExpensesId} className="text-sm cursor-pointer">
            Automatisch schätzen
          </Label>
        </div>
      </div>
      {useAutomaticExpenses && <AutomaticExpenseInfo automaticExpenses={automaticExpenses} />}
      <ExpenseInputGrids
        config={config}
        useAutomaticExpenses={useAutomaticExpenses}
        automaticExpenses={automaticExpenses}
        onConfigChange={onConfigChange}
      />
    </div>
  )
}

export function ImmobilienSteueroptimierungForm({
  config,
  personalTaxRate,
  useAutomaticExpenses,
  automaticExpenses,
  validationErrors,
  guenstigerPruefungAktiv,
  onConfigChange,
  onPersonalTaxRateChange,
  onUseAutomaticExpensesChange,
}: ImmobilienSteueroptimierungFormProps) {
  return (
    <div className="space-y-6">
      <ValidationErrors errors={validationErrors} />
      <PropertyBasicData
        config={config}
        personalTaxRate={personalTaxRate}
        guenstigerPruefungAktiv={guenstigerPruefungAktiv}
        onConfigChange={onConfigChange}
        onPersonalTaxRateChange={onPersonalTaxRateChange}
      />
      <WerbungskostenSection
        config={config}
        useAutomaticExpenses={useAutomaticExpenses}
        automaticExpenses={automaticExpenses}
        onConfigChange={onConfigChange}
        onUseAutomaticExpensesChange={onUseAutomaticExpensesChange}
      />
    </div>
  )
}
