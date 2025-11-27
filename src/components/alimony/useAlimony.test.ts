import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAlimony } from './useAlimony'

// Mock the useSimulation hook
vi.mock('../../contexts/useSimulation', () => ({
  useSimulation: () => ({
    alimonyConfig: {
      enabled: false,
      payments: [],
    },
    setAlimonyConfig: vi.fn(),
  }),
}))

describe('useAlimony', () => {
  it('should return config and handlers', () => {
    const { result } = renderHook(() => useAlimony())

    expect(result.current.config).toBeDefined()
    expect(result.current.handleToggleEnabled).toBeDefined()
    expect(result.current.handleAddPayment).toBeDefined()
    expect(result.current.handleUpdatePayment).toBeDefined()
    expect(result.current.handleRemovePayment).toBeDefined()
  })

  it('should have correct initial config', () => {
    const { result } = renderHook(() => useAlimony())

    expect(result.current.config.enabled).toBe(false)
    expect(result.current.config.payments).toEqual([])
  })

  it('should provide toggle handler', () => {
    const { result } = renderHook(() => useAlimony())

    expect(typeof result.current.handleToggleEnabled).toBe('function')
  })

  it('should provide add payment handler', () => {
    const { result } = renderHook(() => useAlimony())

    expect(typeof result.current.handleAddPayment).toBe('function')
  })

  it('should provide update payment handler', () => {
    const { result } = renderHook(() => useAlimony())

    expect(typeof result.current.handleUpdatePayment).toBe('function')
  })

  it('should provide remove payment handler', () => {
    const { result } = renderHook(() => useAlimony())

    expect(typeof result.current.handleRemovePayment).toBe('function')
  })
})
