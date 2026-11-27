'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';
import type { AuthTab } from '@/lib/funnel/login-actions';
import { MIN_PASSWORD_LENGTH } from '@/lib/funnel/password-policy';
import { FunnelButton } from '../atoms/FunnelButton';
import { FunnelInput } from '../atoms/FunnelField';
import { PasswordPolicyChecklist } from './PasswordPolicyChecklist';

export interface LoginEmailFormProps {
  tab: AuthTab;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  info: string | null;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onPasswordReset: () => void;
}

export function LoginEmailForm({
  tab,
  fullName,
  email,
  password,
  confirmPassword,
  isLoading,
  error,
  info,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onPasswordReset,
}: LoginEmailFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = tab === 'signup';
  const inputType = showPassword ? 'text' : 'password';

  const clearEmailButton =
    email.length > 0 && !isLoading ? (
      <button
        type="button"
        onClick={() => onEmailChange('')}
        aria-label="Limpiar correo electrónico"
        className="cursor-pointer rounded-md p-1 text-ink-subtle transition-colors hover:text-ink-primary"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    ) : undefined;

  const visibilityToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      className="cursor-pointer rounded-md p-1 text-ink-subtle transition-colors hover:text-ink-primary"
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Eye className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3.5">
      {isSignup ? (
        <FunnelInput
          label="Nombre completo"
          placeholder="Ej. María González"
          autoComplete="name"
          leftIcon={<User className="h-4 w-4" />}
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          required
        />
      ) : null}

      <FunnelInput
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="agente@tuagencia.com"
        leftIcon={<Mail className="h-4 w-4" />}
        rightSlot={clearEmailButton}
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        onBlur={() => {
          const trimmed = email.trim();
          if (trimmed !== email) onEmailChange(trimmed);
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'login-form-error' : undefined}
        required
      />

      <FunnelInput
        label="Contraseña"
        type={inputType}
        placeholder={
          isSignup
            ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres, mayúscula, número y símbolo`
            : 'Ingresa tu contraseña'
        }
        autoComplete={isSignup ? 'new-password' : 'current-password'}
        leftIcon={<Lock className="h-4 w-4" />}
        rightSlot={visibilityToggle}
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'login-form-error' : undefined}
        required
      />

      {isSignup ? (
        <>
          <FunnelInput
            label="Confirmar contraseña"
            type={inputType}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            required
          />
          <PasswordPolicyChecklist password={password} confirmPassword={confirmPassword} />
        </>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onPasswordReset}
            className="cursor-pointer text-[11px] font-medium text-accent-ink hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      {error ? (
        <p
          id="login-form-error"
          role="alert"
          className="text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      ) : null}

      {info ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-300">
          {info}
        </p>
      ) : null}

      <FunnelButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        {isSignup ? 'Crear cuenta gratis' : 'Ingresar con correo'}
      </FunnelButton>
    </form>
  );
}
