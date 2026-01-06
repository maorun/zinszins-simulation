/**
 * Tests for useScenarioManagement hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScenarioManagement } from './useScenarioManagement'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useScenarioManagement', () => {
  const mockConfig: ExtendedSavedConfiguration = {
    rendite: 5,
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: {},
    returnMode: 'fixed',
    averageReturn: 5,
    standardDeviation: 0,
    variableReturns: {},
    startEnd: [2024, 2040],
    sparplan: [],
    simulationAnnual: 'yearly',
  }

  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should initialize with empty scenarios', () => {
    const { result } = renderHook(() => useScenarioManagement())
    
    expect(result.current.scenarios).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should save a new scenario', () => {
    const { result } = renderHook(() => useScenarioManagement())
    
    let savedScenario
    act(() => {
      savedScenario = result.current.saveScenario('Test Scenario', mockConfig, 'Test description')
    })
    
    expect(savedScenario).not.toBeNull()
    expect(result.current.scenarios).toHaveLength(1)
    expect(result.current.scenarios[0].name).toBe('Test Scenario')
    expect(result.current.scenarios[0].description).toBe('Test description')
  })

  it('should update an existing scenario', () => {
    const { result } = renderHook(() => useScenarioManagement())
    
    let savedScenario
    act(() => {
      savedScenario = result.current.saveScenario('Original Name', mockConfig)
    })
    
    expect(savedScenario).not.toBeNull()
    
    act(() => {
      const updated = result.current.updateScenario(savedScenario!.id, { name: 'Updated Name' })
      expect(updated).not.toBeNull()
      expect(updated?.name).toBe('Updated Name')
    })
    
    expect(result.current.scenarios[0].name).toBe('Updated Name')
  })

  it('should delete a scenario', () => {
    const { result } = renderHook(() => useScenarioManagement())
    
    let savedScenario
    act(() => {
      savedScenario = result.current.saveScenario('To Delete', mockConfig)
    })
    
    expect(result.current.scenarios).toHaveLength(1)
    
    let success
    act(() => {
      success = result.current.deleteScenario(savedScenario!.id)
    })
    
    expect(success).toBe(true)
    expect(result.current.scenarios).toHaveLength(0)
  })

  it('should get a scenario by ID', () => {
    const { result } = renderHook(() => useScenarioManagement())
    
    let savedScenario
    act(() => {
      savedScenario = result.current.saveScenario('Test', mockConfig)
    })
    
    const found = result.current.getScenario(savedScenario!.id)
    expect(found).not.toBeNull()
    expect(found?.name).toBe('Test')
  })

  it('should refresh scenarios', () => {
    const { result } = renderHook(() => useScenarioManagement())
    
    act(() => {
      result.current.saveScenario('Scenario 1', mockConfig)
    })
    
    expect(result.current.scenarios).toHaveLength(1)
    
    // Manually add a scenario to storage
    const scenarios = JSON.parse(localStorage.getItem('zinszins-saved-scenarios') || '[]')
    scenarios.push({
      id: 'manual-id',
      name: 'Manual Scenario',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      configuration: mockConfig,
    })
    localStorage.setItem('zinszins-saved-scenarios', JSON.stringify(scenarios))
    
    act(() => {
      result.current.refreshScenarios()
    })
    
    expect(result.current.scenarios).toHaveLength(2)
  })

  it('should handle save errors gracefully', () => {
    const { result } = renderHook(() => useScenarioManagement())
    
    // Mock localStorage.setItem to throw an error
    const originalSetItem = localStorage.setItem
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage error')
    })
    
    let saved
    act(() => {
      saved = result.current.saveScenario('Test', mockConfig)
    })
    
    expect(saved).toBeNull()
    expect(result.current.error).toBeTruthy()
    
    // Restore
    localStorage.setItem = originalSetItem
  })

  it('should handle update errors gracefully', () => {
    const { result } = renderHook(() => useScenarioManagement())
    
    let updated
    act(() => {
      updated = result.current.updateScenario('non-existent-id', { name: 'Test' })
    })
    
    expect(updated).toBeNull()
  })

  it('should handle delete errors gracefully', () => {
    const { result } = renderHook(() => useScenarioManagement())
    
    let success
    act(() => {
      success = result.current.deleteScenario('non-existent-id')
    })
    
    expect(success).toBe(false)
  })

  it('should maintain scenarios across hook re-renders', () => {
    const { result, rerender } = renderHook(() => useScenarioManagement())
    
    act(() => {
      result.current.saveScenario('Persistent', mockConfig)
    })
    
    expect(result.current.scenarios).toHaveLength(1)
    
    rerender()
    
    expect(result.current.scenarios).toHaveLength(1)
    expect(result.current.scenarios[0].name).toBe('Persistent')
  })
})
