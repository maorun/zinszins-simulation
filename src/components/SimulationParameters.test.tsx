/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SimulationParameters from './SimulationParameters';
import { SimulationProvider } from '../contexts/SimulationContext';

// Mock the navigator.clipboard API
const mockClipboard = {
  writeText: vi.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe('SimulationParameters', () => {
    beforeEach(() => {
        mockClipboard.writeText.mockReset();
    });

    it('renders the simulation parameters form', () => {
        render(
            <SimulationProvider>
                <SimulationParameters />
            </SimulationProvider>
        );
        expect(screen.getAllByText(/Konfiguration/)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Sparphase-Ende/)[0]).toBeInTheDocument();
        expect(screen.getByText(/Rendite-Konfiguration/)).toBeInTheDocument();
        expect(screen.getByText(/Steuer-Konfiguration/)).toBeInTheDocument();
        expect(screen.getByText(/Simulation-Konfiguration/)).toBeInTheDocument();
    });

    it('renders the parameter export button', () => {
        render(
            <SimulationProvider>
                <SimulationParameters />
            </SimulationProvider>
        );
        
        const exportButton = screen.getByRole('button', { name: /Parameter exportieren/ });
        expect(exportButton).toBeInTheDocument();
        expect(exportButton).toHaveAttribute('title', 'Exportiert alle Parameter in die Zwischenablage für Entwicklung und Fehlerbeschreibung');
    });

    it('handles parameter export successfully', async () => {
        mockClipboard.writeText.mockResolvedValue(undefined);
        
        render(
            <SimulationProvider>
                <SimulationParameters />
            </SimulationProvider>
        );
        
        const exportButton = screen.getByRole('button', { name: /Parameter exportieren/ });
        fireEvent.click(exportButton);

        // Button should show loading state
        expect(screen.getByText('Exportiere...')).toBeInTheDocument();

        // Wait for success state
        await waitFor(() => {
            expect(screen.getByText('✓ Kopiert!')).toBeInTheDocument();
        });

        expect(mockClipboard.writeText).toHaveBeenCalledOnce();
        expect(mockClipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('Rendite:'));
    });

    it('handles parameter export failure', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockClipboard.writeText.mockRejectedValue(new Error('Clipboard access denied'));
        
        render(
            <SimulationProvider>
                <SimulationParameters />
            </SimulationProvider>
        );
        
        const exportButton = screen.getByRole('button', { name: /Parameter exportieren/ });
        fireEvent.click(exportButton);

        // Wait for error state
        await waitFor(() => {
            expect(screen.getByText('✗ Fehler')).toBeInTheDocument();
        });

        expect(mockClipboard.writeText).toHaveBeenCalledOnce();
        
        consoleErrorSpy.mockRestore();
    });

    it('disables export button during export operation', async () => {
        // Create a promise we can resolve manually
        let resolveClipboard: () => void;
        const clipboardPromise = new Promise<void>((resolve) => {
            resolveClipboard = resolve;
        });
        mockClipboard.writeText.mockReturnValue(clipboardPromise);
        
        render(
            <SimulationProvider>
                <SimulationParameters />
            </SimulationProvider>
        );
        
        const exportButton = screen.getByRole('button', { name: /Parameter exportieren/ });
        fireEvent.click(exportButton);

        // Button should be disabled during export
        const loadingButton = screen.getByRole('button', { name: /Exportiere.../ });
        expect(loadingButton).toBeDisabled();

        // Resolve the clipboard operation
        resolveClipboard!();
        
        // Wait for completion
        await waitFor(() => {
            expect(screen.getByText('✓ Kopiert!')).toBeInTheDocument();
        });
    });
});
