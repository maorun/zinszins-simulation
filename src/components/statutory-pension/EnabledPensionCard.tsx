import type { ReactNode } from 'react'
import { Card, CardContent } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Collapsible, CollapsibleContent } from '../ui/collapsible'
import { PensionCardHeader } from './PensionCardHeader'

interface EnabledPensionCardProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  switchId: string
  nestingLevel: number
  children: ReactNode
}

export function EnabledPensionCard({ enabled, onToggle, switchId, nestingLevel, children }: EnabledPensionCardProps) {
  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel}>
        <PensionCardHeader nestingLevel={nestingLevel} />
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch checked={enabled} onCheckedChange={onToggle} id={switchId} />
                <Label htmlFor={switchId} className="font-medium">
                  Gesetzliche Rente berücksichtigen
                </Label>
              </div>

              {children}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
