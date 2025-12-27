import { useRef } from 'react'
import { HomePageLayout } from '../components/HomePageLayout'

import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'
import { DashboardPreferencesProvider } from '../contexts/DashboardPreferencesProvider'
import { useSimulation } from '../contexts/useSimulation'

const HomePageContent = () => {
  const overviewRef = useRef<HTMLDivElement>(null)
  const { isLoading } = useSimulation()

  return <HomePageLayout overviewRef={overviewRef} isLoading={isLoading} />
}

export default function HomePage() {
  return (
    <DashboardPreferencesProvider>
      <SimulationProvider>
        <NavigationProvider>
          <HomePageContent />
        </NavigationProvider>
      </SimulationProvider>
    </DashboardPreferencesProvider>
  )
}
