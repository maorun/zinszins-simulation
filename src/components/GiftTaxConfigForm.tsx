import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { formatCurrency } from '../utils/currency'
import { getRelationshipTypeLabel, INHERITANCE_TAX_EXEMPTIONS } from '../../helpers/inheritance-tax'
import type { RelationshipType } from '../utils/sparplan-utils'

interface GiftTaxConfigFormProps {
  targetAmount: number
  relationshipType: RelationshipType
  yearsAvailable: number
  onTargetAmountChange: (value: number) => void
  onRelationshipTypeChange: (value: RelationshipType) => void
  onYearsAvailableChange: (value: number) => void
  targetAmountId: string
  relationshipId: string
  yearsId: string
}

function RelationshipSelector({
  relationshipType,
  relationshipId,
  onRelationshipTypeChange,
}: {
  relationshipType: RelationshipType
  relationshipId: string
  onRelationshipTypeChange: (value: RelationshipType) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={relationshipId}>Verwandtschaftsverhältnis</Label>
      <RadioTileGroup
        value={relationshipType}
        onValueChange={(value: string) => onRelationshipTypeChange(value as RelationshipType)}
        name={relationshipId}
      >
        <RadioTile value="spouse" label={getRelationshipTypeLabel('spouse')}>
          {`Freibetrag: ${formatCurrency(INHERITANCE_TAX_EXEMPTIONS.spouse)}`}
        </RadioTile>
        <RadioTile value="child" label={getRelationshipTypeLabel('child')}>
          {`Freibetrag: ${formatCurrency(INHERITANCE_TAX_EXEMPTIONS.child)}`}
        </RadioTile>
        <RadioTile value="grandchild" label={getRelationshipTypeLabel('grandchild')}>
          {`Freibetrag: ${formatCurrency(INHERITANCE_TAX_EXEMPTIONS.grandchild)}`}
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}

export function GiftTaxConfigForm({
  targetAmount,
  relationshipType,
  yearsAvailable,
  onTargetAmountChange,
  onRelationshipTypeChange,
  onYearsAvailableChange,
  targetAmountId,
  relationshipId,
  yearsId,
}: GiftTaxConfigFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Planungsparameter</CardTitle>
        <CardDescription>Parameter für Ihre Schenkungsplanung</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={targetAmountId}>Zu übertragendes Vermögen (€)</Label>
          <Input
            id={targetAmountId}
            type="number"
            value={targetAmount}
            onChange={(e) => onTargetAmountChange(Number(e.target.value))}
            min={0}
            step={10000}
          />
        </div>

        <RelationshipSelector
          relationshipType={relationshipType}
          relationshipId={relationshipId}
          onRelationshipTypeChange={onRelationshipTypeChange}
        />

        <div className="space-y-2">
          <Label htmlFor={yearsId}>Verfügbarer Planungszeitraum (Jahre)</Label>
          <Input
            id={yearsId}
            type="number"
            value={yearsAvailable}
            onChange={(e) => onYearsAvailableChange(Number(e.target.value))}
            min={1}
            max={50}
          />
        </div>
      </CardContent>
    </Card>
  )
}
