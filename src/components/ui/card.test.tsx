import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardContent, CardFooter } from './card';
import { NestingProvider } from '../../lib/nesting-context';

describe('Enhanced Card Components', () => {
  it('should render Card with default nesting level 0', () => {
    render(
      <Card data-testid="card">
        <CardContent>Test content</CardContent>
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-nesting-level', '0');
    expect(card).toHaveClass('rounded-xl');
  });

  it('should apply different styles based on nesting level', () => {
    render(
      <NestingProvider level={0}>
        <Card nestingLevel={2} data-testid="nested-card">
          <CardHeader nestingLevel={2}>
            <h1>Header</h1>
          </CardHeader>
          <CardContent nestingLevel={2}>
            Content
          </CardContent>
          <CardFooter nestingLevel={2}>
            Footer
          </CardFooter>
        </Card>
      </NestingProvider>
    );

    const card = screen.getByTestId('nested-card');
    expect(card).toHaveAttribute('data-nesting-level', '2');
    expect(card).toHaveClass('rounded-md');
    expect(card).toHaveClass('mx-2');
  });

  it('should apply progressive spacing for deep nesting', () => {
    render(
      <Card nestingLevel={4} data-testid="deep-card">
        <CardHeader nestingLevel={4}>
          <h1>Deep Header</h1>
        </CardHeader>
        <CardContent nestingLevel={4}>
          Deep Content
        </CardContent>
      </Card>
    );

    const card = screen.getByTestId('deep-card');
    expect(card).toHaveAttribute('data-nesting-level', '4');
    expect(card).toHaveClass('border-l-4');
    expect(card).toHaveClass('mx-4');
  });
});