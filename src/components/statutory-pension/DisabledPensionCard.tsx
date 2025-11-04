import { Card, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent } from '../ui/collapsible'
import { PensionCardHeader } from './PensionCardHeader'
import { PensionEnableSwitch } from './PensionEnableSwitch'

interface DisabledPensionCardProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  switchId: string
  nestingLevel: number
  planningMode?: 'individual' | 'couple'
}

export function DisabledPensionCard({
  enabled,
  onToggle,
  switchId,
  nestingLevel,
  planningMode = 'individual',
}: DisabledPensionCardProps) {
  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel}>
        <PensionCardHeader nestingLevel={nestingLevel} />
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-4">
              <PensionEnableSwitch
                enabled={enabled}
                onToggle={onToggle}
                switchId={switchId}
                planningMode={planningMode}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
