export declare const E2E_INTERNAL_DOMAIN: string;
export declare const E2E_EMAIL_PATTERN: RegExp;
export declare function sanitizeRunId(raw: string): string;
export declare function assertE2EEmail(email: string): string;
export declare function buildE2EEmail(runId: string): string;
export declare function generateE2EPassword(): string;
