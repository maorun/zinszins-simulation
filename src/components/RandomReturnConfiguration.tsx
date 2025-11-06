import { useSimulation } from '../contexts/useSimulation'
import AverageReturnSlider from './AverageReturnSlider'
import RandomSeedInput from './RandomSeedInput'
import StandardDeviationSlider from './StandardDeviationSlider'

const RandomReturnConfiguration = () => {
  const {
    averageReturn,
    setAverageReturn,
    standardDeviation,
    setStandardDeviation,
    randomSeed,
    setRandomSeed,
    performSimulation,
  } = useSimulation()

  return (
    <div className="space-y-6">
      <AverageReturnSlider
        averageReturn={averageReturn}
        setAverageReturn={setAverageReturn}
        performSimulation={performSimulation}
      />

      <StandardDeviationSlider
        standardDeviation={standardDeviation}
        setStandardDeviation={setStandardDeviation}
        performSimulation={performSimulation}
      />

      <RandomSeedInput randomSeed={randomSeed} setRandomSeed={setRandomSeed} performSimulation={performSimulation} />
    </div>
  )
}

export default RandomReturnConfiguration
