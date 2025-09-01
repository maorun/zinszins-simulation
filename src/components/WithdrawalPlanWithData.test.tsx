/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WithdrawalPlan from './WithdrawalPlan';
import * as useSimulation from '../contexts/useSimulation';

const mockSimulationData = {
    sparplanElements: [
        {
            name: "Test Sparplan",
            start: "2023-01-01",
            end: "2024-01-01",
            rate: 100,
            rateInterval: "monthly",
            value: 100
        }
    ]
}

describe('WithdrawalPlan with simulation data', () => {
    it('renders the withdrawal plan section', () => {
        const useSimulationSpy = vi.spyOn(useSimulation, 'useSimulation');
        useSimulationSpy.mockReturnValue({
            simulationData: mockSimulationData,
            startEnd: [2040, 2080],
            setStartEnd: vi.fn(),
            setWithdrawalResults: vi.fn(),
            steuerlast: 26.375,
            teilfreistellungsquote: 30,
            // Add withdrawal config properties
            withdrawalConfig: null,
            setWithdrawalConfig: vi.fn(),
        } as any);

        render(
            <WithdrawalPlan />
        );
        expect(screen.getByRole('heading', { name: /Entnahme/ })).toBeInTheDocument();
        useSimulationSpy.mockRestore();
    });
});
