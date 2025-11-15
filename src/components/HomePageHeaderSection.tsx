import { Button } from './ui/button'
import Header from './Header'

interface HomePageHeaderSectionProps {
  handleRecalculate: () => void
}

/**
 * Header section of the HomePage
 * Includes the main header and recalculation button
 */
export function HomePageHeaderSection({ handleRecalculate }: HomePageHeaderSectionProps) {
  return (
    <>
      <Header />

      <Button onClick={handleRecalculate} className="mb-3 sm:mb-4 w-full" variant="default">
        🔄 Neu berechnen
      </Button>
    </>
  )
}
