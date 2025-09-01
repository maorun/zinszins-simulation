/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FixedReturnConfiguration from './FixedReturnConfiguration';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('FixedReturnConfiguration', () => {
    it('renders the fixed return configuration section', () => {
        render(
            <SimulationProvider>
                <FixedReturnConfiguration />
            </SimulationProvider>
        );
        expect(screen.getByText('Feste Rendite')).toBeInTheDocument();
    });
});
