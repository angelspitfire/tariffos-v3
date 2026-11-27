import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readPendingQuery, savePendingQuery } from '@/lib/funnel/funnel-storage';
import { usePendingQueryAutorun } from './use-pending-query-autorun';

function Harness({
  cloudMode,
  usageLoaded,
  readOnlyReason,
  onRunQuery,
}: {
  cloudMode: boolean;
  usageLoaded: boolean;
  readOnlyReason: string | null;
  onRunQuery: (query: string) => void;
}) {
  const saved = usePendingQueryAutorun({ cloudMode, usageLoaded, readOnlyReason, onRunQuery });
  return <div data-testid="saved">{saved ?? ''}</div>;
}

describe('usePendingQueryAutorun', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('does NOT consume pendingQuery while cloud usage is loading or account is read-only', () => {
    savePendingQuery('Ecógrafo Doppler');
    const onRunQuery = vi.fn();

    const { rerender } = render(
      <Harness cloudMode usageLoaded={false} readOnlyReason={null} onRunQuery={onRunQuery} />,
    );
    expect(onRunQuery).not.toHaveBeenCalled();
    expect(readPendingQuery()).toBe('Ecógrafo Doppler');

    rerender(
      <Harness
        cloudMode
        usageLoaded
        readOnlyReason="Activa tu Piloto Operativo"
        onRunQuery={onRunQuery}
      />,
    );
    expect(onRunQuery).not.toHaveBeenCalled();
    expect(readPendingQuery()).toBe('Ecógrafo Doppler');
    expect(screen.getByTestId('saved')).toHaveTextContent('Ecógrafo Doppler');

    rerender(<Harness cloudMode usageLoaded readOnlyReason={null} onRunQuery={onRunQuery} />);
    expect(onRunQuery).toHaveBeenCalledTimes(1);
    expect(onRunQuery).toHaveBeenCalledWith('Ecógrafo Doppler');
    expect(readPendingQuery()).toBeNull();
  });
});
