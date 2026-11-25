import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

vi.mock('./KeyboardShortcutsConstants', () => ({
  shortcuts: [
    { key: '?', description: 'Show/hide this modal', category: 'navigation' },
    { key: 'J', description: 'Previous row', category: 'navigation' },
    { key: 'Ctrl + S', description: 'Save changes', category: 'edition' },
    { key: 'Ctrl + Shift + P', description: 'Open command palette', category: 'actions' },
    { key: 'Ctrl + Shift + I', description: 'Interact with AI', category: 'ai' },
  ],
  categoryLabels: {
    navigation: 'Navigation',
    edition: 'Edition',
    actions: 'Actions',
    ai: 'AI/Chat',
  },
}));

vi.mock('./hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

describe('KeyboardShortcutsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when isOpen=true', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('does not render modal content when isOpen=false', () => {
    render(<KeyboardShortcutsModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('filters shortcuts by search term', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText('Search shortcuts...');
    fireEvent.change(input, { target: { value: 'save' } });
    expect(screen.getByText('Ctrl + S')).toBeInTheDocument();
    expect(screen.queryByText('?')).not.toBeInTheDocument();
  });

  it('closes modal on Escape key', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders all four categories', () => {
    render(<KeyboardShortcutsModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Edition')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('AI/Chat')).toBeInTheDocument();
  });

  it('renders always visible Ready button', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ready'));
    expect(onClose).toHaveBeenCalled();
  });
});