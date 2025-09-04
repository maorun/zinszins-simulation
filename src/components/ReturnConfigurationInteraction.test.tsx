/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReturnConfiguration from './ReturnConfiguration';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('ReturnConfiguration', () => {
    it('renders the random return configuration when the random radio button is clicked', () => {
        render(
            <SimulationProvider>
                <ReturnConfiguration />
            </SimulationProvider>
        );
        fireEvent.click(screen.getByRole('radio', { name: 'Zufällige Rendite Monte Carlo Simulation mit Durchschnitt und Volatilität' }));
        expect(screen.getByText('Durchschnittliche Rendite')).toBeInTheDocument();
    });

    it('renders the variable return configuration when the variable radio button is clicked', () => {
        render(
            <SimulationProvider>
                <ReturnConfiguration />
            </SimulationProvider>
        );
        fireEvent.click(screen.getByRole('radio', { name: 'Variable Rendite Jahr-für-Jahr konfigurierbare Renditen' }));
        expect(screen.getByText('Variable Renditen pro Jahr')).toBeInTheDocument();
    });
});
