import { render, screen, fireEvent } from '@testing-library/react';
import { SegmentedComparisonConfiguration } from './SegmentedComparisonConfiguration';
import type { SegmentedComparisonStrategy } from '../utils/config-storage';
import type { WithdrawalStrategy } from '../../helpers/withdrawal';
import { describe, it, expect, vi } from 'vitest';

const mockStrategy: SegmentedComparisonStrategy = {
  id: 'test-strategy-1',
  name: 'Test Configuration',
  segments: [
    {
      id: 'segment-1',
      name: 'Phase 1',
      startYear: 2041,
      endYear: 2060,
      strategy: '4prozent' as WithdrawalStrategy,
      withdrawalFrequency: 'yearly',
      returnConfig: {
        mode: 'fixed',
        fixedRate: 0.05,
      },
      inflationConfig: {
        inflationRate: 0.02,
      },
      enableGrundfreibetrag: false,
      incomeTaxRate: 0.18,
      steuerReduzierenEndkapital: true,
    },
  ],
};

describe('SegmentedComparisonConfiguration', () => {
  const defaultProps = {
    segmentedComparisonStrategies: [],
    withdrawalStartYear: 2041,
    withdrawalEndYear: 2080,
    onAddStrategy: vi.fn(),
    onUpdateStrategy: vi.fn(),
    onRemoveStrategy: vi.fn(),
  };

  it('renders the component with initial empty state', () => {
    render(<SegmentedComparisonConfiguration {...defaultProps} />);
    
    expect(screen.getByText('Geteilte Phasen Vergleich')).toBeInTheDocument();
    expect(screen.getByText(/Erstelle und vergleiche verschiedene Konfigurationen/)).toBeInTheDocument();
    expect(screen.getByText('Neue Konfiguration hinzufügen')).toBeInTheDocument();
    expect(screen.getByText(/Noch keine Vergleichskonfigurationen erstellt/)).toBeInTheDocument();
  });

  it('calls onAddStrategy when add button is clicked', () => {
    const onAddStrategy = vi.fn();
    render(<SegmentedComparisonConfiguration {...defaultProps} onAddStrategy={onAddStrategy} />);
    
    fireEvent.click(screen.getByText('Neue Konfiguration hinzufügen'));
    
    expect(onAddStrategy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^segmented_strategy_\d+$/),
        name: 'Konfiguration 1',
        segments: expect.arrayContaining([
          expect.objectContaining({
            id: 'main',
            name: 'Hauptphase',
            startYear: 2041,
            endYear: 2080,
            strategy: '4prozent' as WithdrawalStrategy,
          }),
        ]),
      }),
    );
  });

  it('renders existing strategies correctly', () => {
    const strategies = [mockStrategy];
    render(
      <SegmentedComparisonConfiguration
        {...defaultProps}
        segmentedComparisonStrategies={strategies}
      />
    );
    
    expect(screen.getByDisplayValue('Test Configuration')).toBeInTheDocument();
    expect(screen.getByText(/Phasen konfigurieren \(1 Phase\)/)).toBeInTheDocument();
    expect(screen.queryByText(/Noch keine Vergleichskonfigurationen erstellt/)).not.toBeInTheDocument();
  });

  it('calls onUpdateStrategy when strategy name is changed', () => {
    const onUpdateStrategy = vi.fn();
    const strategies = [mockStrategy];
    render(
      <SegmentedComparisonConfiguration
        {...defaultProps}
        segmentedComparisonStrategies={strategies}
        onUpdateStrategy={onUpdateStrategy}
      />
    );
    
    const nameInput = screen.getByDisplayValue('Test Configuration');
    fireEvent.change(nameInput, { target: { value: 'Updated Configuration' } });
    
    expect(onUpdateStrategy).toHaveBeenCalledWith('test-strategy-1', {
      name: 'Updated Configuration',
    });
  });

  it('calls onRemoveStrategy when remove button is clicked', () => {
    const onRemoveStrategy = vi.fn();
    const strategies = [mockStrategy];
    render(
      <SegmentedComparisonConfiguration
        {...defaultProps}
        segmentedComparisonStrategies={strategies}
        onRemoveStrategy={onRemoveStrategy}
      />
    );
    
    // Find the remove button by its accessible label
    const removeButton = screen.getByRole('button', { name: /Konfiguration löschen/i });
    fireEvent.click(removeButton);
    
    expect(onRemoveStrategy).toHaveBeenCalledWith('test-strategy-1');
  });

  it('handles multiple strategies correctly', () => {
    const strategies = [
      mockStrategy,
      {
        ...mockStrategy,
        id: 'test-strategy-2',
        name: 'Second Configuration',
        segments: [
          {
            ...mockStrategy.segments[0],
            id: 'segment-2',
            name: 'Phase 2',
          },
          {
            ...mockStrategy.segments[0],
            id: 'segment-3',
            name: 'Phase 3',
            startYear: 2061,
            endYear: 2080,
          },
        ],
      },
    ];

    render(
      <SegmentedComparisonConfiguration
        {...defaultProps}
        segmentedComparisonStrategies={strategies}
      />
    );
    
    expect(screen.getByDisplayValue('Test Configuration')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Second Configuration')).toBeInTheDocument();
    expect(screen.getByText(/Phasen konfigurieren \(1 Phase\)/)).toBeInTheDocument();
    expect(screen.getByText(/Phasen konfigurieren \(2 Phasen\)/)).toBeInTheDocument();
  });

  it('displays helpful information section', () => {
    const strategies = [mockStrategy];
    render(
      <SegmentedComparisonConfiguration
        {...defaultProps}
        segmentedComparisonStrategies={strategies}
      />
    );
    
    expect(screen.getByText('💡 Hinweise zum Vergleich')).toBeInTheDocument();
    expect(screen.getByText(/Jede Konfiguration kann verschiedene Phasen/)).toBeInTheDocument();
    expect(screen.getByText(/Der Vergleich zeigt Endkapital/)).toBeInTheDocument();
    expect(screen.getByText(/Alle Konfigurationen verwenden das gleiche Startkapital/)).toBeInTheDocument();
  });

  it('handles empty segments array gracefully', () => {
    const strategyWithEmptySegments = {
      ...mockStrategy,
      segments: [],
    };
    
    render(
      <SegmentedComparisonConfiguration
        {...defaultProps}
        segmentedComparisonStrategies={[strategyWithEmptySegments]}
      />
    );
    
    expect(screen.getByText(/Phasen konfigurieren \(0 Phasen\)/)).toBeInTheDocument();
  });

  it('generates correct strategy names for multiple additions', () => {
    const onAddStrategy = vi.fn();
    const existingStrategies = [mockStrategy]; // 1 existing strategy
    
    render(
      <SegmentedComparisonConfiguration
        {...defaultProps}
        segmentedComparisonStrategies={existingStrategies}
        onAddStrategy={onAddStrategy}
      />
    );
    
    fireEvent.click(screen.getByText('Neue Konfiguration hinzufügen'));
    
    expect(onAddStrategy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Konfiguration 2', // Should be 2 since there's 1 existing
      }),
    );
  });
});