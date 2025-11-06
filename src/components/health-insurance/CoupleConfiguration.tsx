import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'

interface StrategySelectionProps {
  coupleStrategy: 'individual' | 'family' | 'optimize'
  onCoupleStrategyChange: (strategy: 'individual' | 'family' | 'optimize') => void
}

function StrategySelection({ coupleStrategy, onCoupleStrategyChange }: StrategySelectionProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Versicherungsstrategie</Label>
      <RadioTileGroup
        value={coupleStrategy}
        onValueChange={(value) => onCoupleStrategyChange(value as 'individual' | 'family' | 'optimize')}
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
  )
}

interface CoupleConfigurationProps {
  coupleStrategy: 'individual' | 'family' | 'optimize'
  familyInsuranceThresholdRegular: number
  familyInsuranceThresholdMiniJob: number
  person1Name: string
  person1WithdrawalShare: number
  person1OtherIncomeAnnual: number
  person1AdditionalCareInsuranceForChildless: boolean
  person2Name: string
  person2WithdrawalShare: number
  person2OtherIncomeAnnual: number
  person2AdditionalCareInsuranceForChildless: boolean
  onCoupleStrategyChange: (strategy: 'individual' | 'family' | 'optimize') => void
  onFamilyInsuranceThresholdRegularChange: (amount: number) => void
  onFamilyInsuranceThresholdMiniJobChange: (amount: number) => void
  onPerson1NameChange: (name: string) => void
  onPerson1WithdrawalShareChange: (share: number) => void
  onPerson1OtherIncomeAnnualChange: (amount: number) => void
  onPerson1AdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onPerson2NameChange: (name: string) => void
  onPerson2WithdrawalShareChange: (share: number) => void
  onPerson2OtherIncomeAnnualChange: (amount: number) => void
  onPerson2AdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
}

interface PersonsSectionProps {
  person1Name: string
  person1WithdrawalShare: number
  person1OtherIncomeAnnual: number
  person1AdditionalCareInsuranceForChildless: boolean
  person2Name: string
  person2WithdrawalShare: number
  person2OtherIncomeAnnual: number
  person2AdditionalCareInsuranceForChildless: boolean
  onPerson1NameChange: (name: string) => void
  onPerson1WithdrawalShareChange: (share: number) => void
  onPerson1OtherIncomeAnnualChange: (amount: number) => void
  onPerson1AdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onPerson2NameChange: (name: string) => void
  onPerson2WithdrawalShareChange: (share: number) => void
  onPerson2OtherIncomeAnnualChange: (amount: number) => void
  onPerson2AdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
}

function PersonsSection(props: PersonsSectionProps) {
  return (
    <div className="space-y-4">
      <h5 className="font-medium text-sm">Personenkonfiguration</h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PersonConfiguration
          personNumber={1}
          name={props.person1Name}
          withdrawalShare={props.person1WithdrawalShare}
          otherIncomeAnnual={props.person1OtherIncomeAnnual}
          additionalCareInsuranceForChildless={props.person1AdditionalCareInsuranceForChildless}
          onNameChange={props.onPerson1NameChange}
          onWithdrawalShareChange={props.onPerson1WithdrawalShareChange}
          onOtherIncomeAnnualChange={props.onPerson1OtherIncomeAnnualChange}
          onAdditionalCareInsuranceForChildlessChange={props.onPerson1AdditionalCareInsuranceForChildlessChange}
        />

        <PersonConfiguration
          personNumber={2}
          name={props.person2Name}
          withdrawalShare={props.person2WithdrawalShare}
          otherIncomeAnnual={props.person2OtherIncomeAnnual}
          additionalCareInsuranceForChildless={props.person2AdditionalCareInsuranceForChildless}
          onNameChange={props.onPerson2NameChange}
          onWithdrawalShareChange={props.onPerson2WithdrawalShareChange}
          onOtherIncomeAnnualChange={props.onPerson2OtherIncomeAnnualChange}
          onAdditionalCareInsuranceForChildlessChange={props.onPerson2AdditionalCareInsuranceForChildlessChange}
        />
      </div>
    </div>
  )
}

interface CoupleConfigurationContentProps {
  coupleStrategy: 'individual' | 'family' | 'optimize'
  familyInsuranceThresholdRegular: number
  familyInsuranceThresholdMiniJob: number
  onCoupleStrategyChange: (strategy: 'individual' | 'family' | 'optimize') => void
  onFamilyInsuranceThresholdRegularChange: (amount: number) => void
  onFamilyInsuranceThresholdMiniJobChange: (amount: number) => void
  personsSectionProps: PersonsSectionProps
}

function CoupleConfigurationContent(props: CoupleConfigurationContentProps) {
  return (
    <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <h4 className="font-medium text-sm flex items-center gap-2">💑 Familienversicherung für Paare</h4>

      <StrategySelection coupleStrategy={props.coupleStrategy} onCoupleStrategyChange={props.onCoupleStrategyChange} />

      <FamilyInsuranceThresholds
        familyInsuranceThresholdRegular={props.familyInsuranceThresholdRegular}
        familyInsuranceThresholdMiniJob={props.familyInsuranceThresholdMiniJob}
        onFamilyInsuranceThresholdRegularChange={props.onFamilyInsuranceThresholdRegularChange}
        onFamilyInsuranceThresholdMiniJobChange={props.onFamilyInsuranceThresholdMiniJobChange}
      />

      <PersonsSection {...props.personsSectionProps} />
    </div>
  )
}

export function CoupleConfiguration(props: CoupleConfigurationProps) {
  const personsSectionProps: PersonsSectionProps = {
    person1Name: props.person1Name,
    person1WithdrawalShare: props.person1WithdrawalShare,
    person1OtherIncomeAnnual: props.person1OtherIncomeAnnual,
    person1AdditionalCareInsuranceForChildless: props.person1AdditionalCareInsuranceForChildless,
    person2Name: props.person2Name,
    person2WithdrawalShare: props.person2WithdrawalShare,
    person2OtherIncomeAnnual: props.person2OtherIncomeAnnual,
    person2AdditionalCareInsuranceForChildless: props.person2AdditionalCareInsuranceForChildless,
    onPerson1NameChange: props.onPerson1NameChange,
    onPerson1WithdrawalShareChange: props.onPerson1WithdrawalShareChange,
    onPerson1OtherIncomeAnnualChange: props.onPerson1OtherIncomeAnnualChange,
    onPerson1AdditionalCareInsuranceForChildlessChange: props.onPerson1AdditionalCareInsuranceForChildlessChange,
    onPerson2NameChange: props.onPerson2NameChange,
    onPerson2WithdrawalShareChange: props.onPerson2WithdrawalShareChange,
    onPerson2OtherIncomeAnnualChange: props.onPerson2OtherIncomeAnnualChange,
    onPerson2AdditionalCareInsuranceForChildlessChange: props.onPerson2AdditionalCareInsuranceForChildlessChange,
  }

  return (
    <div className="space-y-6">
      <CoupleConfigurationContent
        coupleStrategy={props.coupleStrategy}
        familyInsuranceThresholdRegular={props.familyInsuranceThresholdRegular}
        familyInsuranceThresholdMiniJob={props.familyInsuranceThresholdMiniJob}
        onCoupleStrategyChange={props.onCoupleStrategyChange}
        onFamilyInsuranceThresholdRegularChange={props.onFamilyInsuranceThresholdRegularChange}
        onFamilyInsuranceThresholdMiniJobChange={props.onFamilyInsuranceThresholdMiniJobChange}
        personsSectionProps={personsSectionProps}
      />
    </div>
  )
}

interface FamilyInsuranceThresholdsProps {
  familyInsuranceThresholdRegular: number
  familyInsuranceThresholdMiniJob: number
  onFamilyInsuranceThresholdRegularChange: (amount: number) => void
  onFamilyInsuranceThresholdMiniJobChange: (amount: number) => void
}

function FamilyInsuranceThresholds({
  familyInsuranceThresholdRegular,
  familyInsuranceThresholdMiniJob,
  onFamilyInsuranceThresholdRegularChange,
  onFamilyInsuranceThresholdMiniJobChange,
}: FamilyInsuranceThresholdsProps) {
  return (
    <div className="space-y-4 p-3 bg-white rounded border">
      <h5 className="font-medium text-sm">Familienversicherung Einkommensgrenzen (2025)</h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="family-threshold-regular">Reguläre Beschäftigung (monatlich)</Label>
          <Input
            id="family-threshold-regular"
            type="number"
            min="0"
            step="5"
            value={familyInsuranceThresholdRegular}
            onChange={(e) => onFamilyInsuranceThresholdRegularChange(Number(e.target.value))}
            placeholder="505"
          />
          <div className="text-xs text-muted-foreground">Standard: 505€/Monat (2025)</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="family-threshold-minijob">Mini-Job (monatlich)</Label>
          <Input
            id="family-threshold-minijob"
            type="number"
            min="0"
            step="5"
            value={familyInsuranceThresholdMiniJob}
            onChange={(e) => onFamilyInsuranceThresholdMiniJobChange(Number(e.target.value))}
            placeholder="538"
          />
          <div className="text-xs text-muted-foreground">Standard: 538€/Monat für Mini-Jobs (2025)</div>
        </div>
      </div>
    </div>
  )
}

interface PersonConfigurationProps {
  personNumber: 1 | 2
  name: string
  withdrawalShare: number
  otherIncomeAnnual: number
  additionalCareInsuranceForChildless: boolean
  onNameChange: (name: string) => void
  onWithdrawalShareChange: (share: number) => void
  onOtherIncomeAnnualChange: (amount: number) => void
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
}

interface WithdrawalShareSliderProps {
  personNumber: 1 | 2
  withdrawalShare: number
  onWithdrawalShareChange: (share: number) => void
}

function WithdrawalShareSlider({ personNumber, withdrawalShare, onWithdrawalShareChange }: WithdrawalShareSliderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`health-insurance-person${personNumber}-withdrawal-share`}>
        Anteil am Entnahmebetrag: {(withdrawalShare * 100).toFixed(0)}%
      </Label>
      <Slider
        id={`health-insurance-person${personNumber}-withdrawal-share`}
        name={`person${personNumber}-withdrawal-share-slider`}
        min={0}
        max={1}
        step={0.01}
        value={[withdrawalShare]}
        onValueChange={([value]) => {
          const roundedValue = Math.round(value * 100) / 100
          onWithdrawalShareChange(roundedValue)
        }}
        className="w-full"
      />
    </div>
  )
}

interface OtherIncomeInputProps {
  personNumber: 1 | 2
  otherIncomeAnnual: number
  onOtherIncomeAnnualChange: (amount: number) => void
}

function OtherIncomeInput({ personNumber, otherIncomeAnnual, onOtherIncomeAnnualChange }: OtherIncomeInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`person${personNumber}-other-income`}>Andere Einkünfte (jährlich)</Label>
      <Input
        id={`person${personNumber}-other-income`}
        type="number"
        min="0"
        step="100"
        value={otherIncomeAnnual}
        onChange={(e) => onOtherIncomeAnnualChange(Number(e.target.value))}
        placeholder="0"
      />
      <div className="text-xs text-muted-foreground">z.B. Rente, Mieteinnahmen, Nebenjob</div>
    </div>
  )
}

interface AdditionalCareSwitchProps {
  personNumber: 1 | 2
  additionalCareInsuranceForChildless: boolean
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
}

function AdditionalCareSwitch({
  personNumber,
  additionalCareInsuranceForChildless,
  onAdditionalCareInsuranceForChildlessChange,
}: AdditionalCareSwitchProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={additionalCareInsuranceForChildless}
        onCheckedChange={onAdditionalCareInsuranceForChildlessChange}
        id={`person${personNumber}-additional-care`}
      />
      <Label htmlFor={`person${personNumber}-additional-care`} className="text-sm">
        Kinderlos (+0,6% Pflegeversicherung)
      </Label>
    </div>
  )
}

function PersonConfiguration({
  personNumber,
  name,
  withdrawalShare,
  otherIncomeAnnual,
  additionalCareInsuranceForChildless,
  onNameChange,
  onWithdrawalShareChange,
  onOtherIncomeAnnualChange,
  onAdditionalCareInsuranceForChildlessChange,
}: PersonConfigurationProps) {
  const colorClass = personNumber === 1 ? 'text-blue-700' : 'text-purple-700'
  const defaultName = personNumber === 1 ? 'Anna' : 'Max'

  return (
    <div className="space-y-4 p-3 bg-white rounded border">
      <h6 className={`font-medium text-sm ${colorClass}`}>👤 Person {personNumber}</h6>

      <div className="space-y-2">
        <Label htmlFor={`person${personNumber}-name`}>Name (optional)</Label>
        <Input
          id={`person${personNumber}-name`}
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={`z.B. ${defaultName}`}
        />
      </div>

      <WithdrawalShareSlider
        personNumber={personNumber}
        withdrawalShare={withdrawalShare}
        onWithdrawalShareChange={onWithdrawalShareChange}
      />

      <OtherIncomeInput
        personNumber={personNumber}
        otherIncomeAnnual={otherIncomeAnnual}
        onOtherIncomeAnnualChange={onOtherIncomeAnnualChange}
      />

      <AdditionalCareSwitch
        personNumber={personNumber}
        additionalCareInsuranceForChildless={additionalCareInsuranceForChildless}
        onAdditionalCareInsuranceForChildlessChange={onAdditionalCareInsuranceForChildlessChange}
      />
    </div>
  )
}
