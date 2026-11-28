import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertE2EEmail,
  buildE2EEmail,
  generateE2EPassword,
  sanitizeRunId,
} from './lib/e2e-account-helpers.mjs';

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

loadEnvFile(path.join(ROOT_DIR, '.env.local'));
loadEnvFile(path.join(ROOT_DIR, 'apps/web/.env.local'));

function flagValue(args: readonly string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx === -1 ? undefined : args[idx + 1];
}

function getSupabaseAdminConfig(): { url: string; headers: Record<string, string> } {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }
  return {
    url,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  };
}

async function findAuthUsersByEmail(email: string): Promise<AuthUser[]> {
  const { url, headers } = getSupabaseAdminConfig();
  const matches: AuthUser[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=200`, { headers });
    if (!res.ok) throw new Error(`Supabase listUsers HTTP ${res.status}: ${await res.text()}`);
    const payload = (await res.json()) as { users?: AuthUser[] };
    const users = payload.users ?? [];
    for (const user of users) {
      if (user.email?.trim().toLowerCase() === email) matches.push(user);
    }
    if (users.length < 200) break;
  }
  return matches;
}

async function upsertAuthUser(email: string, password: string): Promise<string> {
  const { url, headers } = getSupabaseAdminConfig();
  const [existing] = await findAuthUsersByEmail(email);
  const metadata = { full_name: 'E2E Broker', must_change_password: false };
  if (existing) {
    const res = await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        password,
        email_confirm: true,
        ban_duration: 'none',
        user_metadata: { ...(existing.user_metadata ?? {}), ...metadata },
      }),
    });
    if (!res.ok) throw new Error(`Supabase updateUser HTTP ${res.status}: ${await res.text()}`);
    return existing.id;
  }
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: metadata }),
  });
  if (!res.ok) throw new Error(`Supabase createUser HTTP ${res.status}: ${await res.text()}`);
  const created = (await res.json()) as { id: string };
  return created.id;
}

async function runSetup(runId: string, emitGithubEnv: boolean): Promise<void> {
  const safeRunId = sanitizeRunId(runId);
  const email = assertE2EEmail(buildE2EEmail(safeRunId));
  const password = generateE2EPassword();
  const userId = await upsertAuthUser(email, password);
  const { getUnscopedSystemPrisma } = await import('@tariffos/database');
  const prisma = getUnscopedSystemPrisma();

  try {
    const existing = await prisma.tenant.findFirst({ where: { ownerEmail: email } });
    const tenant = existing
      ? await prisma.tenant.update({
          where: { id: existing.id },
          data: { isOnboarded: true, billingStatus: 'ACTIVE', billingLimit: 50, countryCode: 'VE' },
        })
      : await prisma.tenant.create({
          data: {
            name: `E2E Agency ${safeRunId}`,
            ownerEmail: email,
            ownerName: 'E2E Broker',
            isOnboarded: true,
            billingStatus: 'ACTIVE',
            billingLimit: 50,
            countryCode: 'VE',
          },
        });

    await prisma.membership.upsert({
      where: { userId_tenantId: { userId, tenantId: tenant.id } },
      update: { role: 'OWNER', email, name: 'E2E Broker' },
      create: { userId, tenantId: tenant.id, role: 'OWNER', email, name: 'E2E Broker' },
    });
    await prisma.userProfile.upsert({
      where: { id: userId },
      update: { fullName: 'E2E Broker' },
      create: { id: userId, fullName: 'E2E Broker', role: 'user' },
    });

    if (emitGithubEnv && process.env.GITHUB_ENV) {
      console.log(`::add-mask::${password}`);
      appendFileSync(
        process.env.GITHUB_ENV,
        `E2E_BROKER_EMAIL=${email}\nE2E_BROKER_PASSWORD=${password}\nE2E_TENANT_ID=${tenant.id}\nE2E_USER_ID=${userId}\n`,
      );
    }
    console.log(JSON.stringify({ ok: true, action: 'setup', email, tenantId: tenant.id, userId }));
  } finally {
    await prisma.$disconnect();
  }
}

async function runTeardown(emailInput: string): Promise<void> {
  const email = assertE2EEmail(emailInput);
  const { url, headers } = getSupabaseAdminConfig();
  const { getUnscopedSystemPrisma } = await import('@tariffos/database');
  const prisma = getUnscopedSystemPrisma();
  const userIds = new Set<string>();

  try {
    const tenants = await prisma.tenant.findMany({ where: { ownerEmail: email }, select: { id: true } });
    const memberships = await prisma.membership.findMany({ where: { email }, select: { userId: true } });
    for (const m of memberships) userIds.add(m.userId);

    for (const { id: tenantId } of tenants) {
      await prisma.$transaction(async (tx) => {
        await tx.decisionArtifact.deleteMany({ where: { tenantId } });
        await tx.filingStatusEvent.deleteMany({ where: { tenantId } });
        await tx.filingLine.deleteMany({ where: { tenantId } });
        await tx.batchJobItem.deleteMany({ where: { tenantId } });
        await tx.batchJob.deleteMany({ where: { tenantId } });
        await tx.chatMessage.deleteMany({ where: { tenantId } });
        await tx.fileMetadata.deleteMany({ where: { tenantId } });
        await tx.classificationSession.deleteMany({ where: { tenantId } });
        await tx.filing.deleteMany({ where: { tenantId } });
        await tx.client.deleteMany({ where: { tenantId } });
        await tx.payment.deleteMany({ where: { tenantId } });
        await tx.productMaster.deleteMany({ where: { tenantId } });
        await tx.customClassificationRule.deleteMany({ where: { tenantId } });
        await tx.usageRecord.deleteMany({ where: { tenantId } });
        await tx.billingPeriod.deleteMany({ where: { tenantId } });
        await tx.invitation.deleteMany({ where: { tenantId } });
        await tx.langGraphCheckpointWrite.deleteMany({ where: { tenantId } });
        await tx.langGraphCheckpoint.deleteMany({ where: { tenantId } });
        await tx.agentSession.deleteMany({ where: { tenantId } });
        await tx.dashboardIndicator.deleteMany({ where: { tenantId } });
        await tx.membership.deleteMany({ where: { tenantId } });
        await tx.tenant.delete({ where: { id: tenantId } });
      });
    }

    const authUsers = await findAuthUsersByEmail(email);
    for (const u of authUsers) userIds.add(u.id);
    if (userIds.size > 0) {
      await prisma.userProfile.deleteMany({ where: { id: { in: [...userIds] } } });
    }
    for (const uid of authUsers) {
      await fetch(`${url}/auth/v1/admin/users/${uid.id}`, { method: 'DELETE', headers });
    }
    console.log(JSON.stringify({ ok: true, action: 'teardown', email, tenantsDeleted: tenants.length }));
  } finally {
    await prisma.$disconnect();
  }
}

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;
  if (!command || command === '--help' || command === '-h') {
    console.log('Usage: pnpm e2e:accounts <setup|teardown> --run-id <id> [--emit-github-env] [--email <e2e.*@tariffos.internal>]');
    process.exit(command ? 0 : 1);
  }
  const runId = flagValue(rest, '--run-id');
  const explicitEmail = flagValue(rest, '--email');
  if (command === 'setup') {
    if (!runId) throw new Error('--run-id is required for setup');
    await runSetup(runId, rest.includes('--emit-github-env'));
    return;
  }
  if (command === 'teardown') {
    const targetEmail = explicitEmail ?? (runId ? buildE2EEmail(runId) : '');
    if (!targetEmail) throw new Error('--run-id or --email is required for teardown');
    await runTeardown(targetEmail);
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

void main().catch((err: unknown) => {
  console.error('e2e-accounts failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
