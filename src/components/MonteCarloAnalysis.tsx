import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { MonteCarloResults } from './MonteCarloResults'
import { useSimulation } from '../contexts/useSimulation'
import { unique } from '../utils/array-utils'

const MonteCarloAnalysis = () => {
  const { simulationData, averageReturn, standardDeviation, randomSeed } = useSimulation()

  if (!simulationData) return null

  const data = unique(
    simulationData
      ? simulationData.sparplanElements
          .flatMap(v => (v.simulation ? Object.keys(v.simulation) : []))
          .map(Number)
          .filter((v: number) => !isNaN(v))
      : [],
  ) as number[]

  return (
    <Card className="mb-4">
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🎲 Monte Carlo Analyse
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent>
            <MonteCarloResults
              years={data}
              accumulationConfig={{
                averageReturn: averageReturn / 100,
                standardDeviation: standardDeviation / 100,
                seed: randomSeed,
              }}
              withdrawalConfig={{
                averageReturn: 0.05, // Default 5% for withdrawal phase (more conservative)
                standardDeviation: 0.12, // Default 12% volatility (more conservative)
                seed: randomSeed,
              }}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default MonteCarloAnalysis
