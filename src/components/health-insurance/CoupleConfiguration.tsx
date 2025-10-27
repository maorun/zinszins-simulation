import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'
import { PersonConfiguration } from './PersonConfiguration'

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
            onChange={e => onFamilyInsuranceThresholdRegularChange(Number(e.target.value))}
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
            onChange={e => onFamilyInsuranceThresholdMiniJobChange(Number(e.target.value))}
            placeholder="538"
          />
          <div className="text-xs text-muted-foreground">Standard: 538€/Monat für Mini-Jobs (2025)</div>
        </div>
      </div>
    </div>
  )
}

const StrategySelection = ({
  coupleStrategy,
  onCoupleStrategyChange,
}: {
  coupleStrategy: 'individual' | 'family' | 'optimize'
  onCoupleStrategyChange: (strategy: 'individual' | 'family' | 'optimize') => void
}) => (
  <div className="space-y-3">
    <Label className="text-sm font-medium">Versicherungsstrategie</Label>
    <RadioTileGroup
      value={coupleStrategy}
      onValueChange={value => onCoupleStrategyChange(value as 'individual' | 'family' | 'optimize')}
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

export function CoupleConfiguration(props: CoupleConfigurationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-sm flex items-center gap-2">💑 Familienversicherung für Paare</h4>
        <StrategySelection
          coupleStrategy={props.coupleStrategy}
          onCoupleStrategyChange={props.onCoupleStrategyChange}
        />
        <FamilyInsuranceThresholds
          familyInsuranceThresholdRegular={props.familyInsuranceThresholdRegular}
          familyInsuranceThresholdMiniJob={props.familyInsuranceThresholdMiniJob}
          onFamilyInsuranceThresholdRegularChange={props.onFamilyInsuranceThresholdRegularChange}
          onFamilyInsuranceThresholdMiniJobChange={props.onFamilyInsuranceThresholdMiniJobChange}
        />
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
              onAdditionalCareInsuranceForChildlessChange={
                props.onPerson1AdditionalCareInsuranceForChildlessChange
              }
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
              onAdditionalCareInsuranceForChildlessChange={
                props.onPerson2AdditionalCareInsuranceForChildlessChange
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
