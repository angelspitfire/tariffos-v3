// Keyboard shortcuts constants
// Extracted from KeyboardShortcutsModal to reduce file size

export interface Shortcut {
  key: string;
  description: string;
  category: 'navigation' | 'edition' | 'actions' | 'ai';
}

export const shortcuts: Shortcut[] = [
  // Navigation
  { key: '?', description: 'Show/hide this modal', category: 'navigation' },
  { key: 'Escape', description: 'Close current modal', category: 'navigation' },
  { key: '←', description: 'Navigate to previous filing', category: 'navigation' },
  { key: '→', description: 'Navigate to next filing', category: 'navigation' },
  { key: 'Home', description: 'Go to first filing', category: 'navigation' },
  { key: 'End', description: 'Go to last filing', category: 'navigation' },

  // Edition
  { key: 'Ctrl + Z', description: 'Undo action', category: 'edition' },
  { key: 'Ctrl + Y', description: 'Redo action', category: 'edition' },
  { key: 'Delete', description: 'Delete selection', category: 'edition' },
  { key: 'Ctrl + S', description: 'Save changes', category: 'edition' },

  // Actions
  { key: 'Ctrl + Shift + P', description: 'Open command palette', category: 'actions' },
  { key: 'Ctrl + Shift + U', description: 'Load invoice', category: 'actions' },
  { key: 'Ctrl + Shift + N', description: 'New filing', category: 'actions' },
  { key: 'Enter', description: 'Select or approve', category: 'actions' },

  // AI/Chat
  { key: 'Ctrl + Shift + I', description: 'Interact with AI', category: 'ai' },
  { key: 'Ctrl + Shift + C', description: 'Open chat', category: 'ai' },
  { key: 'Ctrl + Enter', description: 'Send message', category: 'ai' },
];

export const categoryLabels: Record<'navigation' | 'edition' | 'actions' | 'ai', string> = {
  navigation: 'Navigation',
  edition: 'Edition',
  actions: 'Actions',
  ai: 'AI/Chat',
};
