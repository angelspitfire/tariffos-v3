'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
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

  const visibilityToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      className="p-1 rounded-md text-ink-subtle hover:text-ink-primary transition-colors cursor-pointer"
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Eye className="w-4 h-4" aria-hidden="true" />
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
          leftIcon={<User className="w-4 h-4" />}
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          required
        />
      ) : null}

      <FunnelInput
        label="Correo electrónico"
        type="email"
        placeholder="agente@tuagencia.com"
        autoComplete="email"
        leftIcon={<Mail className="w-4 h-4" />}
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
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
        leftIcon={<Lock className="w-4 h-4" />}
        rightSlot={visibilityToggle}
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        required
      />

      {isSignup ? (
        <>
          <FunnelInput
            label="Confirmar contraseña"
            type={inputType}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            leftIcon={<Lock className="w-4 h-4" />}
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
            onClick={onPasswordReset}
            className="text-[11px] font-medium text-accent-ink hover:underline cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      {error ? (
        <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}

      {info ? (
        <p className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/35 p-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          {info}
        </p>
      ) : null}

      <FunnelButton
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        {isSignup ? 'Crear cuenta gratis' : 'Ingresar con correo'}
      </FunnelButton>
    </form>
  );
}
