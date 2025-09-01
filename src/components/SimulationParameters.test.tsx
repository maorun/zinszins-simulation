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
        expect(screen.getAllByText(/Konfiguration/)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Zeitspanne/)[0]).toBeInTheDocument();
        expect(screen.getByText(/Rendite-Konfiguration/)).toBeInTheDocument();
        expect(screen.getByText(/Steuer-Konfiguration/)).toBeInTheDocument();
        expect(screen.getByText(/Simulation-Konfiguration/)).toBeInTheDocument();
    });
});
