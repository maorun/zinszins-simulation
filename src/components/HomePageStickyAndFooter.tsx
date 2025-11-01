import { RefObject } from 'react'
import { StickyOverview } from './StickyOverview'
import { StickyBottomOverview } from './StickyBottomOverview'
import { HomePageFooter } from './HomePageFooter'

interface HomePageStickyAndFooterProps {
  overviewRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
}

export function HomePageStickyAndFooter({ overviewRef, isLoading }: HomePageStickyAndFooterProps) {
  return (
    <>
      <StickyOverview overviewElementRef={overviewRef} />
      <StickyBottomOverview overviewElementRef={overviewRef} />

      {isLoading && <div className="text-center py-8 text-lg text-gray-600">⏳ Berechnung läuft...</div>}

      <HomePageFooter />
    </>
  )
}
