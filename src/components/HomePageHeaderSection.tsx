import { Button } from './ui/button'
import Header from './Header'
import { DashboardCustomization } from './DashboardCustomization'
import { useDashboardPreferences } from '../contexts/DashboardPreferencesContext'

interface HomePageHeaderSectionProps {
  handleRecalculate: () => void
}

/**
 * Header section of the HomePage
 * Includes the main header and recalculation button
 */
export function HomePageHeaderSection({ handleRecalculate }: HomePageHeaderSectionProps) {
  const { preferences, updateSectionVisibility, updateSectionOrder, resetPreferences } = useDashboardPreferences()

  return (
    <>
      <Header />

      <div className="flex gap-2 mb-3 sm:mb-4 flex-col sm:flex-row">
        <Button onClick={handleRecalculate} className="flex-1" variant="default">
          🔄 Neu berechnen
        </Button>

        <DashboardCustomization
          preferences={preferences.sections}
          onVisibilityChange={updateSectionVisibility}
          onOrderChange={updateSectionOrder}
          onReset={resetPreferences}
        />
      </div>
    </>
  )
}
