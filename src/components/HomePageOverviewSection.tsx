import { RefObject } from 'react'
import { EnhancedOverview } from './EnhancedOverview'
import type { SimulationData } from '../contexts/helpers/config-types'

interface HomePageOverviewSectionProps {
  simulationData: SimulationData | null
  overviewRef: RefObject<HTMLDivElement | null>
}

export function HomePageOverviewSection({
  simulationData,
  overviewRef,
}: HomePageOverviewSectionProps) {
  if (!simulationData) return null

  return (
    <div
      ref={overviewRef}
      className="my-3 sm:my-4"
    >
      <EnhancedOverview />
    </div>
  )
}
