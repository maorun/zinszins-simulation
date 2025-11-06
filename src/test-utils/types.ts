/**
 * Utility types for testing
 * Provides type-safe alternatives to `any` in test files
 */

/**
 * Generic type for event listener callbacks
 * Used for tracking addEventListener/removeEventListener calls
 */
export type EventListenerCallback<T extends Event = Event> = (event: T) => void

/**
 * Generic type for resize event listeners
 */
export type ResizeListener = EventListenerCallback<UIEvent>

/**
 * Generic type for scroll event listeners
 */
export type ScrollListener = EventListenerCallback<Event>

/**
 * Blob content type for file download tests
 * Represents content that can be passed to the Blob constructor
 */
export type BlobContent = BlobPart[]

/**
 * Blob options type for file download tests
 * Represents options passed to the Blob constructor
 */
export interface BlobOptions {
  type?: string
  endings?: 'transparent' | 'native'
}

/**
 * Mock handler object type
 * Generic type for handler objects used in tests
 */
export type MockHandlers<T = Record<string, unknown>> = {
  [K in keyof T]: T[K]
}

/**
 * Component mock props type
 * Generic type for mocked component props
 */
export type MockComponentProps<T = Record<string, unknown>> = T & {
  children?: React.ReactNode
}

/**
 * Generic test context data type
 * Used for capturing and testing context values
 */
export type TestContextData<T> = T | null

/**
 * Simulation context test data type
 * Specialized type for simulation context testing
 */
export interface SimulationContextTestData {
  rendite: number
  steuerlast: number
  teilfreistellungsquote: number
  startEnd: [number, number]
  simulationAnnual: 'yearly' | 'monthly'
  [key: string]: unknown
}

/**
 * Care level result type for care cost simulation tests
 */
export interface CareLevelTestResult<T = unknown> {
  level: string
  result: T
}
