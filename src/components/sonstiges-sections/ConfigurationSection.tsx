import { Suspense, type ReactNode, type ComponentType } from 'react'
import { Card, CardContent } from '../ui/card'

/**
 * Loading fallback component for lazy-loaded configurations
 */
function LoadingCard() {
  return (
    <Card className="mb-3 sm:mb-4">
      <CardContent className="py-4 text-center text-gray-500 text-sm">Lädt Konfiguration...</CardContent>
    </Card>
  )
}

interface ConfigurationSectionProps<T> {
  Component: ComponentType<T>
  componentProps?: T
  condition?: boolean
}

/**
 * Wrapper component for lazy-loaded configuration sections with Suspense
 * Provides consistent loading state across all configuration components
 */
export function ConfigurationSection<T extends Record<string, unknown> = Record<string, never>>({
  Component,
  componentProps,
  condition = true,
}: ConfigurationSectionProps<T>): ReactNode {
  if (!condition) {
    return null
  }

  // Use empty object as default props for components without props
  const props = (componentProps ?? {}) as T

  return (
    <Suspense fallback={<LoadingCard />}>
      <Component {...props} />
    </Suspense>
  )
}
