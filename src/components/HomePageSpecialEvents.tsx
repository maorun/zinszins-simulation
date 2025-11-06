import { SpecialEvents } from './SpecialEvents'
import { useSimulation } from '../contexts/useSimulation'
import { useHomePageRecalculation } from '../hooks/useHomePageRecalculation'
import { calculatePhaseDateRanges } from '../utils/phase-date-ranges'

export function HomePageSpecialEvents() {
  const { sparplan, setSparplan, startEnd, simulationAnnual, setSparplanElemente, performSimulation, endOfLife } =
    useSimulation()

  const { handleSpecialEventsDispatch } = useHomePageRecalculation(
    sparplan,
    startEnd,
    simulationAnnual,
    setSparplanElemente,
    performSimulation,
  )

  const phaseDateRanges = calculatePhaseDateRanges(sparplan, startEnd, endOfLife)

  return (
    <SpecialEvents
      dispatch={updatedSparplan => {
        setSparplan(updatedSparplan)
        handleSpecialEventsDispatch(updatedSparplan)
      }}
      currentSparplans={sparplan}
      savingsStartYear={phaseDateRanges.savingsStartYear}
      savingsEndYear={phaseDateRanges.savingsEndYear}
      withdrawalStartYear={phaseDateRanges.withdrawalStartYear}
      withdrawalEndYear={phaseDateRanges.withdrawalEndYear}
    />
  )
}
