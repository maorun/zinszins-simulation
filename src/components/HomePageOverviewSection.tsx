import { RefObject } from 'react'
import { EnhancedOverview } from './EnhancedOverview'
import { useSimulation } from '../contexts/useSimulation'

interface HomePageOverviewSectionProps {
  overviewRef: RefObject<HTMLDivElement | null>
}

export function HomePageOverviewSection({ overviewRef }: HomePageOverviewSectionProps) {
  const { simulationData } = useSimulation()

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
