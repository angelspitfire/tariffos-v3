import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls onToggleModal when ? key pressed without modifiers', () => {
    const onToggleModal = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useKeyboardShortcuts({ onToggleModal }));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    const handler = addEventListenerSpy.mock.calls[0][1] as (e: KeyboardEvent) => void;

    act(() => {
      handler(new KeyboardEvent('keydown', { key: '?' }));
    });

    expect(onToggleModal).toHaveBeenCalledTimes(1);
  });

  it('does not call onToggleModal when ? pressed with Ctrl modifier', () => {
    const onToggleModal = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useKeyboardShortcuts({ onToggleModal }));

    const handler = addEventListenerSpy.mock.calls[0][1] as (e: KeyboardEvent) => void;

    act(() => {
      handler(new KeyboardEvent('keydown', { key: '?', ctrlKey: true }));
    });

    expect(onToggleModal).not.toHaveBeenCalled();
  });

  it('does not call onToggleModal when ? pressed with Meta modifier', () => {
    const onToggleModal = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useKeyboardShortcuts({ onToggleModal }));

    const handler = addEventListenerSpy.mock.calls[0][1] as (e: KeyboardEvent) => void;

    act(() => {
      handler(new KeyboardEvent('keydown', { key: '?', metaKey: true }));
    });

    expect(onToggleModal).not.toHaveBeenCalled();
  });

  it('does not call onToggleModal when ? pressed with Shift modifier', () => {
    const onToggleModal = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useKeyboardShortcuts({ onToggleModal }));

    const handler = addEventListenerSpy.mock.calls[0][1] as (e: KeyboardEvent) => void;

    act(() => {
      handler(new KeyboardEvent('keydown', { key: '?', shiftKey: true }));
    });

    expect(onToggleModal).not.toHaveBeenCalled();
  });

  it('removes event listener on unmount', () => {
    const onToggleModal = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcuts({ onToggleModal }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});