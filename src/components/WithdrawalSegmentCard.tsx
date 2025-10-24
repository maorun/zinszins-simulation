import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { Separator } from './ui/separator'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import { SegmentCardHeader } from './SegmentCardHeader'
import { SegmentBasicConfig } from './SegmentBasicConfig'
import { SegmentStrategySelector } from './SegmentStrategySelector'
import { WithdrawalFrequencyConfiguration } from './WithdrawalFrequencyConfiguration'
import { SegmentStrategyConfig } from './SegmentStrategyConfig'
import { SegmentReturnConfiguration } from './SegmentReturnConfiguration'
import { SegmentInflationConfig } from './SegmentInflationConfig'
import { SegmentTaxReductionConfig } from './SegmentTaxReductionConfig'

export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable' | 'multiasset'

interface WithdrawalSegmentCardProps {
  segment: WithdrawalSegment
  index: number
  totalSegments: number
  withdrawalStartYear: number
  withdrawalEndYear: number
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void
  onRemove: (segmentId: string) => void
  onMoveUp: (segmentId: string) => void
  onMoveDown: (segmentId: string) => void
}

function SegmentConfigSections({ segment, withdrawalStartYear, withdrawalEndYear, onUpdate }: {
  segment: WithdrawalSegment
  withdrawalStartYear: number
  withdrawalEndYear: number
  onUpdate: (id: string, updates: Partial<WithdrawalSegment>) => void
}) {
  return (
    <>
      <SegmentBasicConfig
        name={segment.name}
        startYear={segment.startYear}
        endYear={segment.endYear}
        withdrawalStartYear={withdrawalStartYear}
        withdrawalEndYear={withdrawalEndYear}
        onNameChange={name => onUpdate(segment.id, { name })}
        onStartYearChange={startYear => onUpdate(segment.id, { startYear })}
        onEndYearChange={endYear => onUpdate(segment.id, { endYear })}
      />
      <Separator />
      <SegmentStrategySelector segment={segment} onStrategyChange={updates => onUpdate(segment.id, updates)} />
      <WithdrawalFrequencyConfiguration
        frequency={segment.withdrawalFrequency}
        onFrequencyChange={freq => onUpdate(segment.id, { withdrawalFrequency: freq })}
      />
      <SegmentStrategyConfig segment={segment} onUpdate={onUpdate} />
      <Separator />
      <SegmentReturnConfiguration
        segmentId={segment.id}
        startYear={segment.startYear}
        endYear={segment.endYear}
        returnConfig={segment.returnConfig}
        onReturnConfigChange={config => onUpdate(segment.id, { returnConfig: config })}
      />
      <Separator />
      <SegmentInflationConfig
        inflationConfig={segment.inflationConfig}
        onInflationConfigChange={config => onUpdate(segment.id, { inflationConfig: config })}
      />
      <Separator />
      <SegmentTaxReductionConfig
        steuerReduzierenEndkapital={segment.steuerReduzierenEndkapital}
        onSteuerReduzierenEndkapitalChange={value => onUpdate(segment.id, { steuerReduzierenEndkapital: value })}
      />
    </>
  )
}

export function WithdrawalSegmentCard({
  segment,
  index,
  totalSegments,
  withdrawalStartYear,
  withdrawalEndYear,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WithdrawalSegmentCardProps) {
  return (
    <Card className="mb-4">
      <Collapsible defaultOpen={false}>
        <SegmentCardHeader
          segmentName={segment.name}
          startYear={segment.startYear}
          endYear={segment.endYear}
          index={index}
          totalSegments={totalSegments}
          onMoveUp={() => onMoveUp(segment.id)}
          onMoveDown={() => onMoveDown(segment.id)}
          onRemove={() => onRemove(segment.id)}
        />
        <CollapsibleContent>
          <CardContent>
            <SegmentConfigSections
              segment={segment}
              withdrawalStartYear={withdrawalStartYear}
              withdrawalEndYear={withdrawalEndYear}
              onUpdate={onUpdate}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
