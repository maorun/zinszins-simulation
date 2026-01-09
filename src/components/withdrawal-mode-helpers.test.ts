/**
 * Tests for Withdrawal Mode Helper Functions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleWithdrawalModeChange,
  handleAddComparisonStrategy,
  handleRemoveComparisonStrategy,
} from './withdrawal-mode-helpers'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'

describe('withdrawal-mode-helpers', () => {
  describe('handleWithdrawalModeChange', () => {
    let mockUpdateConfig: ReturnType<typeof vi.fn>
    const startOfIndependence = 2040
    const globalEndOfLife = 2070

    beforeEach(() => {
      mockUpdateConfig = vi.fn()
    })

    it('should enable comparison mode when mode is "comparison"', () => {
      handleWithdrawalModeChange({
        mode: 'comparison',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalledWith({
        useComparisonMode: true,
        useSegmentedWithdrawal: false,
        useSegmentedComparisonMode: false,
      })
    })

    it('should enable segmented mode when mode is "segmented"', () => {
      handleWithdrawalModeChange({
        mode: 'segmented',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalled()
      // First call for mode flags
      expect(mockUpdateConfig.mock.calls[0][0]).toEqual({
        useComparisonMode: false,
        useSegmentedWithdrawal: true,
        useSegmentedComparisonMode: false,
      })
    })

    it('should enable segmented comparison mode when mode is "segmented-comparison"', () => {
      handleWithdrawalModeChange({
        mode: 'segmented-comparison',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalledWith({
        useComparisonMode: false,
        useSegmentedWithdrawal: false,
        useSegmentedComparisonMode: true,
      })
    })

    it('should disable all modes when mode is "unified" or other', () => {
      handleWithdrawalModeChange({
        mode: 'unified',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalledWith({
        useComparisonMode: false,
        useSegmentedWithdrawal: false,
        useSegmentedComparisonMode: false,
      })
    })

    it('should initialize segments when switching to segmented mode with empty segments', () => {
      handleWithdrawalModeChange({
        mode: 'segmented',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalledTimes(2)
      
      // First call: mode flags
      expect(mockUpdateConfig.mock.calls[0][0]).toEqual({
        useComparisonMode: false,
        useSegmentedWithdrawal: true,
        useSegmentedComparisonMode: false,
      })

      // Second call: initialize segments
      const secondCall = mockUpdateConfig.mock.calls[1][0]
      expect(secondCall).toHaveProperty('withdrawalSegments')
      expect(Array.isArray(secondCall.withdrawalSegments)).toBe(true)
      expect(secondCall.withdrawalSegments).toHaveLength(1)
    })

    it('should not initialize segments when switching to segmented mode with existing segments', () => {
      const existingSegments: WithdrawalSegment[] = [
        {
          id: 'test-segment',
          name: 'Test Segment',
          startYear: 2041,
          endYear: 2055,
          strategy: '4prozent' as const,
          withdrawalFrequency: 'yearly' as const,
          returnConfig: {
            mode: 'fixed',
            fixedRate: 0.05,
          },
        },
      ]

      handleWithdrawalModeChange({
        mode: 'segmented',
        withdrawalSegments: existingSegments,
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      // Should only update mode flags, not create new segments
      expect(mockUpdateConfig).toHaveBeenCalledTimes(1)
      expect(mockUpdateConfig).toHaveBeenCalledWith({
        useComparisonMode: false,
        useSegmentedWithdrawal: true,
        useSegmentedComparisonMode: false,
      })
    })

    it('should create initial segment with correct year range (15 years)', () => {
      handleWithdrawalModeChange({
        mode: 'segmented',
        withdrawalSegments: [],
        startOfIndependence: 2040,
        globalEndOfLife: 2070,
        updateConfig: mockUpdateConfig,
      })

      const segmentsCall = mockUpdateConfig.mock.calls[1][0]
      const segment = segmentsCall.withdrawalSegments[0]
      
      expect(segment.startYear).toBe(2041) // startOfIndependence + 1
      expect(segment.endYear).toBe(2055) // 2041 + 14 (15 years total)
      expect(segment.name).toBe('Frühphase')
    })

    it('should cap initial segment at globalEndOfLife if less than 15 years remaining', () => {
      handleWithdrawalModeChange({
        mode: 'segmented',
        withdrawalSegments: [],
        startOfIndependence: 2040,
        globalEndOfLife: 2045, // Only 5 years after independence
        updateConfig: mockUpdateConfig,
      })

      const segmentsCall = mockUpdateConfig.mock.calls[1][0]
      const segment = segmentsCall.withdrawalSegments[0]
      
      expect(segment.startYear).toBe(2041)
      expect(segment.endYear).toBe(2045) // Capped at globalEndOfLife
    })

    it('should handle edge case where independence year equals end of life', () => {
      handleWithdrawalModeChange({
        mode: 'segmented',
        withdrawalSegments: [],
        startOfIndependence: 2040,
        globalEndOfLife: 2041,
        updateConfig: mockUpdateConfig,
      })

      const segmentsCall = mockUpdateConfig.mock.calls[1][0]
      const segment = segmentsCall.withdrawalSegments[0]
      
      expect(segment.startYear).toBe(2041)
      expect(segment.endYear).toBe(2041) // Same year
    })

    it('should not initialize segments for comparison mode', () => {
      handleWithdrawalModeChange({
        mode: 'comparison',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      // Should only be called once for mode flags
      expect(mockUpdateConfig).toHaveBeenCalledTimes(1)
    })

    it('should not initialize segments for segmented-comparison mode', () => {
      handleWithdrawalModeChange({
        mode: 'segmented-comparison',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      // Should only be called once for mode flags
      expect(mockUpdateConfig).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleAddComparisonStrategy', () => {
    let mockUpdateConfig: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockUpdateConfig = vi.fn()
    })

    it('should add new strategy to empty comparison strategies', () => {
      handleAddComparisonStrategy({
        comparisonStrategies: [],
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalledTimes(1)
      const callArgs = mockUpdateConfig.mock.calls[0][0]
      
      expect(callArgs).toHaveProperty('comparisonStrategies')
      expect(Array.isArray(callArgs.comparisonStrategies)).toBe(true)
      expect(callArgs.comparisonStrategies).toHaveLength(1)
    })

    it('should add new strategy to existing strategies', () => {
      const existingStrategies = [
        { id: 'strategy1', name: '4% Regel', strategie: '4prozent', rendite: 5 },
      ]

      handleAddComparisonStrategy({
        comparisonStrategies: existingStrategies,
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      expect(callArgs.comparisonStrategies).toHaveLength(2)
      expect(callArgs.comparisonStrategies[0]).toEqual(existingStrategies[0])
    })

    it('should create strategy with default properties', () => {
      handleAddComparisonStrategy({
        comparisonStrategies: [],
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      const newStrategy = callArgs.comparisonStrategies[0]
      
      expect(newStrategy).toHaveProperty('id')
      expect(newStrategy.name).toBe('3% Regel')
      expect(newStrategy.strategie).toBe('3prozent')
      expect(newStrategy.rendite).toBe(5)
    })

    it('should generate unique ID based on timestamp', () => {
      const beforeTimestamp = Date.now()
      
      handleAddComparisonStrategy({
        comparisonStrategies: [],
        updateConfig: mockUpdateConfig,
      })

      const afterTimestamp = Date.now()
      const callArgs = mockUpdateConfig.mock.calls[0][0]
      const newStrategy = callArgs.comparisonStrategies[0]
      
      expect(newStrategy.id).toMatch(/^strategy\d+$/)
      
      // Extract timestamp from ID
      const idTimestamp = parseInt(newStrategy.id.replace('strategy', ''))
      expect(idTimestamp).toBeGreaterThanOrEqual(beforeTimestamp)
      expect(idTimestamp).toBeLessThanOrEqual(afterTimestamp)
    })

    it('should not modify original strategies array', () => {
      const originalStrategies = [
        { id: 'strategy1', name: '4% Regel' },
      ]
      const originalLength = originalStrategies.length

      handleAddComparisonStrategy({
        comparisonStrategies: originalStrategies,
        updateConfig: mockUpdateConfig,
      })

      // Original array should not be modified
      expect(originalStrategies).toHaveLength(originalLength)
    })

    it('should preserve existing strategies when adding new one', () => {
      const existingStrategies = [
        { id: 'strategy1', name: '4% Regel', strategie: '4prozent' },
        { id: 'strategy2', name: 'Variable', strategie: 'variable' },
      ]

      handleAddComparisonStrategy({
        comparisonStrategies: existingStrategies,
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      expect(callArgs.comparisonStrategies).toHaveLength(3)
      
      // Check first two strategies are preserved
      expect(callArgs.comparisonStrategies[0]).toEqual(existingStrategies[0])
      expect(callArgs.comparisonStrategies[1]).toEqual(existingStrategies[1])
    })
  })

  describe('handleRemoveComparisonStrategy', () => {
    let mockUpdateConfig: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockUpdateConfig = vi.fn()
    })

    it('should remove strategy by id', () => {
      const strategies = [
        { id: 'strategy1', name: '4% Regel' },
        { id: 'strategy2', name: '3% Regel' },
        { id: 'strategy3', name: 'Variable' },
      ]

      handleRemoveComparisonStrategy({
        id: 'strategy2',
        comparisonStrategies: strategies,
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      expect(callArgs.comparisonStrategies).toHaveLength(2)
      expect(callArgs.comparisonStrategies.find((s: { id: string }) => s.id === 'strategy2')).toBeUndefined()
    })

    it('should preserve other strategies when removing one', () => {
      const strategies = [
        { id: 'strategy1', name: '4% Regel' },
        { id: 'strategy2', name: '3% Regel' },
        { id: 'strategy3', name: 'Variable' },
      ]

      handleRemoveComparisonStrategy({
        id: 'strategy2',
        comparisonStrategies: strategies,
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      expect(callArgs.comparisonStrategies).toContainEqual(strategies[0])
      expect(callArgs.comparisonStrategies).toContainEqual(strategies[2])
    })

    it('should handle removing the only strategy', () => {
      const strategies = [
        { id: 'strategy1', name: '4% Regel' },
      ]

      handleRemoveComparisonStrategy({
        id: 'strategy1',
        comparisonStrategies: strategies,
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      expect(callArgs.comparisonStrategies).toHaveLength(0)
      expect(Array.isArray(callArgs.comparisonStrategies)).toBe(true)
    })

    it('should handle removing from empty array', () => {
      handleRemoveComparisonStrategy({
        id: 'strategy1',
        comparisonStrategies: [],
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      expect(callArgs.comparisonStrategies).toHaveLength(0)
    })

    it('should handle removing non-existent id', () => {
      const strategies = [
        { id: 'strategy1', name: '4% Regel' },
        { id: 'strategy2', name: '3% Regel' },
      ]

      handleRemoveComparisonStrategy({
        id: 'nonexistent',
        comparisonStrategies: strategies,
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      expect(callArgs.comparisonStrategies).toHaveLength(2)
      expect(callArgs.comparisonStrategies).toEqual(strategies)
    })

    it('should not modify original strategies array', () => {
      const originalStrategies = [
        { id: 'strategy1', name: '4% Regel' },
        { id: 'strategy2', name: '3% Regel' },
      ]
      const originalLength = originalStrategies.length

      handleRemoveComparisonStrategy({
        id: 'strategy1',
        comparisonStrategies: originalStrategies,
        updateConfig: mockUpdateConfig,
      })

      // Original array should not be modified
      expect(originalStrategies).toHaveLength(originalLength)
    })

    it('should call updateConfig exactly once', () => {
      const strategies = [
        { id: 'strategy1', name: '4% Regel' },
      ]

      handleRemoveComparisonStrategy({
        id: 'strategy1',
        comparisonStrategies: strategies,
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalledTimes(1)
    })

    it('should handle removing first strategy', () => {
      const strategies = [
        { id: 'strategy1', name: '4% Regel' },
        { id: 'strategy2', name: '3% Regel' },
        { id: 'strategy3', name: 'Variable' },
      ]

      handleRemoveComparisonStrategy({
        id: 'strategy1',
        comparisonStrategies: strategies,
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      expect(callArgs.comparisonStrategies).toHaveLength(2)
      expect(callArgs.comparisonStrategies[0].id).toBe('strategy2')
      expect(callArgs.comparisonStrategies[1].id).toBe('strategy3')
    })

    it('should handle removing last strategy', () => {
      const strategies = [
        { id: 'strategy1', name: '4% Regel' },
        { id: 'strategy2', name: '3% Regel' },
        { id: 'strategy3', name: 'Variable' },
      ]

      handleRemoveComparisonStrategy({
        id: 'strategy3',
        comparisonStrategies: strategies,
        updateConfig: mockUpdateConfig,
      })

      const callArgs = mockUpdateConfig.mock.calls[0][0]
      expect(callArgs.comparisonStrategies).toHaveLength(2)
      expect(callArgs.comparisonStrategies[0].id).toBe('strategy1')
      expect(callArgs.comparisonStrategies[1].id).toBe('strategy2')
    })
  })

  describe('Integration: Complete Workflow', () => {
    it('should support switching between different modes', () => {
      const mockUpdateConfig = vi.fn()
      const startOfIndependence = 2040
      const globalEndOfLife = 2070

      // Start with unified mode
      handleWithdrawalModeChange({
        mode: 'unified',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      // Switch to comparison mode
      handleWithdrawalModeChange({
        mode: 'comparison',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      // Switch to segmented mode
      handleWithdrawalModeChange({
        mode: 'segmented',
        withdrawalSegments: [],
        startOfIndependence,
        globalEndOfLife,
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalled()
      expect(mockUpdateConfig.mock.calls.length).toBeGreaterThan(2)
    })

    it('should support adding and removing comparison strategies', () => {
      const mockUpdateConfig = vi.fn()
      
      // Add first strategy
      handleAddComparisonStrategy({
        comparisonStrategies: [],
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalledTimes(1)
      
      // Add second strategy using a fresh mock to avoid state issues
      mockUpdateConfig.mockClear()
      handleAddComparisonStrategy({
        comparisonStrategies: [{ id: 'test1' } as { id: string }],
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalledTimes(1)
      const addCall = mockUpdateConfig.mock.calls[0][0]
      expect(addCall.comparisonStrategies).toHaveLength(2)
      
      // Remove first strategy
      mockUpdateConfig.mockClear()
      handleRemoveComparisonStrategy({
        id: 'test1',
        comparisonStrategies: [
          { id: 'test1' },
          { id: 'test2' },
        ],
        updateConfig: mockUpdateConfig,
      })

      expect(mockUpdateConfig).toHaveBeenCalledTimes(1)
      const removeCall = mockUpdateConfig.mock.calls[0][0]
      expect(removeCall.comparisonStrategies).toHaveLength(1)
      expect(removeCall.comparisonStrategies[0].id).toBe('test2')
    })
  })
})
