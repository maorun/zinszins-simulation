import { Info } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { calculateRetirementStartYear } from '../../helpers/statutory-pension'
import { formatCurrency } from '../utils/currency'
import { 
  calculateHealthCareInsuranceForYear, 
  calculateCoupleHealthInsuranceForYear,
  createDefaultHealthCareInsuranceConfig
} from '../../helpers/health-care-insurance'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { RadioTile, RadioTileGroup } from './ui/radio-tile'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'

interface HealthCareInsuranceFormValues {
  enabled: boolean
  planningMode: 'individual' | 'couple'
  insuranceType: 'statutory' | 'private'
  includeEmployerContribution: boolean
  statutoryHealthInsuranceRate: number
  statutoryCareInsuranceRate: number
  statutoryMinimumIncomeBase: number
  statutoryMaximumIncomeBase: number
  privateHealthInsuranceMonthly: number
  privateCareInsuranceMonthly: number
  privateInsuranceInflationRate: number
  retirementStartYear: number
  additionalCareInsuranceForChildless: boolean
  additionalCareInsuranceAge: number
  // Couple-specific fields
  coupleStrategy?: 'individual' | 'family' | 'optimize'
  familyInsuranceThresholdRegular?: number
  familyInsuranceThresholdMiniJob?: number
  person1Name?: string
  person1WithdrawalShare?: number
  person1OtherIncomeAnnual?: number
  person1AdditionalCareInsuranceForChildless?: boolean
  person2Name?: string
  person2WithdrawalShare?: number
  person2OtherIncomeAnnual?: number
  person2AdditionalCareInsuranceForChildless?: boolean
}

interface HealthCareInsuranceChangeHandlers {
  onEnabledChange: (enabled: boolean) => void
  onInsuranceTypeChange: (type: 'statutory' | 'private') => void
  onIncludeEmployerContributionChange: (include: boolean) => void
  onStatutoryHealthInsuranceRateChange: (rate: number) => void
  onStatutoryCareInsuranceRateChange: (rate: number) => void
  onStatutoryMinimumIncomeBaseChange: (amount: number) => void
  onStatutoryMaximumIncomeBaseChange: (amount: number) => void
  onPrivateHealthInsuranceMonthlyChange: (amount: number) => void
  onPrivateCareInsuranceMonthlyChange: (amount: number) => void
  onPrivateInsuranceInflationRateChange: (rate: number) => void
  onRetirementStartYearChange: (year: number) => void
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onAdditionalCareInsuranceAgeChange: (age: number) => void
  // Couple-specific handlers
  onCoupleStrategyChange?: (strategy: 'individual' | 'family' | 'optimize') => void
  onFamilyInsuranceThresholdRegularChange?: (amount: number) => void
  onFamilyInsuranceThresholdMiniJobChange?: (amount: number) => void
  onPerson1NameChange?: (name: string) => void
  onPerson1WithdrawalShareChange?: (share: number) => void
  onPerson1OtherIncomeAnnualChange?: (amount: number) => void
  onPerson1AdditionalCareInsuranceForChildlessChange?: (enabled: boolean) => void
  onPerson2NameChange?: (name: string) => void
  onPerson2WithdrawalShareChange?: (share: number) => void
  onPerson2OtherIncomeAnnualChange?: (amount: number) => void
  onPerson2AdditionalCareInsuranceForChildlessChange?: (enabled: boolean) => void
}

interface HealthCareInsuranceConfigurationProps {
  values: HealthCareInsuranceFormValues
  onChange: HealthCareInsuranceChangeHandlers
  currentYear?: number
  // Birth year information for automatic retirement calculation
  birthYear?: number
  spouseBirthYear?: number
  planningMode: 'individual' | 'couple'
}

export function HealthCareInsuranceConfiguration({
  values,
  onChange,
  currentYear: _currentYear = new Date().getFullYear(),
  birthYear,
  spouseBirthYear,
  planningMode,
}: HealthCareInsuranceConfigurationProps) {
  // Auto-calculate retirement start year when birth year changes
  useEffect(() => {
    const calculatedStartYear = calculateRetirementStartYear(
      planningMode,
      birthYear,
      spouseBirthYear,
      67, // Default retirement age
      67, // Default retirement age for spouse
    )

    if (calculatedStartYear && calculatedStartYear !== values.retirementStartYear) {
      onChange.onRetirementStartYearChange(calculatedStartYear)
    }
  }, [birthYear, spouseBirthYear, planningMode, values.retirementStartYear, onChange])

  if (!values.enabled) {
    return (
      <CollapsibleCard>
        <CollapsibleCardHeader>
          🏥 Kranken- und Pflegeversicherung
        </CollapsibleCardHeader>
        <CollapsibleCardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={values.enabled}
                onCheckedChange={onChange.onEnabledChange}
                id="health-care-insurance-enabled"
              />
              <Label htmlFor="health-care-insurance-enabled">
                Kranken- und Pflegeversicherung berücksichtigen
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              Aktivieren Sie diese Option, um Kranken- und Pflegeversicherungsbeiträge in die
              Entnahmeplanung einzubeziehen. Berücksichtigt unterschiedliche Versicherungsarten und
              Beitragssätze.
            </div>
          </div>
        </CollapsibleCardContent>
      </CollapsibleCard>
    )
  }

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>
        🏥 Kranken- und Pflegeversicherung
        <span className="text-sm font-normal text-muted-foreground">
          (
          {values.insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat'}
          )
        </span>
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        {/* Enable/Disable Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={values.enabled}
            onCheckedChange={onChange.onEnabledChange}
            id="health-care-insurance-enabled-full"
          />
          <Label htmlFor="health-care-insurance-enabled-full">
            Kranken- und Pflegeversicherung berücksichtigen
          </Label>
        </div>

        {/* Planning Mode Info (derived from global planning) */}
        {planningMode === 'couple' && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-900">
              💑 Paarplanung aktiviert
            </div>
            <div className="text-xs text-blue-700 mt-1">
              Planungsmodus wird aus der globalen Planung übernommen
            </div>
          </div>
        )}

        {/* Insurance Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Versicherungsart</Label>
          <RadioTileGroup
            value={values.insuranceType}
            onValueChange={value => onChange.onInsuranceTypeChange(value as 'statutory' | 'private')}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <RadioTile value="statutory" label="Gesetzliche Krankenversicherung">
              Prozentuale Beiträge basierend auf Einkommen mit festen Sätzen
            </RadioTile>
            <RadioTile value="private" label="Private Krankenversicherung">
              Feste monatliche Beiträge mit Inflationsanpassung
            </RadioTile>
          </RadioTileGroup>
        </div>

        {/* Automatic Retirement Start Year Display */}
        <div className="space-y-2">
          <Label>Rentenbeginn (automatisch berechnet)</Label>
          <div className="p-3 border rounded-lg bg-green-50">
            {planningMode === 'individual' ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Basierend auf Geburtsjahr aus Globaler Planung:</span>
                  <div className="font-medium">{birthYear || 'Nicht festgelegt'}</div>
                </div>
                <div className="text-lg font-bold text-green-800">
                  Rentenbeginn:
                  {' '}
                  {birthYear ? values.retirementStartYear : '—'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Person 1:</span>
                    <div className="font-medium">{birthYear || 'Nicht festgelegt'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Person 2:</span>
                    <div className="font-medium">{spouseBirthYear || 'Nicht festgelegt'}</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-800">
                  Rentenbeginn (frühester):
                  {' '}
                  {(birthYear && spouseBirthYear) ? values.retirementStartYear : '—'}
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              Jahr ab dem die Rentnerregelungen gelten (berechnet mit Renteneintrittsalter 67)
            </div>
            {!birthYear || (planningMode === 'couple' && !spouseBirthYear) ? (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200 mt-2">
                Bitte Geburtsjahr(e) in der Globalen Planung festlegen
              </div>
            ) : null}
          </div>
        </div>

        {/* Statutory Insurance Configuration */}
        {values.insuranceType === 'statutory' && (
          <div className="space-y-6">
            {/* Employer Contribution Setting */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={values.includeEmployerContribution}
                  onCheckedChange={onChange.onIncludeEmployerContributionChange}
                  id="include-employer-contribution"
                />
                <Label htmlFor="include-employer-contribution">
                  Arbeitgeberanteil in Entnahme-Phase berücksichtigen
                </Label>
              </div>
              <div className="text-xs text-muted-foreground">
                Standard: Arbeitgeberanteil muss in der Entnahme-Phase selbst getragen werden.
                Deaktivieren Sie diese Option, wenn nur der Arbeitnehmeranteil gezahlt wird.
              </div>
            </div>

            {/* Statutory Rates */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Gesetzliche Beitragssätze (Deutschland 2024)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statutory-health-rate">
                    Krankenversicherung:
                    {' '}
                    {values.statutoryHealthInsuranceRate.toFixed(2)}
                    %
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    Gesetzlich festgelegt: 14,6% (7,3% Arbeitnehmer + 7,3% Arbeitgeber)
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statutory-care-rate">
                    Pflegeversicherung:
                    {' '}
                    {values.statutoryCareInsuranceRate.toFixed(2)}
                    %
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    Gesetzlich festgelegt: 3,05% (+ 0,6% für Kinderlose)
                  </div>
                </div>
              </div>
            </div>

            {/* Income Limits */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm">Beitragsbemessungsgrenzen</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statutory-min-income">
                    Mindestbeitragsbemessungsgrundlage (jährlich)
                  </Label>
                  <Input
                    id="statutory-min-income"
                    type="number"
                    min="0"
                    step="100"
                    value={values.statutoryMinimumIncomeBase}
                    onChange={e => onChange.onStatutoryMinimumIncomeBaseChange(Number(e.target.value))}
                  />
                  <div className="text-xs text-muted-foreground">
                    Mindestbeitrag wird auch bei geringerem Einkommen erhoben
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statutory-max-income">
                    Beitragsbemessungsgrenze (jährlich)
                  </Label>
                  <Input
                    id="statutory-max-income"
                    type="number"
                    min="0"
                    step="1000"
                    value={values.statutoryMaximumIncomeBase}
                    onChange={e => onChange.onStatutoryMaximumIncomeBaseChange(Number(e.target.value))}
                  />
                  <div className="text-xs text-muted-foreground">
                    Maximale Beitragsbemessungsgrundlage (2024: 62.550€)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Private Insurance Configuration */}
        {values.insuranceType === 'private' && (
          <div className="space-y-6">
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-sm">Private Versicherungsbeiträge</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="private-health-monthly">
                    Krankenversicherung (monatlich)
                  </Label>
                  <Input
                    id="private-health-monthly"
                    type="number"
                    min="0"
                    step="10"
                    value={values.privateHealthInsuranceMonthly}
                    onChange={e => onChange.onPrivateHealthInsuranceMonthlyChange(Number(e.target.value))}
                    placeholder="z.B. 450"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="private-care-monthly">
                    Pflegeversicherung (monatlich)
                  </Label>
                  <Input
                    id="private-care-monthly"
                    type="number"
                    min="0"
                    step="5"
                    value={values.privateCareInsuranceMonthly}
                    onChange={e => onChange.onPrivateCareInsuranceMonthlyChange(Number(e.target.value))}
                    placeholder="z.B. 60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="private-inflation-rate">
                    Jährliche Steigerung:
                    {' '}
                    {values.privateInsuranceInflationRate.toFixed(1)}
                    %
                  </Label>
                  <Slider
                    id="private-inflation-rate"
                    min={0}
                    max={5}
                    step={0.1}
                    value={[values.privateInsuranceInflationRate]}
                    onValueChange={([value]) => onChange.onPrivateInsuranceInflationRateChange(value)}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Typisch: 2-4% jährliche Beitragssteigerung
                  </div>
                </div>
              </div>

              {values.privateHealthInsuranceMonthly > 0 && values.privateCareInsuranceMonthly > 0 && (
                <div className="text-sm text-muted-foreground">
                  <strong>Gesamt pro Monat:</strong>
                  {' '}
                  {formatCurrency(values.privateHealthInsuranceMonthly + values.privateCareInsuranceMonthly)}
                  {' '}
                  <strong>pro Jahr:</strong>
                  {' '}
                  {formatCurrency(
                    (values.privateHealthInsuranceMonthly + values.privateCareInsuranceMonthly) * 12,
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Couple Configuration */}
        {planningMode === 'couple' && values.insuranceType === 'statutory' && (
          <div className="space-y-6">
            <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-sm flex items-center gap-2">
                💑 Familienversicherung für Paare
              </h4>

              {/* Strategy Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Versicherungsstrategie</Label>
                <RadioTileGroup
                  value={values.coupleStrategy || 'optimize'}
                  onValueChange={value => onChange.onCoupleStrategyChange?.(value as 'individual' | 'family' | 'optimize')}
                  className="grid grid-cols-1 gap-3"
                >
                  <RadioTile value="individual" label="Einzelversicherung">
                    Beide Partner haben eigene Krankenversicherung
                  </RadioTile>
                  <RadioTile value="family" label="Familienversicherung">
                    Ein Partner zahlt, der andere ist familienversichert (falls möglich)
                  </RadioTile>
                  <RadioTile value="optimize" label="Automatisch optimieren" className="border-green-200 bg-green-50">
                    Wählt automatisch die günstigste Variante
                  </RadioTile>
                </RadioTileGroup>
              </div>

              {/* Family Insurance Thresholds */}
              <div className="space-y-4 p-3 bg-white rounded border">
                <h5 className="font-medium text-sm">Familienversicherung Einkommensgrenzen (2025)</h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="family-threshold-regular">
                      Reguläre Beschäftigung (monatlich)
                    </Label>
                    <Input
                      id="family-threshold-regular"
                      type="number"
                      min="0"
                      step="5"
                      value={values.familyInsuranceThresholdRegular || 505}
                      onChange={e => onChange.onFamilyInsuranceThresholdRegularChange?.(Number(e.target.value))}
                      placeholder="505"
                    />
                    <div className="text-xs text-muted-foreground">
                      Standard: 505€/Monat (2025)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="family-threshold-minijob">
                      Mini-Job (monatlich)
                    </Label>
                    <Input
                      id="family-threshold-minijob"
                      type="number"
                      min="0"
                      step="5"
                      value={values.familyInsuranceThresholdMiniJob || 538}
                      onChange={e => onChange.onFamilyInsuranceThresholdMiniJobChange?.(Number(e.target.value))}
                      placeholder="538"
                    />
                    <div className="text-xs text-muted-foreground">
                      Standard: 538€/Monat für Mini-Jobs (2025)
                    </div>
                  </div>
                </div>
              </div>

              {/* Person Configuration */}
              <div className="space-y-4">
                <h5 className="font-medium text-sm">Personenkonfiguration</h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Person 1 */}
                  <div className="space-y-4 p-3 bg-white rounded border">
                    <h6 className="font-medium text-sm text-blue-700">👤 Person 1</h6>

                    <div className="space-y-2">
                      <Label htmlFor="person1-name">Name (optional)</Label>
                      <Input
                        id="person1-name"
                        type="text"
                        value={values.person1Name || ''}
                        onChange={e => onChange.onPerson1NameChange?.(e.target.value)}
                        placeholder="z.B. Anna"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="health-insurance-person1-withdrawal-share">
                        Anteil am Entnahmebetrag:
                        {' '}
                        {((values.person1WithdrawalShare || 0.5) * 100).toFixed(0)}
                        %
                      </Label>
                      <Slider
                        id="health-insurance-person1-withdrawal-share"
                        name="person1-withdrawal-share-slider"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[values.person1WithdrawalShare || 0.5]}
                        onValueChange={([value]) => {
                          // Update person 1 share and let person 2 share be calculated from it
                          onChange.onPerson1WithdrawalShareChange?.(value)
                        }}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="person1-other-income">Andere Einkünfte (jährlich)</Label>
                      <Input
                        id="person1-other-income"
                        type="number"
                        min="0"
                        step="100"
                        value={values.person1OtherIncomeAnnual || 0}
                        onChange={e => onChange.onPerson1OtherIncomeAnnualChange?.(Number(e.target.value))}
                        placeholder="0"
                      />
                      <div className="text-xs text-muted-foreground">
                        z.B. Rente, Mieteinnahmen, Nebenjob
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={values.person1AdditionalCareInsuranceForChildless || false}
                        onCheckedChange={onChange.onPerson1AdditionalCareInsuranceForChildlessChange}
                        id="person1-additional-care"
                      />
                      <Label htmlFor="person1-additional-care" className="text-sm">
                        Kinderlos (+0,6% Pflegeversicherung)
                      </Label>
                    </div>
                  </div>

                  {/* Person 2 */}
                  <div className="space-y-4 p-3 bg-white rounded border">
                    <h6 className="font-medium text-sm text-purple-700">👤 Person 2</h6>

                    <div className="space-y-2">
                      <Label htmlFor="person2-name">Name (optional)</Label>
                      <Input
                        id="person2-name"
                        type="text"
                        value={values.person2Name || ''}
                        onChange={e => onChange.onPerson2NameChange?.(e.target.value)}
                        placeholder="z.B. Max"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="health-insurance-person2-withdrawal-share">
                        Anteil am Entnahmebetrag:
                        {' '}
                        {((values.person2WithdrawalShare || 0.5) * 100).toFixed(0)}
                        %
                      </Label>
                      <Slider
                        id="health-insurance-person2-withdrawal-share"
                        name="person2-withdrawal-share-slider"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[values.person2WithdrawalShare || 0.5]}
                        onValueChange={([value]) => {
                          // Update person 2 share and let person 1 share be calculated from it
                          onChange.onPerson2WithdrawalShareChange?.(value)
                        }}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="person2-other-income">Andere Einkünfte (jährlich)</Label>
                      <Input
                        id="person2-other-income"
                        type="number"
                        min="0"
                        step="100"
                        value={values.person2OtherIncomeAnnual || 0}
                        onChange={e => onChange.onPerson2OtherIncomeAnnualChange?.(Number(e.target.value))}
                        placeholder="0"
                      />
                      <div className="text-xs text-muted-foreground">
                        z.B. Rente, Mieteinnahmen, Nebenjob
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={values.person2AdditionalCareInsuranceForChildless || false}
                        onCheckedChange={onChange.onPerson2AdditionalCareInsuranceForChildlessChange}
                        id="person2-additional-care"
                      />
                      <Label htmlFor="person2-additional-care" className="text-sm">
                        Kinderlos (+0,6% Pflegeversicherung)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Care Insurance for Childless (Individual Mode Only) */}
        {planningMode === 'individual' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={values.additionalCareInsuranceForChildless}
                onCheckedChange={onChange.onAdditionalCareInsuranceForChildlessChange}
                id="additional-care-insurance"
              />
              <Label htmlFor="additional-care-insurance">
                Zusätzlicher Pflegeversicherungsbeitrag für Kinderlose
              </Label>
            </div>

            {values.additionalCareInsuranceForChildless && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="additional-care-age">
                  Ab Alter:
                  {' '}
                  {values.additionalCareInsuranceAge}
                  {' '}
                  Jahre
                </Label>
                <Slider
                  id="additional-care-age"
                  min={18}
                  max={35}
                  step={1}
                  value={[values.additionalCareInsuranceAge]}
                  onValueChange={([value]) => onChange.onAdditionalCareInsuranceAgeChange(value)}
                  className="w-32"
                />
                <div className="text-xs text-muted-foreground">
                  Zusätzlich 0,6% Pflegeversicherung ab diesem Alter
                </div>
              </div>
            )}
          </div>
        )}

        {/* Health Insurance Cost Preview */}
        {values.enabled && (
          <HealthInsuranceCostPreview
            values={values}
            planningMode={planningMode}
            birthYear={birthYear}
            spouseBirthYear={spouseBirthYear}
          />
        )}
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}

function HealthInsuranceCostPreview({
  values,
  planningMode,
  birthYear,
  spouseBirthYear,
}: {
  values: HealthCareInsuranceFormValues
  planningMode: 'individual' | 'couple'
  birthYear?: number
  spouseBirthYear?: number
}) {
  const currentYear = new Date().getFullYear()
  const sampleWithdrawalAmount = 30000 // Sample 30k annual withdrawal
  
  const previewResults = useMemo(() => {
    if (!values.enabled) return null

    try {
      if (planningMode === 'couple') {
        // Create couple config from form values
        const coupleConfig = {
          ...createDefaultHealthCareInsuranceConfig(),
          planningMode: 'couple' as const,
          insuranceType: values.insuranceType,
          statutoryHealthInsuranceRate: values.statutoryHealthInsuranceRate,
          statutoryCareInsuranceRate: values.statutoryCareInsuranceRate,
          statutoryMinimumIncomeBase: values.statutoryMinimumIncomeBase,
          statutoryMaximumIncomeBase: values.statutoryMaximumIncomeBase,
          coupleConfig: {
            strategy: values.coupleStrategy || 'optimize',
            familyInsuranceThresholds: {
              regularEmploymentLimit: values.familyInsuranceThresholdRegular || 505,
              miniJobLimit: values.familyInsuranceThresholdMiniJob || 538,
              year: 2025,
            },
            person1: {
              name: values.person1Name || 'Person 1',
              birthYear: birthYear || 1980,
              withdrawalShare: values.person1WithdrawalShare || 0.5,
              otherIncomeAnnual: values.person1OtherIncomeAnnual || 0,
              additionalCareInsuranceForChildless: values.person1AdditionalCareInsuranceForChildless || false,
            },
            person2: {
              name: values.person2Name || 'Person 2',
              birthYear: spouseBirthYear || 1980,
              withdrawalShare: values.person2WithdrawalShare || 0.5,
              otherIncomeAnnual: values.person2OtherIncomeAnnual || 0,
              additionalCareInsuranceForChildless: values.person2AdditionalCareInsuranceForChildless || false,
            },
          },
        }

        return calculateCoupleHealthInsuranceForYear(coupleConfig, currentYear + 16, sampleWithdrawalAmount, 0)
      } else {
        // Individual calculation
        const individualConfig = {
          ...createDefaultHealthCareInsuranceConfig(),
          planningMode: 'individual' as const,
          insuranceType: values.insuranceType,
          statutoryHealthInsuranceRate: values.statutoryHealthInsuranceRate,
          statutoryCareInsuranceRate: values.statutoryCareInsuranceRate,
          statutoryMinimumIncomeBase: values.statutoryMinimumIncomeBase,
          statutoryMaximumIncomeBase: values.statutoryMaximumIncomeBase,
          additionalCareInsuranceForChildless: values.additionalCareInsuranceForChildless,
          additionalCareInsuranceAge: values.additionalCareInsuranceAge,
        }

        return calculateHealthCareInsuranceForYear(
          individualConfig,
          currentYear + 16,
          sampleWithdrawalAmount,
          0,
          (birthYear || 1980) + 16
        )
      }
    } catch (error) {
      console.error('Error calculating health insurance preview:', error)
      return null
    }
  }, [
    values,
    planningMode,
    birthYear,
    spouseBirthYear,
    currentYear,
    sampleWithdrawalAmount,
  ])

  if (!previewResults) return null

  if (planningMode === 'couple' && 'person1' in previewResults) {
    const coupleResults = previewResults
    return (
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-medium text-sm text-green-900 mb-3 flex items-center gap-2">
          💰 Kostenvorschau (bei {formatCurrency(sampleWithdrawalAmount)} Entnahme)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-700">
              👤 {coupleResults.person1.name}
            </div>
            <div className="text-xs space-y-1">
              <div>Jährlich: {formatCurrency(coupleResults.person1.healthInsuranceResult.totalAnnual)}</div>
              <div>Monatlich: {formatCurrency(coupleResults.person1.healthInsuranceResult.totalMonthly)}</div>
              <div className="text-blue-600">
                {coupleResults.person1.coveredByFamilyInsurance ? '👨‍👩‍👧‍👦 Familienversichert' : '💳 Eigenversichert'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-purple-700">
              👤 {coupleResults.person2.name}
            </div>
            <div className="text-xs space-y-1">
              <div>Jährlich: {formatCurrency(coupleResults.person2.healthInsuranceResult.totalAnnual)}</div>
              <div>Monatlich: {formatCurrency(coupleResults.person2.healthInsuranceResult.totalMonthly)}</div>
              <div className="text-purple-600">
                {coupleResults.person2.coveredByFamilyInsurance ? '👨‍👩‍👧‍👦 Familienversichert' : '💳 Eigenversichert'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-green-300">
          <div className="text-sm font-medium text-green-900">
            Gesamt: {formatCurrency(coupleResults.totalAnnual)} / Jahr • {formatCurrency(coupleResults.totalMonthly)} / Monat
          </div>
          <div className="text-xs text-green-700 mt-1">
            Strategie: {coupleResults.strategyUsed === 'family' ? '👨‍👩‍👧‍👦 Familienversicherung' : 
                         coupleResults.strategyUsed === 'individual' ? '💳 Einzelversicherung' : '🎯 Optimiert'}
          </div>
        </div>
      </div>
    )
  } else {
    // Individual results
    const individualResults = previewResults as any
    return (
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-sm text-blue-900 mb-3">
          💰 Kostenvorschau (bei {formatCurrency(sampleWithdrawalAmount)} Entnahme)
        </h4>
        
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Jährlich:</span> {formatCurrency(individualResults.totalAnnual)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Monatlich:</span> {formatCurrency(individualResults.totalMonthly)}
          </div>
          <div className="text-xs text-blue-700">
            Krankenversicherung: {formatCurrency(individualResults.healthInsuranceAnnual)} / Jahr • 
            Pflegeversicherung: {formatCurrency(individualResults.careInsuranceAnnual)} / Jahr
          </div>
        </div>
      </div>
    )
  }
}
