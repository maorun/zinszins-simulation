/**
 * Utility functions and React hooks for generating unique HTML IDs to prevent duplicate ID issues
 *
 * This module provides functions and hooks to generate unique IDs and validate uniqueness
 * to ensure compliance with HTML standards and accessibility requirements.
 */

import * as React from 'react'

/**
 * Counter for generating unique IDs
 */
let idCounter = 0

/**
 * Set to track used IDs in the current session
 * Note: In production, consider using React's useId hook instead for better memory management
 */
const usedIds = new Set<string>()

/**
 * Maximum number of IDs to keep in memory to prevent unbounded growth
 */
const MAX_STORED_IDS = 10000

/**
 * Generate a unique ID with optional prefix and suffix
 * @param prefix - Optional prefix for the ID
 * @param suffix - Optional suffix for the ID
 * @returns A unique ID string
 */
export function generateUniqueId(prefix?: string, suffix?: string): string {
  let baseId = `${prefix || 'id'}-${++idCounter}`
  if (suffix) {
    baseId += `-${suffix}`
  }

  // Ensure the ID is truly unique by checking against used IDs
  let uniqueId = baseId
  let counter = 1
  while (usedIds.has(uniqueId)) {
    uniqueId = `${baseId}-${counter++}`
  }

  // Add to used IDs set, but limit growth to prevent memory issues
  if (usedIds.size >= MAX_STORED_IDS) {
    // Clear half the set when limit is reached (simple pruning strategy)
    const idsArray = Array.from(usedIds)
    usedIds.clear()
    // Keep the more recent half
    idsArray.slice(idsArray.length / 2).forEach((id) => usedIds.add(id))
  }

  usedIds.add(uniqueId)
  return uniqueId
}

/**
 * Generate a unique ID for form controls
 * @param componentName - Name of the component (e.g., 'statutory-pension', 'health-care')
 * @param fieldName - Name of the field (e.g., 'enabled', 'amount')
 * @param context - Optional context to ensure uniqueness (e.g., 'person1', 'savings-phase')
 * @returns A unique ID string suitable for form controls
 */
export function generateFormId(componentName: string, fieldName: string, context?: string): string {
  const parts = [componentName, fieldName]
  if (context) {
    parts.splice(1, 0, context) // Insert context between component and field
  }
  return generateUniqueId(parts.join('-'))
}

/**
 * Generate a unique ID for components that may be rendered multiple times
 * @param baseId - Base ID for the component
 * @param instanceId - Unique identifier for this instance (e.g., segment ID, person ID)
 * @returns A unique ID string
 */
export function generateInstanceId(baseId: string, instanceId: string | number): string {
  return generateUniqueId(baseId, String(instanceId))
}

/**
 * Check if an ID is already in use
 * @param id - The ID to check
 * @returns True if the ID is already used, false otherwise
 */
export function isIdUsed(id: string): boolean {
  return usedIds.has(id)
}

/**
 * Register an existing ID to prevent duplicates
 * This should be used for IDs that are hardcoded or generated externally
 * @param id - The ID to register
 * @returns True if registration was successful, false if ID was already registered
 */
export function registerExistingId(id: string): boolean {
  if (usedIds.has(id)) {
    return false
  }
  usedIds.add(id)
  return true
}

/**
 * Check if running in Vite test environment
 * @returns True if running in Vite test mode, false otherwise
 */
function isViteTestMode(): boolean {
  try {
    return typeof import.meta !== 'undefined' && (import.meta as { env?: { MODE?: string } })?.env?.MODE === 'test'
  } catch {
    return false
  }
}

/**
 * Check if running in Node.js test environment
 * @returns True if running in Node.js test mode, false otherwise
 */
function isNodeTestMode(): boolean {
  try {
    return typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'
  } catch {
    return false
  }
}

/**
 * Check if running in test environment
 * @returns True if running in test environment, false otherwise
 */
function isTestEnvironment(): boolean {
  return isViteTestMode() || isNodeTestMode()
}

/**
 * Clear all registered IDs (useful for testing)
 * WARNING: Only use this in test environments
 */
export function clearRegisteredIds(): void {
  if (!isTestEnvironment()) {
    console.warn('clearRegisteredIds should only be used in test environments')
  }
  usedIds.clear()
  idCounter = 0
}

/**
 * Get all currently registered IDs (useful for debugging)
 * @returns Array of all registered IDs
 */
export function getRegisteredIds(): string[] {
  return Array.from(usedIds)
}

/**
 * React hook to generate a stable unique ID for use in components
 * Uses React's built-in useId hook for better performance and memory management
 * @param baseId - Base ID for the component
 * @param dependencies - Optional dependencies that should trigger ID regeneration
 * @returns A stable unique ID that persists across renders
 */
export function useUniqueId(baseId: string, dependencies?: Array<string | number | boolean>): string {
  // Use React's built-in useId hook for better performance and memory management
  const reactId = React.useId()

  return React.useMemo(() => {
    const dependencyString = dependencies ? dependencies.join('-') : ''
    const suffix = dependencyString ? `-${dependencyString}` : ''
    return `${baseId}-${reactId}${suffix}`
  }, [baseId, reactId, dependencies])
}

/**
 * Normalize a string for use in IDs by replacing all whitespace with hyphens
 * @param str - String to normalize
 * @returns Normalized string safe for use in HTML IDs
 */
export function normalizeForId(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, '-')
}

/**
 * React hook to generate a stable unique ID for form controls
 * @param componentName - Name of the component (e.g., 'statutory-pension', 'health-care')
 * @param fieldName - Name of the field (e.g., 'enabled', 'amount')
 * @param context - Optional context to ensure uniqueness (e.g., 'person1', 'savings-phase')
 * @returns A stable unique ID string suitable for form controls
 */
export function useFormId(componentName: string, fieldName: string, context?: string): string {
  const reactId = React.useId()

  return React.useMemo(() => {
    const parts = [componentName, fieldName]
    if (context) {
      parts.splice(1, 0, normalizeForId(context)) // Insert normalized context between component and field
    }
    return `${parts.join('-')}-${reactId}`
  }, [componentName, fieldName, context, reactId])
}

/**
 * React hook to generate a stable unique ID for components that may be rendered multiple times
 * @param baseId - Base ID for the component
 * @param instanceId - Unique identifier for this instance (e.g., segment ID, person ID)
 * @returns A stable unique ID string
 */
export function useInstanceId(baseId: string, instanceId: string | number): string {
  const reactId = React.useId()

  return React.useMemo(() => {
    const normalizedInstanceId = typeof instanceId === 'string' ? normalizeForId(instanceId) : instanceId
    return `${baseId}-${normalizedInstanceId}-${reactId}`
  }, [baseId, instanceId, reactId])
}
