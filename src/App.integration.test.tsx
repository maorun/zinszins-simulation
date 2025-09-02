/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

// Mock Vercel Analytics to avoid network calls in tests
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('loads the application with default values and basic functionality', async () => {
    render(<App />);
    
    // Check that the main page loads
    expect(screen.getByText('💼 Zinseszins-Simulation')).toBeInTheDocument();
    expect(screen.getByText('🔄 Neu berechnen')).toBeInTheDocument();
    
    // Check that main sections are present
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    expect(screen.getByText('💾 Konfiguration verwalten')).toBeInTheDocument();
    
    // Check tabs are present
    expect(screen.getByText('Ansparen')).toBeInTheDocument();
    expect(screen.getByText('Entnehmen')).toBeInTheDocument();
  });

  it('renders footer information correctly', async () => {
    render(<App />);
    
    // Check footer elements
    expect(screen.getByText('💼 Zinseszins-Simulation')).toBeInTheDocument();
    expect(screen.getByText('📧 by Marco')).toBeInTheDocument();
    expect(screen.getByText('🚀 Erstellt mit React, TypeScript & RSuite')).toBeInTheDocument();
  });
});