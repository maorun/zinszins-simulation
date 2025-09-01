/// <reference types="@testing-library/jest-dom" />
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DetailedSimulation from './DetailedSimulation';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('DetailedSimulation', () => {
    it('renders nothing when there is no simulation data', () => {
        const { container } = render(
            <SimulationProvider>
                <DetailedSimulation />
            </SimulationProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });
});
