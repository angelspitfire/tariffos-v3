export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;
export const MIN_FULL_NAME_LENGTH = 2;

const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const DIGIT_REGEX = /\d/;
const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9\s]/;

export type PasswordRuleId = 'minLength' | 'uppercase' | 'lowercase' | 'number' | 'special';

export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordRuleResult {
  id: PasswordRuleId;
  label: string;
  passed: boolean;
}

export interface PasswordPolicyEvaluation {
  rules: PasswordRuleResult[];
  passedCount: number;
  totalRules: number;
  strength: PasswordStrength;
  isValid: boolean;
  errorMessage: string | null;
}

const RULE_DEFINITIONS: ReadonlyArray<{
  id: PasswordRuleId;
  label: string;
  test: (password: string) => boolean;
}> = [
  {
    id: 'minLength',
    label: `Al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    test: (value) => value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'Una letra mayúscula (A-Z)',
    test: (value) => UPPERCASE_REGEX.test(value),
  },
  {
    id: 'lowercase',
    label: 'Una letra minúscula (a-z)',
    test: (value) => LOWERCASE_REGEX.test(value),
  },
  {
    id: 'number',
    label: 'Un número (0-9)',
    test: (value) => DIGIT_REGEX.test(value),
  },
  {
    id: 'special',
    label: 'Un carácter especial (!@#$%...)',
    test: (value) => SPECIAL_CHAR_REGEX.test(value),
  },
];

function computeStrength(password: string, passedCount: number): PasswordStrength {
  if (password.length === 0) return 'empty';
  if (passedCount <= 2) return 'weak';
  if (passedCount === 3) return 'fair';
  if (passedCount === 4) return 'good';
  return 'strong';
}

export function evaluatePasswordPolicy(password: string): PasswordPolicyEvaluation {
  const rules = RULE_DEFINITIONS.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(password),
  }));
  const passedCount = rules.filter((r) => r.passed).length;
  const totalRules = rules.length;

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      rules,
      passedCount,
      totalRules,
      strength: 'weak',
      isValid: false,
      errorMessage: `La contraseña no puede superar los ${MAX_PASSWORD_LENGTH} caracteres.`,
    };
  }

  const allPassed = passedCount === totalRules;
  return {
    rules,
    passedCount,
    totalRules,
    strength: computeStrength(password, passedCount),
    isValid: allPassed,
    errorMessage: allPassed
      ? null
      : `La contraseña debe cumplir la política de seguridad: mínimo ${MIN_PASSWORD_LENGTH} caracteres, mayúscula, minúscula, número y carácter especial.`,
  };
}

export function validateSignupCredentials(params: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): string | null {
  if (params.fullName.trim().length < MIN_FULL_NAME_LENGTH) {
    return 'Ingresa tu nombre completo (mínimo 2 caracteres).';
  }
  if (!EMAIL_FORMAT_REGEX.test(params.email.trim())) {
    return 'Ingresa un correo electrónico válido.';
  }
  const policy = evaluatePasswordPolicy(params.password);
  if (!policy.isValid) {
    return policy.errorMessage;
  }
  if (params.confirmPassword !== undefined && params.password !== params.confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }
  return null;
}
