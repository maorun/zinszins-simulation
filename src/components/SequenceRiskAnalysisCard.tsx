import { Card } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { SequenceRiskCardHeader } from './sequence-risk/CardHeader'
import { useSequenceRiskAnalysis } from './sequence-risk/useSequenceRiskAnalysis'
import { SequenceRiskContent } from './sequence-risk/SequenceRiskContent'

export function SequenceRiskAnalysisCard() {
  const analysisData = useSequenceRiskAnalysis()

  return (
    <Card>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader>
          <SequenceRiskCardHeader />
        </CollapsibleCardHeader>

        <CollapsibleContent>
          <SequenceRiskContent data={analysisData} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
