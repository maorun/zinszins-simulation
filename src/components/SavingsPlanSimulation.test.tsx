/// <reference types="@testing-library/jest-dom" />
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SavingsPlanSimulation from './SavingsPlanSimulation';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('SavingsPlanSimulation', () => {
    it('renders nothing when there is no simulation data', () => {
        const { container } = render(
            <SimulationProvider>
                <SavingsPlanSimulation />
            </SimulationProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });
});
