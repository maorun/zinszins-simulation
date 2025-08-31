/// <reference types="@testing-library/jest-dom" />
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WithdrawalPlan from './WithdrawalPlan';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('WithdrawalPlan', () => {
    it('renders nothing when there is no simulation data', () => {
        const { container } = render(
            <SimulationProvider>
                <WithdrawalPlan />
            </SimulationProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });
});
