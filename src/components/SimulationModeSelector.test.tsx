/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SimulationModeSelector from './SimulationModeSelector';
import { SimulationProvider } from '../contexts/SimulationContext';

describe('SimulationModeSelector', () => {
    it('renders the simulation mode selector tabs', () => {
        render(
            <SimulationProvider>
                <SimulationModeSelector />
            </SimulationProvider>
        );
        expect(screen.getByText('Ansparen')).toBeInTheDocument();
        expect(screen.getByText('Entnehmen')).toBeInTheDocument();
    });
});
