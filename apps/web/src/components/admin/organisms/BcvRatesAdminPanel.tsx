'use client';

import { useCallback, useEffect, useState } from 'react';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import { adminFetchJson } from '@/lib/admin/admin-fetch';

interface RateRecord {
  id?: string;
  pair: string;
  rate: number;
  valueDate: string;
  source: string;
  fetchedAt?: string;
}

export function BcvRatesAdminPanel() {
  const [rates, setRates] = useState<RateRecord[]>([]);
  const [history, setHistory] = useState<RateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [pair, setPair] = useState<'USD/VES' | 'EUR/VES'>('USD/VES');
  const [manualRate, setManualRate] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const loadRates = useCallback(async () => {
    setLoading(true);
    try {
      const json = await adminFetchJson<{ rates?: RateRecord[]; history?: RateRecord[] }>(
        '/api/admin/exchange-rates/sync',
      );
      setRates(json.rates ?? []);
      setHistory(json.history ?? []);
    } catch (err) {
      setMessage({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Error al consultar tasas BCV.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRates();
  }, [loadRates]);

  const handleSync = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const json = await adminFetchJson<{ saved?: RateRecord[] }>(
        '/api/admin/exchange-rates/sync',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      );
      setMessage({ tone: 'ok', text: `Sincronización completada (${json.saved?.length ?? 0} tasas guardadas).` });
      await loadRates();
    } catch (err) {
      setMessage({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Error al sincronizar tasas BCV.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(manualRate);
    if (!Number.isFinite(numeric) || numeric <= 0 || manualReason.trim().length < 3) {
      setMessage({ tone: 'error', text: 'Indica una tasa válida y un motivo de al menos 3 caracteres.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await adminFetchJson<{ ok?: boolean }>('/api/admin/exchange-rates/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: { pair, rate: numeric, reason: manualReason.trim() } }),
      });
      setManualRate('');
      setManualReason('');
      setShowManual(false);
      setMessage({ tone: 'ok', text: `Tasa manual ${pair} registrada y auditada.` });
      await loadRates();
    } catch (err) {
      setMessage({
        tone: 'error',
        text: err instanceof Error ? err.message : 'No se pudo registrar la tasa manual.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <FunnelCard padding="p-5" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-ink-primary">Tasas Oficiales BCV (Interno)</h2>
          <p className="text-xs text-ink-muted">
            Sincronización automática L-S cada 2h (7:00–21:00 VET) para cálculos internos.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button type="button" onClick={() => setShowManual((v) => !v)} className="px-3 py-1.5 rounded-lg border border-border-strong bg-surface-subtle hover:bg-surface-hover font-semibold text-ink-primary">
            {showManual ? 'Cerrar manual' : 'Carga manual'}
          </button>
          <button type="button" onClick={handleSync} disabled={busy} className="px-3 py-1.5 rounded-lg bg-accent-solid text-white font-semibold disabled:opacity-50">
            {busy ? 'Sincronizando...' : 'Sincronizar BCV'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-ink-muted">Consultando tasas almacenadas...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['USD/VES', 'EUR/VES'] as const).map((code) => {
            const current = rates.find((r) => r.pair === code);
            return (
              <div key={code} className="rounded-lg border border-border-hairline bg-surface-subtle p-3">
                <div className="text-[11px] font-semibold text-ink-muted">{code}</div>
                <div className="text-lg font-mono font-bold text-ink-primary">
                  {current ? `Bs. ${current.rate.toFixed(4)}` : 'Sin registro'}
                </div>
                <div className="text-[11px] text-ink-subtle">
                  {current ? `Fecha valor ${current.valueDate} · ${current.source}` : 'Ejecuta una sincronización'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showManual && (
        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-border-hairline">
          <select aria-label="Par de divisa" value={pair} onChange={(e) => setPair(e.target.value as 'USD/VES' | 'EUR/VES')} className="rounded-lg border border-border-strong bg-surface-input px-2.5 py-2 text-ink-primary">
            <option value="USD/VES">USD/VES</option>
            <option value="EUR/VES">EUR/VES</option>
          </select>
          <input aria-label="Tasa manual" type="number" step="0.0001" value={manualRate} onChange={(e) => setManualRate(e.target.value)} placeholder="Ej. 52.4500" className="rounded-lg border border-border-strong bg-surface-input px-2.5 py-2 font-mono text-ink-primary" />
          <input aria-label="Motivo de carga manual" value={manualReason} onChange={(e) => setManualReason(e.target.value)} placeholder="Motivo auditable" className="rounded-lg border border-border-strong bg-surface-input px-2.5 py-2 text-ink-primary" />
          <button type="submit" disabled={busy} className="rounded-lg bg-accent-solid text-white font-semibold px-3 py-2 disabled:opacity-50">Registrar tasa</button>
        </form>
      )}

      {message && (
        <div className={`rounded-lg px-3 py-2 text-xs ${message.tone === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      {history.length > 0 && (
        <div className="text-xs border-t border-border-hairline pt-3 space-y-1">
          <div className="font-semibold text-ink-secondary">Últimos registros</div>
          {history.slice(0, 5).map((row, idx) => (
            <div key={row.id ?? `${row.pair}-${row.valueDate}-${idx}`} className="flex justify-between text-ink-muted font-mono text-[11px]">
              <span>{row.pair} · {row.valueDate} ({row.source})</span>
              <span className="text-ink-primary font-semibold">Bs. {row.rate.toFixed(4)}</span>
            </div>
          ))}
        </div>
      )}
    </FunnelCard>
  );
}
