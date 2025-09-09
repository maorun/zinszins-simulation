/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReturnConfiguration from './ReturnConfiguration';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('ReturnConfiguration', () => {
    it('renders the random return configuration when the random radio button is clicked', async () => {
        render(
            <SimulationProvider>
                <ReturnConfiguration />
            </SimulationProvider>
        );
        
        // First expand the collapsible section
        const heading = screen.getByText('📈 Rendite-Konfiguration (Sparphase)');
        fireEvent.click(heading);
        
        // Wait for content to be visible, then click the random option
        await waitFor(() => {
            expect(screen.getByText('Zufällige Rendite')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Zufällige Rendite'));
        
        // Check that the random return configuration appears
        await waitFor(() => {
            expect(screen.getByText('Durchschnittliche Rendite')).toBeInTheDocument();
        });
    });

    it('renders the variable return configuration when the variable radio button is clicked', async () => {
        render(
            <SimulationProvider>
                <ReturnConfiguration />
            </SimulationProvider>
        );
        
        // First expand the collapsible section
        const heading = screen.getByText('📈 Rendite-Konfiguration (Sparphase)');
        fireEvent.click(heading);
        
        // Wait for content to be visible, then click the variable option
        await waitFor(() => {
            expect(screen.getByText('Variable Rendite')).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText('Variable Rendite'));
        
        // Check that the variable return configuration appears
        await waitFor(() => {
            expect(screen.getByText('Variable Renditen pro Jahr')).toBeInTheDocument();
        });
    });
});
