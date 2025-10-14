import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useInitialConfiguration } from './useInitialConfiguration'
import * as configStorage from '../../utils/config-storage'
import * as profileStorage from '../../utils/profile-storage'

// Mock the storage utilities
vi.mock('../../utils/config-storage')
vi.mock('../../utils/profile-storage')

describe('useInitialConfiguration', () => {
  const mockDefaultConfig = {
    rendite: 5,
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    startEnd: [2023, 2040] as [number, number],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns default config when no saved configuration exists', () => {
    vi.mocked(configStorage.loadConfiguration).mockReturnValue(null)
    vi.mocked(profileStorage.getActiveProfile).mockReturnValue(null)

    const { result } = renderHook(() => useInitialConfiguration(mockDefaultConfig as any))

    expect(result.current).toBe(mockDefaultConfig)
    expect(profileStorage.initializeProfileStorage).toHaveBeenCalledWith(undefined)
  })

  it('returns legacy config when it exists and no active profile', () => {
    const mockLegacyConfig = {
      rendite: 7,
      steuerlast: 25,
      teilfreistellungsquote: 30,
      startEnd: [2024, 2045] as [number, number],
    }

    vi.mocked(configStorage.loadConfiguration).mockReturnValue(mockLegacyConfig as any)
    vi.mocked(profileStorage.getActiveProfile).mockReturnValue(null)

    const { result } = renderHook(() => useInitialConfiguration(mockDefaultConfig as any))

    expect(result.current).toEqual(mockLegacyConfig)
    expect(profileStorage.initializeProfileStorage).toHaveBeenCalledWith(mockLegacyConfig)
  })

  it('returns active profile config when available', () => {
    const mockProfileConfig = {
      rendite: 6,
      steuerlast: 26,
      teilfreistellungsquote: 30,
      startEnd: [2025, 2050] as [number, number],
    }

    const mockLegacyConfig = {
      rendite: 7,
      steuerlast: 25,
      teilfreistellungsquote: 30,
      startEnd: [2024, 2045] as [number, number],
    }

    vi.mocked(configStorage.loadConfiguration).mockReturnValue(mockLegacyConfig as any)
    vi.mocked(profileStorage.getActiveProfile).mockReturnValue({
      id: 'profile-1',
      name: 'Test Profile',
      configuration: mockProfileConfig as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const { result } = renderHook(() => useInitialConfiguration(mockDefaultConfig as any))

    expect(result.current).toEqual(mockProfileConfig)
    expect(profileStorage.initializeProfileStorage).toHaveBeenCalledWith(mockLegacyConfig)
  })

  it('initializes profile storage with legacy config', () => {
    const mockLegacyConfig = {
      rendite: 7,
      steuerlast: 25,
      teilfreistellungsquote: 30,
      startEnd: [2024, 2045] as [number, number],
    }

    vi.mocked(configStorage.loadConfiguration).mockReturnValue(mockLegacyConfig as any)
    vi.mocked(profileStorage.getActiveProfile).mockReturnValue(null)

    renderHook(() => useInitialConfiguration(mockDefaultConfig as any))

    expect(profileStorage.initializeProfileStorage).toHaveBeenCalledWith(mockLegacyConfig)
  })

  it('memoizes result based on defaultConfig', () => {
    vi.mocked(configStorage.loadConfiguration).mockReturnValue(null)
    vi.mocked(profileStorage.getActiveProfile).mockReturnValue(null)

    const { result, rerender } = renderHook(
      ({ config }) => useInitialConfiguration(config),
      { initialProps: { config: mockDefaultConfig as any } },
    )

    const firstResult = result.current

    // Rerender with same config - should return same reference
    rerender({ config: mockDefaultConfig as any })
    expect(result.current).toBe(firstResult)

    // Rerender with different config - should return new reference
    const newConfig = { ...mockDefaultConfig, rendite: 8 }
    rerender({ config: newConfig as any })
    expect(result.current).not.toBe(firstResult)
  })
})
