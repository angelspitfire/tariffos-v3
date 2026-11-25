import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useManifestKeyboard } from './useManifestKeyboard';

describe('useManifestKeyboard', () => {
  it('navigates next on ArrowDown or J', () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    renderHook(() =>
      useManifestKeyboard({
        enabled: true,
        onNext,
        onPrev,
        onApprove: vi.fn(),
        onArbitrate: vi.fn(),
      })
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    expect(onNext).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
    });
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it('navigates previous on ArrowUp or K', () => {
    const onPrev = vi.fn();
    renderHook(() =>
      useManifestKeyboard({
        enabled: true,
        onNext: vi.fn(),
        onPrev,
        onApprove: vi.fn(),
        onArbitrate: vi.fn(),
      })
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });
    expect(onPrev).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });
    expect(onPrev).toHaveBeenCalledTimes(2);
  });

  it('calls onApprove on Enter', () => {
    const onApprove = vi.fn();
    renderHook(() =>
      useManifestKeyboard({
        enabled: true,
        onNext: vi.fn(),
        onPrev: vi.fn(),
        onApprove,
        onArbitrate: vi.fn(),
      })
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('does not trigger when target is an input or textarea', () => {
    const onNext = vi.fn();
    renderHook(() =>
      useManifestKeyboard({
        enabled: true,
        onNext,
        onPrev: vi.fn(),
        onApprove: vi.fn(),
        onArbitrate: vi.fn(),
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { key: 'j', bubbles: true });
    Object.defineProperty(event, 'target', { value: input });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(onNext).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
