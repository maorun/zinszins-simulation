/**
 * Tests for Utility Types
 * 
 * Since these are TypeScript types with minimal runtime logic, we focus on:
 * 1. Runtime utilities that use these types
 * 2. Type narrowing and guards
 * 3. Edge case handling
 */
import { describe, it, expect } from 'vitest'
import type {
  RequiredProps,
  OptionalExcept,
  PropType,
  ArrayElement,
  Result,
  ReadonlyRecord,
  Nullable,
  Maybe,
  KeysOfType,
} from './utility-types'

describe('utility-types', () => {
  describe('RequiredProps type', () => {
    it('should enforce required properties at compile time', () => {
      // This is a compile-time test - if it compiles, the type works correctly
      type User = { name?: string; age?: number; id?: string }
      type UserWithId = RequiredProps<User, 'id'>
      
      const user: UserWithId = {
        id: '123', // Required
        // name and age are optional
      }
      
      expect(user.id).toBe('123')
    })
  })

  describe('OptionalExcept type', () => {
    it('should make all properties optional except specified keys', () => {
      // Compile-time test
      type User = { name: string; age: number; id: string }
      type PartialUser = OptionalExcept<User, 'id'>
      
      const user: PartialUser = {
        id: '123', // Required
        // name and age are optional
      }
      
      expect(user.id).toBe('123')
    })
  })

  describe('PropType type', () => {
    it('should extract property type correctly', () => {
      // Compile-time test
      type User = { profile: { name: string; age: number } }
      type Profile = PropType<User, 'profile'>
      
      const profile: Profile = { name: 'John', age: 30 }
      
      expect(profile.name).toBe('John')
      expect(profile.age).toBe(30)
    })
  })

  describe('ArrayElement type', () => {
    it('should extract array element type correctly', () => {
      // Compile-time test
      type Numbers = number[]
      type NumberItem = ArrayElement<Numbers>
      
      const num: NumberItem = 42
      
      expect(num).toBe(42)
      expect(typeof num).toBe('number')
    })

    it('should work with complex array types', () => {
      type Users = Array<{ name: string; age: number }>
      type User = ArrayElement<Users>
      
      const user: User = { name: 'Alice', age: 25 }
      
      expect(user.name).toBe('Alice')
      expect(user.age).toBe(25)
    })
  })

  describe('Result type', () => {
    it('should represent successful result', () => {
      const success: Result<string> = {
        success: true,
        data: 'Hello',
      }
      
      if (success.success) {
        expect(success.data).toBe('Hello')
      }
    })

    it('should represent failed result', () => {
      const failure: Result<string> = {
        success: false,
        error: new Error('Failed'),
      }
      
      if (!failure.success) {
        expect(failure.error).toBeInstanceOf(Error)
        expect(failure.error.message).toBe('Failed')
      }
    })

    it('should provide type narrowing for success case', () => {
      function processResult(result: Result<number>): number | null {
        if (result.success) {
          return result.data // TypeScript knows data exists here
        }
        return null
      }
      
      expect(processResult({ success: true, data: 42 })).toBe(42)
      expect(processResult({ success: false, error: new Error() })).toBeNull()
    })

    it('should provide type narrowing for error case', () => {
      function getErrorMessage(result: Result<number>): string | null {
        if (!result.success) {
          return result.error.message // TypeScript knows error exists here
        }
        return null
      }
      
      expect(getErrorMessage({ success: false, error: new Error('Oops') })).toBe('Oops')
      expect(getErrorMessage({ success: true, data: 42 })).toBeNull()
    })

    it('should support custom error types', () => {
      type CustomError = { code: number; message: string }
      const failure: Result<string, CustomError> = {
        success: false,
        error: { code: 404, message: 'Not found' },
      }
      
      if (!failure.success) {
        expect(failure.error.code).toBe(404)
        expect(failure.error.message).toBe('Not found')
      }
    })
  })

  describe('ReadonlyRecord type', () => {
    it('should create immutable record type', () => {
      const config: ReadonlyRecord<string, number> = {
        maxRetries: 3,
        timeout: 5000,
      }
      
      expect(config.maxRetries).toBe(3)
      expect(config.timeout).toBe(5000)
    })

    it('should work with different key types', () => {
      const statusCodes: ReadonlyRecord<number, string> = {
        200: 'OK',
        404: 'Not Found',
        500: 'Internal Server Error',
      }
      
      expect(statusCodes[200]).toBe('OK')
      expect(statusCodes[404]).toBe('Not Found')
    })
  })

  describe('Nullable type', () => {
    it('should allow null values', () => {
      const value: Nullable<string> = null
      expect(value).toBeNull()
    })

    it('should allow defined values', () => {
      const value: Nullable<string> = 'Hello'
      expect(value).toBe('Hello')
    })

    it('should provide type narrowing', () => {
      function getLength(str: Nullable<string>): number {
        if (str === null) {
          return 0
        }
        return str.length
      }
      
      expect(getLength(null)).toBe(0)
      expect(getLength('Hello')).toBe(5)
    })
  })

  describe('Maybe type', () => {
    it('should allow null values', () => {
      const value: Maybe<string> = null
      expect(value).toBeNull()
    })

    it('should allow undefined values', () => {
      const value: Maybe<string> = undefined
      expect(value).toBeUndefined()
    })

    it('should allow defined values', () => {
      const value: Maybe<string> = 'Hello'
      expect(value).toBe('Hello')
    })

    it('should provide type narrowing for all cases', () => {
      function getLength(str: Maybe<string>): number {
        if (str == null) { // Checks both null and undefined
          return 0
        }
        return str.length
      }
      
      expect(getLength(null)).toBe(0)
      expect(getLength(undefined)).toBe(0)
      expect(getLength('Hello')).toBe(5)
    })

    it('should work with optional properties', () => {
      interface Config {
        name: string
        description: Maybe<string>
      }
      
      const config1: Config = { name: 'App', description: 'A great app' }
      const config2: Config = { name: 'App', description: null }
      const config3: Config = { name: 'App', description: undefined }
      
      expect(config1.description).toBe('A great app')
      expect(config2.description).toBeNull()
      expect(config3.description).toBeUndefined()
    })
  })

  describe('KeysOfType type', () => {
    it('should extract keys of specific value type', () => {
      // Compile-time test
      type User = { name: string; age: number; active: boolean }
      type StringKeys = KeysOfType<User, string>
      
      const key: StringKeys = 'name'
      expect(key).toBe('name')
    })
  })

  describe('Integration: Type utilities in real scenarios', () => {
    it('should support configuration objects with Result type', () => {
      interface Config {
        apiKey: string
        timeout: number
      }
      
      function loadConfig(): Result<Config> {
        const apiKey = 'test-key'
        if (!apiKey) {
          return {
            success: false,
            error: new Error('API key not found'),
          }
        }
        
        return {
          success: true,
          data: {
            apiKey,
            timeout: 5000,
          },
        }
      }
      
      const result = loadConfig()
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.apiKey).toBe('test-key')
        expect(result.data.timeout).toBe(5000)
      }
    })

    it('should support optional API responses with Maybe type', () => {
      interface User {
        id: string
        name: string
        email: Maybe<string>
      }
      
      function createUser(id: string, name: string, email?: string): User {
        return {
          id,
          name,
          email: email ?? null,
        }
      }
      
      const user1 = createUser('1', 'Alice', 'alice@example.com')
      const user2 = createUser('2', 'Bob')
      
      expect(user1.email).toBe('alice@example.com')
      expect(user2.email).toBeNull()
    })

    it('should support immutable configuration with ReadonlyRecord', () => {
      const TAX_RATES: ReadonlyRecord<string, number> = {
        DE: 0.26375, // German capital gains tax
        US: 0.15,
        UK: 0.20,
      }
      
      expect(TAX_RATES.DE).toBeCloseTo(0.26375)
      expect(TAX_RATES.US).toBe(0.15)
      expect(TAX_RATES.UK).toBe(0.20)
    })

    it('should support type-safe error handling with Result', () => {
      interface ValidationError {
        field: string
        message: string
      }
      
      function validateAge(age: number): Result<number, ValidationError> {
        if (age < 0) {
          return {
            success: false,
            error: { field: 'age', message: 'Age must be positive' },
          }
        }
        if (age > 150) {
          return {
            success: false,
            error: { field: 'age', message: 'Age must be realistic' },
          }
        }
        return {
          success: true,
          data: age,
        }
      }
      
      const valid = validateAge(25)
      const invalid1 = validateAge(-5)
      const invalid2 = validateAge(200)
      
      expect(valid.success).toBe(true)
      expect(invalid1.success).toBe(false)
      expect(invalid2.success).toBe(false)
      
      if (!invalid1.success) {
        expect(invalid1.error.field).toBe('age')
        expect(invalid1.error.message).toContain('positive')
      }
      
      if (!invalid2.success) {
        expect(invalid2.error.field).toBe('age')
        expect(invalid2.error.message).toContain('realistic')
      }
    })

    it('should support nullable fields in database models', () => {
      interface DatabaseUser {
        id: string
        name: string
        email: Nullable<string>
        phoneNumber: Nullable<string>
        deletedAt: Nullable<Date>
      }
      
      const activeUser: DatabaseUser = {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        phoneNumber: null,
        deletedAt: null,
      }
      
      const deletedUser: DatabaseUser = {
        id: '2',
        name: 'Bob',
        email: null,
        phoneNumber: null,
        deletedAt: new Date('2024-01-01'),
      }
      
      expect(activeUser.deletedAt).toBeNull()
      expect(deletedUser.deletedAt).toBeInstanceOf(Date)
      expect(activeUser.email).toBe('alice@example.com')
      expect(deletedUser.email).toBeNull()
    })
  })

  describe('Type guards and runtime checks', () => {
    it('should implement type guard for Result success', () => {
      function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
        return result.success === true
      }
      
      const success: Result<number> = { success: true, data: 42 }
      const failure: Result<number> = { success: false, error: new Error() }
      
      expect(isSuccess(success)).toBe(true)
      expect(isSuccess(failure)).toBe(false)
      
      if (isSuccess(success)) {
        expect(success.data).toBe(42)
      }
    })

    it('should implement type guard for nullable values', () => {
      function isDefined<T>(value: Nullable<T>): value is T {
        return value !== null
      }
      
      const defined: Nullable<string> = 'Hello'
      const notDefined: Nullable<string> = null
      
      expect(isDefined(defined)).toBe(true)
      expect(isDefined(notDefined)).toBe(false)
      
      if (isDefined(defined)) {
        expect(defined.length).toBe(5)
      }
    })

    it('should implement type guard for maybe values', () => {
      function isPresent<T>(value: Maybe<T>): value is T {
        return value != null
      }
      
      expect(isPresent('Hello')).toBe(true)
      expect(isPresent(null)).toBe(false)
      expect(isPresent(undefined)).toBe(false)
      expect(isPresent(0)).toBe(true)
      expect(isPresent('')).toBe(true)
      expect(isPresent(false)).toBe(true)
    })
  })
})
