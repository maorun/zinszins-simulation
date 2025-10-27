import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'

const NameInput = ({
  personNumber,
  name,
  onNameChange,
  defaultName,
}: {
  personNumber: 1 | 2
  name: string
  onNameChange: (name: string) => void
  defaultName: string
}) => (
  <div className="space-y-2">
    <Label htmlFor={`person${personNumber}-name`}>Name (optional)</Label>
    <Input
      id={`person${personNumber}-name`}
      type="text"
      value={name}
      onChange={e => onNameChange(e.target.value)}
      placeholder={`z.B. ${defaultName}`}
    />
  </div>
)

const WithdrawalShareSlider = ({
  personNumber,
  withdrawalShare,
  onWithdrawalShareChange,
}: {
  personNumber: 1 | 2
  withdrawalShare: number
  onWithdrawalShareChange: (share: number) => void
}) => (
  <div className="space-y-2">
    <Label htmlFor={`health-insurance-person${personNumber}-withdrawal-share`}>
      Anteil am Entnahmebetrag:
      {' '}
      {(withdrawalShare * 100).toFixed(0)}
      %
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

const OtherIncomeInput = ({
  personNumber,
  otherIncomeAnnual,
  onOtherIncomeAnnualChange,
}: {
  personNumber: 1 | 2
  otherIncomeAnnual: number
  onOtherIncomeAnnualChange: (amount: number) => void
}) => (
  <div className="space-y-2">
    <Label htmlFor={`person${personNumber}-other-income`}>Andere Einkünfte (jährlich)</Label>
    <Input
      id={`person${personNumber}-other-income`}
      type="number"
      min="0"
      step="100"
      value={otherIncomeAnnual}
      onChange={e => onOtherIncomeAnnualChange(Number(e.target.value))}
      placeholder="0"
    />
    <div className="text-xs text-muted-foreground">z.B. Rente, Mieteinnahmen, Nebenjob</div>
  </div>
)

const AdditionalCareInsuranceSwitch = ({
  personNumber,
  additionalCareInsuranceForChildless,
  onAdditionalCareInsuranceForChildlessChange,
}: {
  personNumber: 1 | 2
  additionalCareInsuranceForChildless: boolean
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
}) => (
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

export function PersonConfiguration(props: PersonConfigurationProps) {
  const {
    personNumber,
    name,
    withdrawalShare,
    otherIncomeAnnual,
    additionalCareInsuranceForChildless,
    onNameChange,
    onWithdrawalShareChange,
    onOtherIncomeAnnualChange,
    onAdditionalCareInsuranceForChildlessChange,
  } = props
  const colorClass = personNumber === 1 ? 'text-blue-700' : 'text-purple-700'
  const defaultName = personNumber === 1 ? 'Anna' : 'Max'

  return (
    <div className="space-y-4 p-3 bg-white rounded border">
      <h6 className={`font-medium text-sm ${colorClass}`}>
        👤 Person
        {personNumber}
      </h6>
      <NameInput
        personNumber={personNumber}
        name={name}
        onNameChange={onNameChange}
        defaultName={defaultName}
      />
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
      <AdditionalCareInsuranceSwitch
        personNumber={personNumber}
        additionalCareInsuranceForChildless={additionalCareInsuranceForChildless}
        onAdditionalCareInsuranceForChildlessChange={onAdditionalCareInsuranceForChildlessChange}
      />
    </div>
  )
}
