/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header', () => {
    it('renders the header with the correct title and subtitle', () => {
        render(<Header />);
        expect(screen.getByText('Zinseszins-Simulation')).toBeInTheDocument();
        expect(screen.getByText('Berechne deine Kapitalentwicklung mit deutschen Steuerregeln')).toBeInTheDocument();
    });
});
