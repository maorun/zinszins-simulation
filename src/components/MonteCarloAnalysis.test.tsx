/// <reference types="@testing-library/jest-dom" />
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MonteCarloAnalysis from './MonteCarloAnalysis';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('MonteCarloAnalysis', () => {
    it('renders nothing when there is no simulation data', () => {
        const { container } = render(
            <SimulationProvider>
                <MonteCarloAnalysis />
            </SimulationProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });
});
