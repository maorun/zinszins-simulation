/// <reference types="@testing-library/jest-dom" />
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import WithdrawalPlan from './WithdrawalPlan'
import * as useSimulation from '../contexts/useSimulation'

describe('WithdrawalPlan without simulation data', () => {
  it('renders nothing', () => {
    const useSimulationSpy = vi.spyOn(useSimulation, 'useSimulation')
    useSimulationSpy.mockReturnValue({
      simulationData: null,
    } as any)

    const { container } = render(
      <WithdrawalPlan />,
    )
    expect(container).toBeEmptyDOMElement()
    useSimulationSpy.mockRestore()
  })
})
