import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkstationErrorBoundary } from './WorkstationErrorBoundary';

describe('WorkstationErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error', () => {
    function Child() {
      return <div data-testid="child">Child rendered</div>;
    }
    render(
      <WorkstationErrorBoundary>
        <Child />
      </WorkstationErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders fallback when error occurs', () => {
    function ThrowingChild(): React.ReactNode {
      throw new Error('Test error');
    }
    render(
      <WorkstationErrorBoundary>
        <ThrowingChild />
      </WorkstationErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error en el trabajo')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    function ThrowingChild(): React.ReactNode {
      throw new Error('Test error');
    }
    render(
      <WorkstationErrorBoundary onError={onError}>
        <ThrowingChild />
      </WorkstationErrorBoundary>
    );
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('renders custom fallback when provided', () => {
    function ThrowingChild(): React.ReactNode {
      throw new Error('Test error');
    }
    const { container } = render(
      <WorkstationErrorBoundary fallback={<div data-testid="custom-fallback">Custom Fallback</div>}>
        <ThrowingChild />
      </WorkstationErrorBoundary>
    );
    expect(container.querySelector('[data-testid="custom-fallback"]')).toBeInTheDocument();
  });

  it('reset button clears error and re-renders children', () => {
    let shouldThrow = true;
    function ToggleChild(): React.ReactNode {
      if (shouldThrow) throw new Error('Test error');
      return <div data-testid="child">Child rendered</div>;
    }
    const { rerender } = render(
      <WorkstationErrorBoundary key="boundary-1">
        <ToggleChild />
      </WorkstationErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    shouldThrow = false;
    rerender(
      <WorkstationErrorBoundary key="boundary-2">
        <ToggleChild />
      </WorkstationErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});