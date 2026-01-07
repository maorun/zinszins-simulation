/**
 * Utility functions for saving, loading, and managing user scenarios
 * Provides localStorage-based persistence for scenario comparison
 */

import { SCENARIOS_STORAGE_KEY, COMPARISONS_STORAGE_KEY, type SavedScenario, type ScenarioComparison } from '../types/scenario-comparison'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'

/**
 * Generate a unique ID for a scenario
 */
function generateScenarioId(): string {
  return `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a unique ID for a comparison
 */
function generateComparisonId(): string {
  return `comparison-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Load all saved scenarios from localStorage
 */
export function loadSavedScenarios(): SavedScenario[] {
  try {
    const stored = localStorage.getItem(SCENARIOS_STORAGE_KEY)
    if (!stored) return []
    
    const scenarios = JSON.parse(stored) as SavedScenario[]
    return Array.isArray(scenarios) ? scenarios : []
  } catch (error) {
    console.error('Error loading saved scenarios:', error)
    return []
  }
}

/**
 * Save a scenario to localStorage
 */
export function saveScenario(
  name: string,
  configuration: ExtendedSavedConfiguration,
  description?: string
): SavedScenario {
  const scenarios = loadSavedScenarios()
  
  const newScenario: SavedScenario = {
    id: generateScenarioId(),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuration,
  }
  
  scenarios.push(newScenario)
  localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios))
  
  return newScenario
}

/**
 * Update an existing scenario
 */
export function updateScenario(
  id: string,
  updates: Partial<Pick<SavedScenario, 'name' | 'description' | 'configuration'>>
): SavedScenario | null {
  const scenarios = loadSavedScenarios()
  const index = scenarios.findIndex((s) => s.id === id)
  
  if (index === -1) return null
  
  scenarios[index] = {
    ...scenarios[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios))
  return scenarios[index]
}

/**
 * Delete a scenario
 */
export function deleteScenario(id: string): boolean {
  const scenarios = loadSavedScenarios()
  const filtered = scenarios.filter((s) => s.id !== id)
  
  if (filtered.length === scenarios.length) return false
  
  localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * Get a single scenario by ID
 */
export function getScenarioById(id: string): SavedScenario | null {
  const scenarios = loadSavedScenarios()
  return scenarios.find((s) => s.id === id) || null
}

/**
 * Load all saved comparisons from localStorage
 */
export function loadSavedComparisons(): ScenarioComparison[] {
  try {
    const stored = localStorage.getItem(COMPARISONS_STORAGE_KEY)
    if (!stored) return []
    
    const comparisons = JSON.parse(stored) as ScenarioComparison[]
    return Array.isArray(comparisons) ? comparisons : []
  } catch (error) {
    console.error('Error loading saved comparisons:', error)
    return []
  }
}

/**
 * Save a comparison to localStorage
 */
export function saveComparison(name: string, scenarioIds: string[]): ScenarioComparison | null {
  const scenarios = loadSavedScenarios()
  const selectedScenarios = scenarioIds
    .map((id) => scenarios.find((s) => s.id === id))
    .filter((s): s is SavedScenario => s !== undefined)
  
  if (selectedScenarios.length < 2) {
    console.error('Need at least 2 scenarios for comparison')
    return null
  }
  
  const comparisons = loadSavedComparisons()
  
  const newComparison: ScenarioComparison = {
    id: generateComparisonId(),
    name,
    createdAt: new Date().toISOString(),
    scenarios: selectedScenarios,
    comparisonData: [], // Will be populated when comparison is loaded
  }
  
  comparisons.push(newComparison)
  localStorage.setItem(COMPARISONS_STORAGE_KEY, JSON.stringify(comparisons))
  
  return newComparison
}

/**
 * Delete a comparison
 */
export function deleteComparison(id: string): boolean {
  const comparisons = loadSavedComparisons()
  const filtered = comparisons.filter((c) => c.id !== id)
  
  if (filtered.length === comparisons.length) return false
  
  localStorage.setItem(COMPARISONS_STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * Get a single comparison by ID
 */
export function getComparisonById(id: string): ScenarioComparison | null {
  const comparisons = loadSavedComparisons()
  return comparisons.find((c) => c.id === id) || null
}

/**
 * Export scenarios to JSON file
 */
export function exportScenariosToJSON(scenarioIds?: string[]): string {
  const allScenarios = loadSavedScenarios()
  const scenarios = scenarioIds
    ? allScenarios.filter((s) => scenarioIds.includes(s.id))
    : allScenarios
  
  return JSON.stringify(scenarios, null, 2)
}

/**
 * Import scenarios from JSON string
 */
export function importScenariosFromJSON(json: string): SavedScenario[] {
  try {
    const imported = JSON.parse(json) as SavedScenario[]
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array of scenarios')
    }
    
    // Validate basic structure
    imported.forEach((scenario) => {
      if (!scenario.id || !scenario.name || !scenario.configuration) {
        throw new Error('Invalid scenario structure')
      }
    })
    
    // Assign new IDs to avoid conflicts
    const scenarios = loadSavedScenarios()
    const newScenarios = imported.map((scenario) => ({
      ...scenario,
      id: generateScenarioId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    
    scenarios.push(...newScenarios)
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios))
    
    return newScenarios
  } catch (error) {
    console.error('Error importing scenarios:', error)
    throw error
  }
}
