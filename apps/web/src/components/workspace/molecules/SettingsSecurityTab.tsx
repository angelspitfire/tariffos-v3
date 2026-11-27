'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { PasswordPolicyChecklist } from '@/components/funnel/molecules/PasswordPolicyChecklist';
import {
  checkMustChangePassword,
  executePasswordChange,
} from '@/lib/workspace/change-password';

export interface SettingsSecurityTabProps {
  mustChangePassword?: boolean;
  cloudMode?: boolean;
}

export function SettingsSecurityTab({ mustChangePassword, cloudMode }: SettingsSecurityTabProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [flaggedTemp, setFlaggedTemp] = useState(Boolean(mustChangePassword));
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (mustChangePassword !== undefined) {
      setFlaggedTemp(mustChangePassword);
      return;
    }
    let active = true;
    void checkMustChangePassword(cloudMode).then((flag) => {
      if (active) setFlaggedTemp(flag);
    });
    return () => {
      active = false;
    };
  }, [mustChangePassword, cloudMode]);

  const handleUpdatePassword = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const result = await executePasswordChange({
        newPassword,
        confirmPassword,
        isCloud: cloudMode,
      });
      if (!result.ok) {
        setFeedback({ tone: 'error', text: result.error ?? 'No se pudo actualizar la contraseña.' });
        return;
      }
      setNewPassword('');
      setConfirmPassword('');
      setFlaggedTemp(false);
      setFeedback({ tone: 'ok', text: result.message ?? 'Contraseña actualizada.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-border-hairline pb-4">
        <h3 className="text-sm font-semibold text-ink-primary">Seguridad y contraseña</h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          Actualiza tu contraseña de acceso sin cerrar tu sesión de trabajo actual.
        </p>
      </div>

      {flaggedTemp ? (
        <div className="flex items-start gap-2.5 rounded-card border border-amber-500/35 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Ingresaste con una <strong>contraseña temporal</strong>. Por seguridad, define una contraseña personal ahora.
          </span>
        </div>
      ) : null}

      <div className="space-y-3 rounded-card border border-border-subtle bg-surface-muted/60 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-xs font-medium text-ink-secondary">Nueva contraseña</span>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-medium text-ink-secondary">Confirmar nueva contraseña</span>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Repite la nueva contraseña"
              className="w-full rounded-field border border-border-subtle bg-surface-input px-3 py-2 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded text-[11px] font-medium text-ink-muted transition-colors hover:text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
        >
          {showPasswords ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
          {showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
        </button>

        <PasswordPolicyChecklist password={newPassword} confirmPassword={confirmPassword} />

        {feedback ? (
          <div
            role={feedback.tone === 'error' ? 'alert' : 'status'}
            className={`flex items-center gap-2 rounded-field px-3 py-2 text-xs font-medium ${
              feedback.tone === 'ok'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {feedback.tone === 'ok' ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
            <span>{feedback.text}</span>
          </div>
        ) : null}

        <div className="pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleUpdatePassword()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-surface-inverted px-4 py-2 text-xs font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none disabled:opacity-50"
          >
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            {busy ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </div>
      </div>
    </div>
  );
}
