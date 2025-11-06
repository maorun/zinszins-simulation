/**
 * Utility types for enhanced type safety
 * Provides generic types and utility types for reusable patterns
 */

/**
 * Makes specific properties of a type required
 * @example
 * type User = { name?: string, age?: number, id?: string }
 * type UserWithId = RequiredProps<User, 'id'> // { name?: string, age?: number, id: string }
 */
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Makes all properties of a type optional except specified keys
 * @example
 * type User = { name: string, age: number, id: string }
 * type PartialUser = OptionalExcept<User, 'id'> // { name?: string, age?: number, id: string }
 */
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

/**
 * Extract the type of a specific property from an object type
 * @example
 * type User = { profile: { name: string, age: number } }
 * type Profile = PropType<User, 'profile'> // { name: string, age: number }
 */
export type PropType<T, K extends keyof T> = T[K]

/**
 * Extract array element type
 * @example
 * type Numbers = number[]
 * type NumberItem = ArrayElement<Numbers> // number
 */
export type ArrayElement<T> = T extends Array<infer U> ? U : never

/**
 * Type-safe event handler
 * Generic type for React event handlers
 */
export type EventHandler<T = Element, E = Event> = (event: E & { currentTarget: T }) => void

/**
 * Type-safe onChange handler for form elements
 */
export type ChangeHandler<T = HTMLInputElement> = (event: { currentTarget: T } & unknown) => void

/**
 * Type-safe onClick handler
 */
export type ClickHandler<T = HTMLElement> = (event: { currentTarget: T } & unknown) => void

/**
 * Type-safe callback with no parameters
 */
export type VoidCallback = () => void

/**
 * Type-safe callback with one parameter
 */
export type Callback<T> = (value: T) => void

/**
 * Async callback type
 */
export type AsyncCallback<T = void> = (value?: T) => Promise<void>

/**
 * Generic configuration object with common pattern
 * Ensures enabled field and allows additional properties
 */
export interface ConfigBase {
  enabled: boolean
  [key: string]: unknown
}

/**
 * Generic result type for operations that can succeed or fail
 */
export type Result<T, E = Error>
  = { success: true, data: T }
    | { success: false, error: E }

/**
 * Readonly record type
 * Useful for constant lookups
 */
export type ReadonlyRecord<K extends string | number | symbol, V> = Readonly<Record<K, V>>

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null

/**
 * Maybe type helper (allows null or undefined)
 */
export type Maybe<T> = T | null | undefined

/**
 * Deep partial type
 * Makes all nested properties optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Deep readonly type
 * Makes all nested properties readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * Extract keys of a type that are of a specific value type
 * @example
 * type User = { name: string, age: number, active: boolean }
 * type StringKeys = KeysOfType<User, string> // 'name'
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

/**
 * Omit properties by type
 * @example
 * type User = { name: string, age: number, active: boolean }
 * type WithoutBooleans = OmitByType<User, boolean> // { name: string, age: number }
 */
export type OmitByType<T, V> = Omit<T, KeysOfType<T, V>>

/**
 * Pick properties by type
 * @example
 * type User = { name: string, age: number, active: boolean }
 * type OnlyStrings = PickByType<User, string> // { name: string }
 */
export type PickByType<T, V> = Pick<T, KeysOfType<T, V>>
