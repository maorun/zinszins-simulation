/// <reference types="@testing-library/jest-dom" />
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SimulationResults from './SimulationResults';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('SimulationResults', () => {
    it('renders nothing when there is no simulation data', () => {
        const { container } = render(
            <SimulationProvider>
                <SimulationResults />
            </SimulationProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });
});
