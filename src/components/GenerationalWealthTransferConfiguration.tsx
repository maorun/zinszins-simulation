import { useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import {
  CollapsibleCard,
  CollapsibleCardContent,
  CollapsibleCardHeader,
} from './ui/collapsible-card'
import { CardDescription } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { FamilyMemberManager } from './generational-wealth/FamilyMemberManager'
import { WealthTransferConfiguration } from './generational-wealth/WealthTransferConfiguration'
import { WealthTransferResults } from './generational-wealth/WealthTransferResults'
import { createGenerationalTransferPlan, type FamilyMember } from '../../helpers/generational-wealth-transfer'
import { generateFormId } from '../utils/unique-id'

function GenerationalWealthTransferHeader() {
  return (
    <CollapsibleCardHeader titleClassName="text-lg sm:text-xl font-bold flex items-center gap-2">
      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
      Generationenübergreifende Vermögensplanung
    </CollapsibleCardHeader>
  )
}

function GenerationalWealthTransferContent({
  enabled,
  familyMembers,
  onFamilyMembersChange,
  totalWealth,
  timeHorizonYears,
  optimizationGoal,
  onTotalWealthChange,
  onTimeHorizonYearsChange,
  onOptimizationGoalChange,
  transferPlan,
}: {
  enabled: boolean
  familyMembers: FamilyMember[]
  onFamilyMembersChange: (members: FamilyMember[]) => void
  totalWealth: number
  timeHorizonYears: number
  optimizationGoal: 'minimize_tax' | 'equal_distribution' | 'custom'
  onTotalWealthChange: (value: number) => void
  onTimeHorizonYearsChange: (value: number) => void
  onOptimizationGoalChange: (value: 'minimize_tax' | 'equal_distribution' | 'custom') => void
  transferPlan: ReturnType<typeof createGenerationalTransferPlan> | null
}) {
  if (!enabled) return null

  return (
    <>
      <FamilyMemberManager
        familyMembers={familyMembers}
        onFamilyMembersChange={onFamilyMembersChange}
      />

      {familyMembers.length > 0 && (
        <>
          <WealthTransferConfiguration
            totalWealth={totalWealth}
            timeHorizonYears={timeHorizonYears}
            optimizationGoal={optimizationGoal}
            onTotalWealthChange={onTotalWealthChange}
            onTimeHorizonYearsChange={onTimeHorizonYearsChange}
            onOptimizationGoalChange={onOptimizationGoalChange}
          />

          {transferPlan && <WealthTransferResults plan={transferPlan} />}
        </>
      )}
    </>
  )
}

export default function GenerationalWealthTransferConfiguration() {
  const [enabled, setEnabled] = useState(false)
  const [totalWealth, setTotalWealth] = useState(2000000)
  const [timeHorizonYears, setTimeHorizonYears] = useState(30)
  const [optimizationGoal, setOptimizationGoal] = useState<
    'minimize_tax' | 'equal_distribution' | 'custom'
  >('minimize_tax')
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

  const enabledSwitchId = useMemo(() => generateFormId('generational-wealth', 'enabled'), [])
  const currentYear = new Date().getFullYear()

  const transferPlan = useMemo(() => {
    if (!enabled || familyMembers.length === 0) return null

    return createGenerationalTransferPlan({
      currentYear,
      donorId: 'donor',
      totalWealth,
      familyMembers,
      timeHorizonYears,
      optimizationGoal,
    })
  }, [enabled, totalWealth, familyMembers, timeHorizonYears, optimizationGoal, currentYear])

  return (
    <CollapsibleCard>
      <GenerationalWealthTransferHeader />
      <CollapsibleCardContent>
        <div className="space-y-6">
          <CardDescription>
            Planen Sie die Vermögensübertragung über mehrere Generationen hinweg und optimieren Sie
            Schenkungssteuer und Erbschaftssteuer für Ihre gesamte Familie
          </CardDescription>

          <div className="flex items-center space-x-2">
            <Switch id={enabledSwitchId} checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor={enabledSwitchId}>Generationenübergreifende Planung aktivieren</Label>
          </div>

          <GenerationalWealthTransferContent
            enabled={enabled}
            familyMembers={familyMembers}
            onFamilyMembersChange={setFamilyMembers}
            totalWealth={totalWealth}
            timeHorizonYears={timeHorizonYears}
            optimizationGoal={optimizationGoal}
            onTotalWealthChange={setTotalWealth}
            onTimeHorizonYearsChange={setTimeHorizonYears}
            onOptimizationGoalChange={setOptimizationGoal}
            transferPlan={transferPlan}
          />
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}