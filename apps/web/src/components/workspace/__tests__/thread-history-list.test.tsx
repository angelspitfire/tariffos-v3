// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThreadHistoryList } from '../molecules/ThreadHistoryList';

describe('ThreadHistoryList loading state', () => {
  it('renders a loading status skeleton and hides empty text while threads are loading', () => {
    render(
      <ThreadHistoryList
        threads={[]}
        loading
        activeThreadId={null}
        onSelectThread={vi.fn()}
        onDeleteThread={vi.fn()}
      />,
    );

    expect(screen.getByRole('status', { name: /Cargando conversaciones/i })).toBeTruthy();
    expect(screen.queryByText(/Tus clasificaciones aparecerán aquí/i)).toBeNull();
  });

  it('renders empty state copy when not loading and no threads exist', () => {
    render(
      <ThreadHistoryList
        threads={[]}
        loading={false}
        activeThreadId={null}
        onSelectThread={vi.fn()}
        onDeleteThread={vi.fn()}
      />,
    );

    expect(screen.queryByRole('status', { name: /Cargando conversaciones/i })).toBeNull();
    expect(screen.getByText(/Tus clasificaciones aparecerán aquí/i)).toBeTruthy();
  });
});
