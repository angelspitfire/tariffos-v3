import { describe, expect, it } from 'vitest';
import {
  evaluatePasswordPolicy,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  validateSignupCredentials,
} from './password-policy';

describe('password-policy', () => {
  it('exposes explicit password length bounds', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(MAX_PASSWORD_LENGTH).toBe(72);
  });

  it('rejects weak passwords missing length, case, digit, or special character', () => {
    expect(evaluatePasswordPolicy('123456').isValid).toBe(false);
    expect(evaluatePasswordPolicy('solominusculas').isValid).toBe(false);
    expect(evaluatePasswordPolicy('SinNumero!').isValid).toBe(false);
    expect(evaluatePasswordPolicy('SinSimbolo123').isValid).toBe(false);
    expect(evaluatePasswordPolicy('SINMINUS1!').isValid).toBe(false);
  });

  it('accepts strong passwords meeting all five policy requirements and scores strength as strong', () => {
    const evaluation = evaluatePasswordPolicy('Aduanas!2026');
    expect(evaluation.isValid).toBe(true);
    expect(evaluation.passedCount).toBe(5);
    expect(evaluation.strength).toBe('strong');
    expect(evaluation.errorMessage).toBeNull();
  });

  it('rejects passwords exceeding bcrypt 72-character ceiling', () => {
    const tooLong = `Aa1!${'x'.repeat(72)}`;
    const evaluation = evaluatePasswordPolicy(tooLong);
    expect(evaluation.isValid).toBe(false);
    expect(evaluation.errorMessage).toMatch(/72 caracteres/i);
  });

  it('validates signup credentials including full name, email format, policy, and confirmation match', () => {
    expect(
      validateSignupCredentials({
        fullName: 'A',
        email: 'ana@agencia.ve',
        password: 'Aduanas!2026',
        confirmPassword: 'Aduanas!2026',
      }),
    ).toMatch(/nombre completo/i);

    expect(
      validateSignupCredentials({
        fullName: 'Ana Pérez',
        email: 'correo-invalido',
        password: 'Aduanas!2026',
        confirmPassword: 'Aduanas!2026',
      }),
    ).toMatch(/correo electrónico válido/i);

    expect(
      validateSignupCredentials({
        fullName: 'Ana Pérez',
        email: 'ana@agencia.ve',
        password: 'clave123',
        confirmPassword: 'clave123',
      }),
    ).toMatch(/política de seguridad|8 caracteres|mayúscula|carácter especial/i);

    expect(
      validateSignupCredentials({
        fullName: 'Ana Pérez',
        email: 'ana@agencia.ve',
        password: 'Aduanas!2026',
        confirmPassword: 'Aduanas!2027',
      }),
    ).toMatch(/no coinciden/i);

    expect(
      validateSignupCredentials({
        fullName: 'Ana Pérez',
        email: 'ana@agencia.ve',
        password: 'Aduanas!2026',
        confirmPassword: 'Aduanas!2026',
      }),
    ).toBeNull();
  });
});
