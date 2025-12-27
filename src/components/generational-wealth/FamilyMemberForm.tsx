import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioTileGroup, RadioTile } from '../ui/radio-tile'
import type { RelationshipType } from '../../utils/sparplan-utils'
import { getRelationshipTypeLabel, INHERITANCE_TAX_EXEMPTIONS } from '../../../helpers/inheritance-tax'
import { formatCurrency } from '../../utils/currency'
import { generateFormId } from '../../utils/unique-id'

interface FamilyMemberFormProps {
  name: string
  generation: number
  relationshipType: RelationshipType
  birthYear: number | undefined
  onNameChange: (value: string) => void
  onGenerationChange: (value: number) => void
  onRelationshipTypeChange: (value: RelationshipType) => void
  onBirthYearChange: (value: number | undefined) => void
  onAdd: () => void
}

export function FamilyMemberForm({
  name,
  generation,
  relationshipType,
  birthYear,
  onNameChange,
  onGenerationChange,
  onRelationshipTypeChange,
  onBirthYearChange,
  onAdd,
}: FamilyMemberFormProps) {
  const nameId = useMemo(() => generateFormId('family-member', 'name'), [])
  const generationId = useMemo(() => generateFormId('family-member', 'generation'), [])
  const relationshipId = useMemo(() => generateFormId('family-member', 'relationship'), [])
  const birthYearId = useMemo(() => generateFormId('family-member', 'birth-year'), [])

  return (
    <div className="pt-4 border-t space-y-4">
      <h4 className="font-medium">Neues Familienmitglied hinzufügen</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={nameId}>Name</Label>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="z.B. Anna"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={birthYearId}>Geburtsjahr (optional)</Label>
          <Input
            id={birthYearId}
            type="number"
            value={birthYear || ''}
            onChange={(e) => onBirthYearChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="z.B. 1990"
            min={1920}
            max={2024}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={generationId}>Generation</Label>
        <RadioTileGroup
          value={generation.toString()}
          onValueChange={(value: string) => onGenerationChange(Number(value))}
          name={generationId}
        >
          <RadioTile value="1" label="1. Generation">
            Kinder
          </RadioTile>
          <RadioTile value="2" label="2. Generation">
            Enkelkinder
          </RadioTile>
          <RadioTile value="3" label="3. Generation">
            Urenkelkinder
          </RadioTile>
        </RadioTileGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor={relationshipId}>Verwandtschaftsverhältnis</Label>
        <RadioTileGroup
          value={relationshipType}
          onValueChange={(value: string) => onRelationshipTypeChange(value as RelationshipType)}
          name={relationshipId}
        >
          <RadioTile value="spouse" label={getRelationshipTypeLabel('spouse')}>
            Freibetrag: {formatCurrency(INHERITANCE_TAX_EXEMPTIONS.spouse)}
          </RadioTile>
          <RadioTile value="child" label={getRelationshipTypeLabel('child')}>
            Freibetrag: {formatCurrency(INHERITANCE_TAX_EXEMPTIONS.child)}
          </RadioTile>
          <RadioTile value="grandchild" label={getRelationshipTypeLabel('grandchild')}>
            Freibetrag: {formatCurrency(INHERITANCE_TAX_EXEMPTIONS.grandchild)}
          </RadioTile>
          <RadioTile value="sibling" label={getRelationshipTypeLabel('sibling')}>
            Freibetrag: {formatCurrency(INHERITANCE_TAX_EXEMPTIONS.sibling)}
          </RadioTile>
        </RadioTileGroup>
      </div>

      <Button onClick={onAdd} disabled={!name.trim()} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Familienmitglied hinzufügen
      </Button>
    </div>
  )
}
