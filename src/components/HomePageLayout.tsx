import { RefObject } from 'react'
import { HomePageMainContent } from './HomePageMainContent'
import { HomePageStickyAndFooter } from './HomePageStickyAndFooter'

interface HomePageLayoutProps {
  overviewRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
}

export function HomePageLayout({ overviewRef, isLoading }: HomePageLayoutProps) {
  return (
    <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-3xl lg:px-6 lg:max-w-5xl xl:max-w-7xl space-y-4">
      <HomePageMainContent overviewRef={overviewRef} />

      <HomePageStickyAndFooter overviewRef={overviewRef} isLoading={isLoading} />
    </div>
  )
}
