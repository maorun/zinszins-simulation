import { SpecialEvents } from './SpecialEvents'
import type { Sparplan } from '../utils/sparplan-utils'

interface HomePageSpecialEventsProps {
  sparplan: Sparplan[]
  setSparplan: (sparplan: Sparplan[]) => void
  handleSpecialEventsDispatch: (sparplan: Sparplan[]) => void
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

export function HomePageSpecialEvents({
  sparplan,
  setSparplan,
  handleSpecialEventsDispatch,
  savingsStartYear,
  savingsEndYear,
  withdrawalStartYear,
  withdrawalEndYear,
}: HomePageSpecialEventsProps) {
  return (
    <SpecialEvents
      dispatch={(updatedSparplan) => {
        setSparplan(updatedSparplan)
        handleSpecialEventsDispatch(updatedSparplan)
      }}
      currentSparplans={sparplan}
      savingsStartYear={savingsStartYear}
      savingsEndYear={savingsEndYear}
      withdrawalStartYear={withdrawalStartYear}
      withdrawalEndYear={withdrawalEndYear}
    />
  )
}
