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
        // Check that return configuration is rendered
        expect(screen.getByText('📈 Rendite-Konfiguration (Sparphase)')).toBeInTheDocument();
        // Check that the RadioTileGroup displays the option texts
        expect(screen.getAllByText('Feste Rendite')).toHaveLength(2); // One in the tile, one as the label
        expect(screen.getByText('Zufällige Rendite')).toBeInTheDocument();
        expect(screen.getByText('Variable Rendite')).toBeInTheDocument();
    });
});
