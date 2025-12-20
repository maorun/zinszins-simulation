import { RefObject } from 'react'
import { HomePageMainContent } from './HomePageMainContent'
import { HomePageStickyAndFooter } from './HomePageStickyAndFooter'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'
import { useHomePageKeyboardShortcuts } from '../hooks/useHomePageKeyboardShortcuts'

interface HomePageLayoutProps {
  overviewRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
}

export function HomePageLayout({ overviewRef, isLoading }: HomePageLayoutProps) {
  const { shortcuts, showHelp, closeHelp } = useHomePageKeyboardShortcuts()

  return (
    <>
      <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-3xl lg:px-6 lg:max-w-5xl xl:max-w-7xl space-y-4">
        <HomePageMainContent overviewRef={overviewRef} />

        <HomePageStickyAndFooter overviewRef={overviewRef} isLoading={isLoading} />
      </div>

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsHelp open={showHelp} onClose={closeHelp} shortcuts={shortcuts} />
    </>
  )
}
