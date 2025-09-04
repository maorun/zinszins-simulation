/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReturnConfiguration from './ReturnConfiguration';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('ReturnConfiguration', () => {
    it('renders the fixed return configuration by default', () => {
        render(
            <SimulationProvider>
                <ReturnConfiguration />
            </SimulationProvider>
        );
        expect(screen.getByRole('radio', { name: 'Feste Rendite Konstanter jährlicher Zinssatz' })).toBeChecked();
    });
});
