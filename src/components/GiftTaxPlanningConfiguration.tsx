import { useMemo, useState } from 'react'
import { Gift } from 'lucide-react'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { GiftTaxConfigForm } from './GiftTaxConfigForm'
import { GiftTaxResultsDisplay } from './GiftTaxResultsDisplay'
import { optimizeGiftStrategy } from '../../helpers/gift-tax'
import type { RelationshipType } from '../utils/sparplan-utils'
import { generateFormId } from '../utils/unique-id'

function GiftTaxPlanningHeader() {
  return (
    <CollapsibleCardHeader>
      <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
        <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
        Schenkungssteuer-Planung
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        Optimieren Sie lebzeitige Vermögensübertragungen unter Nutzung der 10-Jahres-Freibeträge
      </p>
    </CollapsibleCardHeader>
  )
}

export default function GiftTaxPlanningConfiguration() {
  const [enabled, setEnabled] = useState(false)
  const [targetAmount, setTargetAmount] = useState(800000)
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('child')
  const [yearsAvailable, setYearsAvailable] = useState(20)

  // Generate stable unique IDs
  const enabledSwitchId = useMemo(() => generateFormId('gift-tax', 'enabled'), [])
  const targetAmountId = useMemo(() => generateFormId('gift-tax', 'target-amount'), [])
  const relationshipId = useMemo(() => generateFormId('gift-tax', 'relationship'), [])
  const yearsId = useMemo(() => generateFormId('gift-tax', 'years'), [])

  const currentYear = new Date().getFullYear()

  // Calculate optimized gift strategy
  const optimizationResult = useMemo(() => {
    if (!enabled) return null
    return optimizeGiftStrategy(targetAmount, relationshipType, currentYear, yearsAvailable)
  }, [enabled, targetAmount, relationshipType, currentYear, yearsAvailable])

  return (
    <CollapsibleCard>
      <GiftTaxPlanningHeader />
      <CollapsibleCardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch id={enabledSwitchId} checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor={enabledSwitchId}>Schenkungssteuer-Planung aktivieren</Label>
          </div>

          {enabled && (
            <>
              <GiftTaxConfigForm
                targetAmount={targetAmount}
                relationshipType={relationshipType}
                yearsAvailable={yearsAvailable}
                onTargetAmountChange={setTargetAmount}
                onRelationshipTypeChange={setRelationshipType}
                onYearsAvailableChange={setYearsAvailable}
                targetAmountId={targetAmountId}
                relationshipId={relationshipId}
                yearsId={yearsId}
              />
              {optimizationResult && <GiftTaxResultsDisplay result={optimizationResult} />}
            </>
          )}
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
