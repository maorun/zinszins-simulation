import { useNavigationItem } from '../hooks/useNavigationItem'
import { useLifeExpectancyCalculation } from './hooks/useLifeExpectancyCalculation'
import { useGlobalPlanningData } from './hooks/useGlobalPlanningData'
import { GlobalPlanningConfigurationContent } from './GlobalPlanningConfigurationContent'

interface GlobalPlanningConfigurationProps {
  startOfIndependence: number
}

export function GlobalPlanningConfiguration({ startOfIndependence }: GlobalPlanningConfigurationProps) {
  const data = useGlobalPlanningData()

  // Use custom hook for life expectancy calculation
  useLifeExpectancyCalculation({
    birthYear: data.birthYear,
    expectedLifespan: data.expectedLifespan,
    planningMode: data.planningMode,
    gender: data.gender,
    spouse: data.spouse,
    useAutomaticCalculation: data.useAutomaticCalculation,
    setEndOfLife: data.setEndOfLife,
  })

  const navigationRef = useNavigationItem({
    id: 'global-planning',
    title: 'Globale Planung (Einzelperson/Ehepaar)',
    icon: '👥',
    level: 0,
  })

  return (
    <GlobalPlanningConfigurationContent
      navigationRef={navigationRef}
      startOfIndependence={startOfIndependence}
      {...data}
    />
  )
}
