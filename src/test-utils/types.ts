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
export type BlobContent = Array<string | ArrayBuffer | ArrayBufferView | Blob>

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
export interface MockComponentProps {
  children?: unknown
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

/**
 * Mock savings data element for export tests
 * Simplified structure used in data-export tests
 */
export interface MockSavingsDataElement {
  start: Date
  startkapital: number
  zinsen: number
  endkapital: number
  bezahlteSteuer: number
  genutzterFreibetrag: number
  vorabpauschale: number
  amount: number
}

/**
 * Mock savings data structure for export tests
 */
export interface MockSavingsData {
  sparplanElements: MockSavingsDataElement[]
}
