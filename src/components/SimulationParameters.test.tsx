/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SimulationParameters from './SimulationParameters';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('SimulationParameters', () => {
    it('renders the simulation parameters form', () => {
        render(
            <SimulationProvider>
                <SimulationParameters />
            </SimulationProvider>
        );
        const allKonfiguration = screen.getAllByText(/Konfiguration/);
        expect(allKonfiguration.length).toBeGreaterThan(0);

        const allZeitspanne = screen.getAllByText(/Zeitspanne/);
        expect(allZeitspanne.length).toBeGreaterThan(0);

        const allRendite = screen.getAllByText(/Rendite-Konfiguration/);
        expect(allRendite.length).toBeGreaterThan(0);

        const allSteuer = screen.getAllByText(/Steuer-Konfiguration/);
        expect(allSteuer.length).toBeGreaterThan(0);

        const allSimulation = screen.getAllByText(/Simulation-Konfiguration/);
        expect(allSimulation.length).toBeGreaterThan(0);
    });
});
