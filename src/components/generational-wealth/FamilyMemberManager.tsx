import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { FamilyMemberForm } from './FamilyMemberForm'
import type { FamilyMember } from '../../../helpers/generational-wealth-transfer'
import type { RelationshipType } from '../../utils/sparplan-utils'
import { getRelationshipTypeLabel, INHERITANCE_TAX_EXEMPTIONS } from '../../../helpers/inheritance-tax'
import { formatCurrency } from '../../utils/currency'

interface FamilyMemberManagerProps {
  familyMembers: FamilyMember[]
  onFamilyMembersChange: (members: FamilyMember[]) => void
}

function FamilyMemberList({
  familyMembers,
  onRemove,
}: {
  familyMembers: FamilyMember[]
  onRemove: (id: string) => void
}) {
  const getGenerationLabel = (gen: number) => {
    switch (gen) {
      case 1:
        return 'Kinder'
      case 2:
        return 'Enkelkinder'
      case 3:
        return 'Urenkelkinder'
      default:
        return `Generation ${gen}`
    }
  }

  if (familyMembers.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Fügen Sie Familienmitglieder hinzu, um die Vermögensübertragung zu planen.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      {familyMembers.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex-1">
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-muted-foreground">
              {getRelationshipTypeLabel(member.relationshipType)} •{' '}
              {getGenerationLabel(member.generation)}
              {member.birthYear && ` • Geb. ${member.birthYear}`} • Freibetrag:{' '}
              {formatCurrency(INHERITANCE_TAX_EXEMPTIONS[member.relationshipType])}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(member.id)}
            className="ml-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

export function FamilyMemberManager({
  familyMembers,
  onFamilyMembersChange,
}: FamilyMemberManagerProps) {
  const [name, setName] = useState('')
  const [generation, setGeneration] = useState(1)
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('child')
  const [birthYear, setBirthYear] = useState<number | undefined>(1990)

  const handleAddMember = () => {
    if (!name.trim()) return

    const newMember: FamilyMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      generation,
      relationshipType,
      birthYear,
    }

    onFamilyMembersChange([...familyMembers, newMember])
    setName('')
    setGeneration(1)
    setRelationshipType('child')
    setBirthYear(1990)
  }

  const handleRemoveMember = (id: string) => {
    onFamilyMembersChange(familyMembers.filter((m) => m.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Familienmitglieder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FamilyMemberList familyMembers={familyMembers} onRemove={handleRemoveMember} />

        <FamilyMemberForm
          name={name}
          generation={generation}
          relationshipType={relationshipType}
          birthYear={birthYear}
          onNameChange={setName}
          onGenerationChange={setGeneration}
          onRelationshipTypeChange={setRelationshipType}
          onBirthYearChange={setBirthYear}
          onAdd={handleAddMember}
        />
      </CardContent>
    </Card>
  )
}
