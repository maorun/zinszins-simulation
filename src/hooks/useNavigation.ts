import { useContext } from 'react'
import { NavigationContext } from '~/contexts/NavigationContexValue'

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

export function useNavigationOptional() {
  const context = useContext(NavigationContext)
  return context
}
