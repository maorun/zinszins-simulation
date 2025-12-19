import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { useFormId } from '../../utils/unique-id'
import type { PensionComparisonConfig } from '../../../helpers/pension-comparison'
import type { RiesterRenteConfig } from '../../../helpers/riester-rente'
import type { RuerupRenteConfig } from '../../../helpers/ruerup-rente'
import type { BetriebsrenteConfig } from '../../../helpers/betriebsrente'
import { formatCurrency } from '../../utils/currency'

interface PensionComparisonConfigurationProps {
  config: PensionComparisonConfig
  onConfigChange: (config: PensionComparisonConfig) => void
}

export function PensionComparisonConfiguration({
  config,
  onConfigChange,
}: PensionComparisonConfigurationProps) {
  // Generate unique IDs
  const currentYearId = useFormId('pension-comparison', 'current-year')
  const pensionStartYearId = useFormId('pension-comparison', 'pension-start-year')
  const pensionEndYearId = useFormId('pension-comparison', 'pension-end-year')
  const personalTaxRateId = useFormId('pension-comparison', 'personal-tax-rate')
  const pensionTaxRateId = useFormId('pension-comparison', 'pension-tax-rate')
  const annualGrossIncomeId = useFormId('pension-comparison', 'annual-gross-income')
  const socialSecurityRateId = useFormId('pension-comparison', 'social-security-rate')
  const healthInsuranceId = useFormId('pension-comparison', 'health-insurance')
  const hasChildrenId = useFormId('pension-comparison', 'has-children')

  // Pension type enable switches
  const riesterEnabledId = useFormId('pension-comparison', 'riester-enabled')
  const ruerupEnabledId = useFormId('pension-comparison', 'ruerup-enabled')
  const betriebsrenteEnabledId = useFormId('pension-comparison', 'betriebsrente-enabled')

  const handleGeneralConfigChange = (field: keyof PensionComparisonConfig, value: number | boolean) => {
    onConfigChange({ ...config, [field]: value })
  }

  const handleRiesterToggle = (enabled: boolean) => {
    if (enabled) {
      // Create default Riester config
      const riesterConfig: RiesterRenteConfig = {
        enabled: true,
        annualGrossIncome: config.annualGrossIncome,
        annualContribution: 2100, // Maximum Riester contribution
        numberOfChildren: config.hasChildren ? 2 : 0,
        childrenBirthYears: config.hasChildren ? [2015, 2018] : [],
        pensionStartYear: config.pensionStartYear,
        expectedMonthlyPension: 500,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      }
      onConfigChange({ ...config, riesterRente: riesterConfig })
    } else {
      const { riesterRente: _, ...rest } = config
      onConfigChange(rest)
    }
  }

  const handleRuerupToggle = (enabled: boolean) => {
    if (enabled) {
      // Create default Rürup config
      const ruerupConfig: RuerupRenteConfig = {
        enabled: true,
        annualContribution: 5000,
        pensionStartYear: config.pensionStartYear,
        expectedMonthlyPension: 600,
        pensionIncreaseRate: 0.01,
        civilStatus: 'single',
      }
      onConfigChange({ ...config, ruerupRente: ruerupConfig })
    } else {
      const { ruerupRente: _, ...rest } = config
      onConfigChange(rest)
    }
  }

  const handleBetriebsrenteToggle = (enabled: boolean) => {
    if (enabled) {
      // Create default Betriebsrente config
      const betriebsrenteConfig: BetriebsrenteConfig = {
        enabled: true,
        annualEmployeeContribution: 3000,
        annualEmployerContribution: 600, // 20% of employee contribution as subsidy
        pensionStartYear: config.pensionStartYear,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        implementationType: 'direktversicherung',
      }
      onConfigChange({ ...config, betriebsrente: betriebsrenteConfig })
    } else {
      const { betriebsrente: _, ...rest } = config
      onConfigChange(rest)
    }
  }

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

  return (
    <div className="space-y-6">
      {/* General Configuration */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Allgemeine Einstellungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={currentYearId}>Aktuelles Jahr</Label>
            <Input
              id={currentYearId}
              type="number"
              value={config.currentYear}
              onChange={(e) => handleGeneralConfigChange('currentYear', parseInt(e.target.value))}
              min={2020}
              max={2100}
            />
          </div>
          <div>
            <Label htmlFor={annualGrossIncomeId}>Jahresbruttoeinkommen</Label>
            <Input
              id={annualGrossIncomeId}
              type="number"
              value={config.annualGrossIncome}
              onChange={(e) => handleGeneralConfigChange('annualGrossIncome', parseInt(e.target.value))}
              min={0}
              step={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(config.annualGrossIncome)} pro Jahr
            </p>
          </div>
          <div>
            <Label htmlFor={pensionStartYearId}>Rentenbeginn (Jahr)</Label>
            <Input
              id={pensionStartYearId}
              type="number"
              value={config.pensionStartYear}
              onChange={(e) => handleGeneralConfigChange('pensionStartYear', parseInt(e.target.value))}
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
              onChange={(e) => handleGeneralConfigChange('pensionEndYear', parseInt(e.target.value))}
              min={config.pensionStartYear}
              max={2150}
            />
          </div>
          <div>
            <Label htmlFor={personalTaxRateId}>Steuersatz während Erwerbsphase (%)</Label>
            <Input
              id={personalTaxRateId}
              type="number"
              value={(config.personalTaxRate * 100).toFixed(1)}
              onChange={(e) => handleGeneralConfigChange('personalTaxRate', parseFloat(e.target.value) / 100)}
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
              onChange={(e) => handleGeneralConfigChange('pensionTaxRate', parseFloat(e.target.value) / 100)}
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
              onChange={(e) =>
                handleGeneralConfigChange('socialSecurityRate', parseFloat(e.target.value) / 100)
              }
              min={0}
              max={50}
              step={0.5}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id={healthInsuranceId}
              checked={config.inStatutoryHealthInsurance}
              onCheckedChange={(checked) => handleGeneralConfigChange('inStatutoryHealthInsurance', checked)}
            />
            <Label htmlFor={healthInsuranceId}>Gesetzlich krankenversichert</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id={hasChildrenId}
              checked={config.hasChildren}
              onCheckedChange={(checked) => handleGeneralConfigChange('hasChildren', checked)}
            />
            <Label htmlFor={hasChildrenId}>Mit Kindern</Label>
          </div>
        </div>
      </div>

      {/* Pension Type Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Rentenversicherungen aktivieren</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id={riesterEnabledId}
              checked={!!config.riesterRente}
              onCheckedChange={handleRiesterToggle}
            />
            <Label htmlFor={riesterEnabledId}>Riester-Rente (staatlich gefördert)</Label>
          </div>

          {config.riesterRente && <RiesterConfiguration config={config.riesterRente} onChange={handleRiesterConfigChange} />}

          <div className="flex items-center space-x-2">
            <Switch
              id={ruerupEnabledId}
              checked={!!config.ruerupRente}
              onCheckedChange={handleRuerupToggle}
            />
            <Label htmlFor={ruerupEnabledId}>Rürup-Rente (Basis-Rente)</Label>
          </div>

          {config.ruerupRente && <RuerupConfiguration config={config.ruerupRente} onChange={handleRuerupConfigChange} />}

          <div className="flex items-center space-x-2">
            <Switch
              id={betriebsrenteEnabledId}
              checked={!!config.betriebsrente}
              onCheckedChange={handleBetriebsrenteToggle}
            />
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

// Riester Configuration Sub-component
function RiesterConfiguration({
  config,
  onChange,
}: {
  config: RiesterRenteConfig
  onChange: (field: keyof RiesterRenteConfig, value: number | boolean) => void
}) {
  const contributionId = useFormId('riester', 'contribution')
  const pensionId = useFormId('riester', 'pension')
  const childrenId = useFormId('riester', 'children')

  return (
    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-3">
      <div>
        <Label htmlFor={contributionId}>Jährlicher Beitrag</Label>
        <Input
          id={contributionId}
          type="number"
          value={config.annualContribution}
          onChange={(e) => onChange('annualContribution', parseInt(e.target.value))}
          min={0}
          step={100}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.annualContribution)} pro Jahr</p>
      </div>
      <div>
        <Label htmlFor={pensionId}>Erwartete monatliche Rente</Label>
        <Input
          id={pensionId}
          type="number"
          value={config.expectedMonthlyPension}
          onChange={(e) => onChange('expectedMonthlyPension', parseInt(e.target.value))}
          min={0}
          step={50}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.expectedMonthlyPension)} pro Monat</p>
      </div>
      <div>
        <Label htmlFor={childrenId}>Anzahl Kinder</Label>
        <Input
          id={childrenId}
          type="number"
          value={config.numberOfChildren}
          onChange={(e) => onChange('numberOfChildren', parseInt(e.target.value))}
          min={0}
          max={10}
        />
      </div>
    </div>
  )
}

// Rürup Configuration Sub-component
function RuerupConfiguration({
  config,
  onChange,
}: {
  config: RuerupRenteConfig
  onChange: (field: keyof RuerupRenteConfig, value: number | boolean | string) => void
}) {
  const contributionId = useFormId('ruerup', 'contribution')
  const pensionId = useFormId('ruerup', 'pension')

  return (
    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-3">
      <div>
        <Label htmlFor={contributionId}>Jährlicher Beitrag</Label>
        <Input
          id={contributionId}
          type="number"
          value={config.annualContribution}
          onChange={(e) => onChange('annualContribution', parseInt(e.target.value))}
          min={0}
          step={100}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.annualContribution)} pro Jahr</p>
      </div>
      <div>
        <Label htmlFor={pensionId}>Erwartete monatliche Rente</Label>
        <Input
          id={pensionId}
          type="number"
          value={config.expectedMonthlyPension}
          onChange={(e) => onChange('expectedMonthlyPension', parseInt(e.target.value))}
          min={0}
          step={50}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.expectedMonthlyPension)} pro Monat</p>
      </div>
    </div>
  )
}

// Betriebsrente Configuration Sub-component
function BetriebsrenteConfiguration({
  config,
  onChange,
}: {
  config: BetriebsrenteConfig
  onChange: (field: keyof BetriebsrenteConfig, value: number | boolean | string) => void
}) {
  const contributionId = useFormId('betriebsrente', 'contribution')
  const pensionId = useFormId('betriebsrente', 'pension')
  const employerContributionId = useFormId('betriebsrente', 'employer-contribution')

  return (
    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-3">
      <div>
        <Label htmlFor={contributionId}>Jährlicher Arbeitnehmerbeitrag</Label>
        <Input
          id={contributionId}
          type="number"
          value={config.annualEmployeeContribution}
          onChange={(e) => onChange('annualEmployeeContribution', parseInt(e.target.value))}
          min={0}
          step={100}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formatCurrency(config.annualEmployeeContribution)} pro Jahr
        </p>
      </div>
      <div>
        <Label htmlFor={employerContributionId}>Jährlicher Arbeitgeberbeitrag</Label>
        <Input
          id={employerContributionId}
          type="number"
          value={config.annualEmployerContribution}
          onChange={(e) => onChange('annualEmployerContribution', parseInt(e.target.value))}
          min={0}
          step={100}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formatCurrency(config.annualEmployerContribution)} Arbeitgeberzuschuss
        </p>
      </div>
      <div>
        <Label htmlFor={pensionId}>Erwartete monatliche Rente</Label>
        <Input
          id={pensionId}
          type="number"
          value={config.expectedMonthlyPension}
          onChange={(e) => onChange('expectedMonthlyPension', parseInt(e.target.value))}
          min={0}
          step={50}
        />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(config.expectedMonthlyPension)} pro Monat</p>
      </div>
    </div>
  )
}
