import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'

interface AdditionalCareInsuranceProps {
  additionalCareInsuranceForChildless: boolean
  additionalCareInsuranceAge: number
  onAdditionalCareInsuranceForChildlessChange: (enabled: boolean) => void
  onAdditionalCareInsuranceAgeChange: (age: number) => void
}

export function AdditionalCareInsurance({
  additionalCareInsuranceForChildless,
  additionalCareInsuranceAge,
  onAdditionalCareInsuranceForChildlessChange,
  onAdditionalCareInsuranceAgeChange,
}: AdditionalCareInsuranceProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Switch
          checked={additionalCareInsuranceForChildless}
          onCheckedChange={onAdditionalCareInsuranceForChildlessChange}
          id="additional-care-insurance"
        />
        <Label htmlFor="additional-care-insurance">
          Zusätzlicher Pflegeversicherungsbeitrag für Kinderlose
        </Label>
      </div>

      {additionalCareInsuranceForChildless && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="additional-care-age">
            Ab Alter:
            {' '}
            {additionalCareInsuranceAge}
            {' '}
            Jahre
          </Label>
          <Slider
            id="additional-care-age"
            min={18}
            max={35}
            step={1}
            value={[additionalCareInsuranceAge]}
            onValueChange={([value]) => onAdditionalCareInsuranceAgeChange(value)}
            className="w-32"
          />
          <div className="text-xs text-muted-foreground">
            Zusätzlich 0,6% Pflegeversicherung ab diesem Alter
          </div>
        </div>
      )}
    </div>
  )
}
