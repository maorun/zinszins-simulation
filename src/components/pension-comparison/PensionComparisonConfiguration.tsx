import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { useFormId } from '../../utils/unique-id'
import type { PensionComparisonConfig } from '../../../helpers/pension-comparison'
import type { RiesterRenteConfig } from '../../../helpers/riester-rente'
import type { RuerupRenteConfig } from '../../../helpers/ruerup-rente'
import type { BetriebsrenteConfig } from '../../../helpers/betriebsrente'
import { formatCurrency } from '../../utils/currency'
import {
  RiesterConfiguration,
  RuerupConfiguration,
  BetriebsrenteConfiguration,
} from './PensionTypeConfigurations'

interface PensionComparisonConfigurationProps {
  config: PensionComparisonConfig
  onConfigChange: (config: PensionComparisonConfig) => void
}

function YearInputs({
  config,
  onChange,
}: {
  config: PensionComparisonConfig
  onChange: (field: keyof PensionComparisonConfig, value: number) => void
}) {
  const currentYearId = useFormId('pension-comparison', 'current-year')
  const pensionStartYearId = useFormId('pension-comparison', 'pension-start-year')
  const pensionEndYearId = useFormId('pension-comparison', 'pension-end-year')

  return (
    <>
      <div>
        <Label htmlFor={currentYearId}>Aktuelles Jahr</Label>
        <Input
          id={currentYearId}
          type="number"
          value={config.currentYear}
          onChange={(e) => onChange('currentYear', parseInt(e.target.value) || 0)}
          min={2020}
          max={2100}
        />
      </div>
      <div>
        <Label htmlFor={pensionStartYearId}>Rentenbeginn (Jahr)</Label>
        <Input
          id={pensionStartYearId}
          type="number"
          value={config.pensionStartYear}
          onChange={(e) => onChange('pensionStartYear', parseInt(e.target.value) || 0)}
          min={config.currentYear}
          max={2100}
        />
      </div>
      <div>
        <Label htmlFor={pensionEndYearId}>Rentenende (Jahr)</Label>
        <Input
          id={pensionEndYearId}
          type="number"
          value={config.pensionEndYear}
          onChange={(e) => onChange('pensionEndYear', parseInt(e.target.value) || 0)}
          min={config.pensionStartYear}
          max={2150}
        />
      </div>
    </>
  )
}

function TaxRateInputs({ config, onChange }: {
  config: PensionComparisonConfig
  onChange: (field: keyof PensionComparisonConfig, value: number) => void
}) {
  const personalTaxRateId = useFormId('pension-comparison', 'personal-tax-rate')
  const pensionTaxRateId = useFormId('pension-comparison', 'pension-tax-rate')
  const socialSecurityRateId = useFormId('pension-comparison', 'social-security-rate')
  return (
    <>
      <div>
        <Label htmlFor={personalTaxRateId}>Steuersatz während Erwerbsphase (%)</Label>
        <Input
          id={personalTaxRateId}
          type="number"
          value={(config.personalTaxRate * 100).toFixed(1)}
          onChange={(e) => onChange('personalTaxRate', parseFloat(e.target.value) || 0 / 100)}
          min={0}
          max={50}
          step={0.5}
        />
      </div>
      <div>
        <Label htmlFor={pensionTaxRateId}>Steuersatz während Rente (%)</Label>
        <Input
          id={pensionTaxRateId}
          type="number"
          value={(config.pensionTaxRate * 100).toFixed(1)}
          onChange={(e) => onChange('pensionTaxRate', parseFloat(e.target.value) || 0 / 100)}
          min={0}
          max={50}
          step={0.5}
        />
      </div>
      <div>
        <Label htmlFor={socialSecurityRateId}>Sozialversicherungssatz (%)</Label>
        <Input
          id={socialSecurityRateId}
          type="number"
          value={(config.socialSecurityRate * 100).toFixed(1)}
          onChange={(e) => onChange('socialSecurityRate', parseFloat(e.target.value) || 0 / 100)}
          min={0}
          max={50}
          step={0.5}
        />
      </div>
    </>
  )
}

function BooleanSwitches({
  config,
  onChange,
}: {
  config: PensionComparisonConfig
  onChange: (field: keyof PensionComparisonConfig, value: boolean) => void
}) {
  const healthInsuranceId = useFormId('pension-comparison', 'health-insurance')
  const hasChildrenId = useFormId('pension-comparison', 'has-children')

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id={healthInsuranceId}
          checked={config.inStatutoryHealthInsurance}
          onCheckedChange={(checked) => onChange('inStatutoryHealthInsurance', checked)}
        />
        <Label htmlFor={healthInsuranceId}>Gesetzlich krankenversichert</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id={hasChildrenId}
          checked={config.hasChildren}
          onCheckedChange={(checked) => onChange('hasChildren', checked)}
        />
        <Label htmlFor={hasChildrenId}>Mit Kindern</Label>
      </div>
    </>
  )
}

function GeneralConfiguration({
  config,
  onChange,
}: {
  config: PensionComparisonConfig
  onChange: (field: keyof PensionComparisonConfig, value: number | boolean) => void
}) {
  const annualGrossIncomeId = useFormId('pension-comparison', 'annual-gross-income')

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Allgemeine Einstellungen</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <YearInputs config={config} onChange={(f, v) => onChange(f, v)} />
        <div>
          <Label htmlFor={annualGrossIncomeId}>Jahresbruttoeinkommen</Label>
          <Input
            id={annualGrossIncomeId}
            type="number"
            value={config.annualGrossIncome}
            onChange={(e) => onChange('annualGrossIncome', parseInt(e.target.value) || 0)}
            min={0}
            step={1000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(config.annualGrossIncome)} pro Jahr
          </p>
        </div>
        <TaxRateInputs config={config} onChange={(f, v) => onChange(f, v)} />
        <BooleanSwitches config={config} onChange={(f, v) => onChange(f, v)} />
      </div>
    </div>
  )
}

function createRiesterConfig(config: PensionComparisonConfig): RiesterRenteConfig {
  return {
    enabled: true,
    annualGrossIncome: config.annualGrossIncome,
    annualContribution: 2100,
    numberOfChildren: config.hasChildren ? 2 : 0,
    childrenBirthYears: config.hasChildren ? [2015, 2018] : [],
    pensionStartYear: config.pensionStartYear,
    expectedMonthlyPension: 500,
    pensionIncreaseRate: 0.01,
    useWohnRiester: false,
  }
}

function createRuerupConfig(config: PensionComparisonConfig): RuerupRenteConfig {
  return {
    enabled: true,
    annualContribution: 5000,
    pensionStartYear: config.pensionStartYear,
    expectedMonthlyPension: 600,
    pensionIncreaseRate: 0.01,
    civilStatus: 'single',
  }
}

function createBetriebsrenteConfig(config: PensionComparisonConfig): BetriebsrenteConfig {
  return {
    enabled: true,
    annualEmployeeContribution: 3000,
    annualEmployerContribution: 600,
    pensionStartYear: config.pensionStartYear,
    expectedMonthlyPension: 400,
    pensionIncreaseRate: 0.01,
    implementationType: 'direktversicherung',
  }
}

function usePensionTypeToggles(config: PensionComparisonConfig, onConfigChange: (config: PensionComparisonConfig) => void) {
  const handleRiesterToggle = (enabled: boolean) => {
    if (enabled) {
      onConfigChange({ ...config, riesterRente: createRiesterConfig(config) })
    } else {
      const { riesterRente: _, ...rest } = config
      onConfigChange(rest)
    }
  }

  const handleRuerupToggle = (enabled: boolean) => {
    if (enabled) {
      onConfigChange({ ...config, ruerupRente: createRuerupConfig(config) })
    } else {
      const { ruerupRente: _, ...rest } = config
      onConfigChange(rest)
    }
  }

  const handleBetriebsrenteToggle = (enabled: boolean) => {
    if (enabled) {
      onConfigChange({ ...config, betriebsrente: createBetriebsrenteConfig(config) })
    } else {
      const { betriebsrente: _, ...rest } = config
      onConfigChange(rest)
    }
  }

  return { handleRiesterToggle, handleRuerupToggle, handleBetriebsrenteToggle }
}

function usePensionConfigHandlers(
  config: PensionComparisonConfig,
  onConfigChange: (config: PensionComparisonConfig) => void,
) {
  const handleRiesterConfigChange = (field: keyof RiesterRenteConfig, value: number | boolean) => {
    if (!config.riesterRente) return
    onConfigChange({
      ...config,
      riesterRente: { ...config.riesterRente, [field]: value },
    })
  }
  const handleRuerupConfigChange = (field: keyof RuerupRenteConfig, value: number | boolean | string) => {
    if (!config.ruerupRente) return
    onConfigChange({
      ...config,
      ruerupRente: { ...config.ruerupRente, [field]: value },
    })
  }
  const handleBetriebsrenteConfigChange = (
    field: keyof BetriebsrenteConfig,
    value: number | boolean | string,
  ) => {
    if (!config.betriebsrente) return
    onConfigChange({
      ...config,
      betriebsrente: { ...config.betriebsrente, [field]: value },
    })
  }
  return { handleRiesterConfigChange, handleRuerupConfigChange, handleBetriebsrenteConfigChange }
}

export function PensionComparisonConfiguration({
  config,
  onConfigChange,
}: PensionComparisonConfigurationProps) {
  const riesterEnabledId = useFormId('pension-comparison', 'riester-enabled')
  const ruerupEnabledId = useFormId('pension-comparison', 'ruerup-enabled')
  const betriebsrenteEnabledId = useFormId('pension-comparison', 'betriebsrente-enabled')
  const { handleRiesterToggle, handleRuerupToggle, handleBetriebsrenteToggle } = usePensionTypeToggles(config, onConfigChange)
  const { handleRiesterConfigChange, handleRuerupConfigChange, handleBetriebsrenteConfigChange } =
    usePensionConfigHandlers(config, onConfigChange)
  const handleGeneralConfigChange = (field: keyof PensionComparisonConfig, value: number | boolean) => {
    onConfigChange({ ...config, [field]: value })
  }
  return (
    <div className="space-y-6">
      <GeneralConfiguration config={config} onChange={handleGeneralConfigChange} />
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Rentenversicherungen aktivieren</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch id={riesterEnabledId} checked={!!config.riesterRente} onCheckedChange={handleRiesterToggle} />
            <Label htmlFor={riesterEnabledId}>Riester-Rente (staatlich gefördert)</Label>
          </div>
          {config.riesterRente && <RiesterConfiguration config={config.riesterRente} onChange={handleRiesterConfigChange} />}
          <div className="flex items-center space-x-2">
            <Switch id={ruerupEnabledId} checked={!!config.ruerupRente} onCheckedChange={handleRuerupToggle} />
            <Label htmlFor={ruerupEnabledId}>Rürup-Rente (Basis-Rente)</Label>
          </div>
          {config.ruerupRente && <RuerupConfiguration config={config.ruerupRente} onChange={handleRuerupConfigChange} />}
          <div className="flex items-center space-x-2">
            <Switch id={betriebsrenteEnabledId} checked={!!config.betriebsrente} onCheckedChange={handleBetriebsrenteToggle} />
            <Label htmlFor={betriebsrenteEnabledId}>Betriebsrente (bAV)</Label>
          </div>
          {config.betriebsrente && (
            <BetriebsrenteConfiguration config={config.betriebsrente} onChange={handleBetriebsrenteConfigChange} />
          )}
        </div>
      </div>
    </div>
  )
}
