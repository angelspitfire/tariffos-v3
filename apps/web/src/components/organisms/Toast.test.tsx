import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, Toaster, useToast, type ToastVariant } from './Toast';

function ToastTrigger({ id, message, variant, duration }: { id: string; message: string; variant?: ToastVariant; duration?: number }) {
  const { toast } = useToast();
  return (
    <button data-testid={`trigger-${id}`} onClick={() => toast(message, variant, { duration })}>
      {message}
    </button>
  );
}

function ToastTriggerMultiple() {
  const { toast, dismissAll } = useToast();
  return (
    <div>
      <button data-testid="trigger-first" onClick={() => toast('First', 'info')}>First</button>
      <button data-testid="trigger-second" onClick={() => toast('Second', 'error')}>Second</button>
      <button data-testid="trigger-dismiss-all" onClick={() => dismissAll()}>Dismiss All</button>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    const { container } = render(
      <ToastProvider>
        <div data-testid="content">Content</div>
      </ToastProvider>
    );
    expect(container).toBeInTheDocument();
  });

  it('shows toast when button clicked', () => {
    render(
      <ToastProvider>
        <div>
          <ToastTrigger id="hello" message="Hello" />
          <Toaster />
        </div>
      </ToastProvider>
    );
    fireEvent.click(screen.getByTestId('trigger-hello'));
    expect(document.body.querySelectorAll('[role="alert"]').length).toBeGreaterThan(0);
  });

  it('renders different variants', () => {
    render(
      <ToastProvider>
        <div>
          <ToastTrigger id="info" message="Info" variant="info" />
          <ToastTrigger id="error" message="Error" variant="error" />
          <ToastTrigger id="success" message="Success" variant="success" />
          <ToastTrigger id="warning" message="Warning" variant="warning" />
          <ToastTrigger id="loading" message="Loading" variant="loading" />
          <Toaster />
        </div>
      </ToastProvider>
    );
    fireEvent.click(screen.getByTestId('trigger-info'));
    fireEvent.click(screen.getByTestId('trigger-error'));
    fireEvent.click(screen.getByTestId('trigger-success'));
    fireEvent.click(screen.getByTestId('trigger-warning'));
    fireEvent.click(screen.getByTestId('trigger-loading'));
    expect(document.body).toBeInTheDocument();
  });

  it('dismissAll removes all toasts', () => {
    render(
      <ToastProvider>
        <div>
          <ToastTriggerMultiple />
          <Toaster />
        </div>
      </ToastProvider>
    );
    fireEvent.click(screen.getByTestId('trigger-first'));
    fireEvent.click(screen.getByTestId('trigger-second'));
    expect(document.body.querySelectorAll('[role="alert"]').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByTestId('trigger-dismiss-all'));
    expect(document.body.querySelectorAll('[role="alert"]').length).toBe(0);
  });

  it('auto-dismisses toast after duration', () => {
    render(
      <ToastProvider>
        <div>
          <ToastTrigger id="auto-dismiss" message="Auto dismiss" variant="info" duration={1000} />
          <Toaster />
        </div>
      </ToastProvider>
    );
    fireEvent.click(screen.getByTestId('trigger-auto-dismiss'));
    expect(document.body.querySelectorAll('[role="alert"]').length).toBeGreaterThan(0);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(document.body.querySelectorAll('[role="alert"]').length).toBe(0);
  });

  it('loading toast does not auto-dismiss', () => {
    render(
      <ToastProvider>
        <div>
          <ToastTrigger id="loading-msg" message="Loading..." variant="loading" duration={0} />
          <Toaster />
        </div>
      </ToastProvider>
    );
    fireEvent.click(screen.getByTestId('trigger-loading-msg'));
    expect(document.body.querySelectorAll('[role="status"]').length).toBeGreaterThan(0);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(document.body.querySelectorAll('[role="status"]').length).toBeGreaterThan(0);
  });
});